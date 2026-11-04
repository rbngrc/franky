import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db';
import { enqueueOutbox, flushOutbox, generateClientRequestId } from '../syncQueue';

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: online });
};

const okResponse = () => new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('syncQueue', () => {
  beforeEach(async () => {
    setOnline(true);
    await Promise.all([db.outbox.clear(), db.transportesCache.clear()]);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    setOnline(true);
  });

  it('genera un clientRequestId único', () => {
    const a = generateClientRequestId();
    const b = generateClientRequestId();
    expect(a).not.toBe(b);
  });

  it('encola una operación pendiente con idempotencia', async () => {
    const entry = await enqueueOutbox({
      type: 'PESAJE',
      endpoint: '/transportes/1/pesaje',
      method: 'POST',
      payload: { pesoNeto: 21.5 },
    });

    expect(entry.status).toBe('pending');
    expect(entry.key).toBe(entry.clientRequestId);
    expect(entry.payload.clientRequestId).toBe(entry.clientRequestId);
    expect(entry.attemptCount).toBe(0);

    const duplicate = await enqueueOutbox({
      type: 'PESAJE',
      endpoint: '/transportes/1/pesaje',
      method: 'POST',
      payload: { pesoNeto: 21.5 },
      clientRequestId: entry.clientRequestId,
    });

    expect(duplicate.key).toBe(entry.key);
    expect(await db.outbox.count()).toBe(1);
  });

  it('no sincroniza sin conexión', async () => {
    setOnline(false);
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await enqueueOutbox({ type: 'P', endpoint: '/x', method: 'POST', payload: {} });
    const result = await flushOutbox();

    expect(result).toEqual({ flushed: 0, failed: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await db.outbox.count()).toBe(1);
  });

  it('envía las pendientes y las borra al tener éxito', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse());

    await enqueueOutbox({ type: 'P', endpoint: '/a', method: 'POST', payload: { v: 1 }, clientRequestId: 'req-a' });
    await enqueueOutbox({ type: 'P', endpoint: '/a', method: 'PUT', payload: { v: 2 }, clientRequestId: 'req-b' });

    const result = await flushOutbox();

    expect(result).toEqual({ flushed: 2, failed: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = [fetchMock.mock.calls[0], fetchMock.mock.calls[1]];
    expect(firstCall[0]).toBe('/api/v1/a');
    expect(secondCall[0]).toBe('/api/v1/a');
    expect(firstCall[1]?.method).toBe('POST');
    expect(secondCall[1]?.method).toBe('PUT');
    expect(firstCall[1]?.headers).toMatchObject({ 'X-Client-Request-Id': 'req-a' });
    const body = JSON.parse(String(firstCall[1]?.body));
    expect(body.clientRequestId).toBe('req-a');
    expect(await db.outbox.count()).toBe(0);
  });

  it('marca la captura como sincronizada al enviar un TRANSPORTE_UPDATE', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse());
    const id = 'req-sync';
    await db.capturas.put({
      id,
      transporteId: 7,
      matricula: '1234 ABC',
      pesoNetoKg: 13280,
      pesoBrutoKg: 26780,
      taraKg: 13500,
      numeroTicket: '001234',
      fecha: '12/05/2026',
      hora: '08:45',
      fotoFrente: 'f',
      createdAt: Date.now(),
      ocrConfidence: 0.8,
      synced: false,
    });
    await enqueueOutbox({
      type: 'TRANSPORTE_UPDATE',
      endpoint: '/transportes/7',
      method: 'PUT',
      payload: { pesoNetoKg: 13280 },
      clientRequestId: id,
    });

    const result = await flushOutbox();

    expect(result).toEqual({ flushed: 1, failed: 0 });
    expect(await db.outbox.count()).toBe(0);
    expect((await db.capturas.get(id))?.synced).toBe(true);
  });

  it('marca como failed los errores HTTP no recuperables', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 400 }));

    await enqueueOutbox({ type: 'P', endpoint: '/a', method: 'POST', payload: {}, clientRequestId: 'req-fail' });
    const result = await flushOutbox();

    expect(result).toEqual({ flushed: 0, failed: 1 });
    const entry = await db.outbox.get('req-fail');
    expect(entry?.status).toBe('failed');
    expect(entry?.lastError).toBe('HTTP 400');
    expect(entry?.attemptCount).toBe(1);
  });

  it('conserva como pending los errores de red y detiene el flujo', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await enqueueOutbox({ type: 'P', endpoint: '/a', method: 'POST', payload: {}, clientRequestId: 'req-net' });
    const result = await flushOutbox();

    expect(result).toEqual({ flushed: 0, failed: 1 });
    const entry = await db.outbox.get('req-net');
    expect(entry?.status).toBe('pending');
    expect(entry?.lastError).toBe('Sin conexión');
    expect(entry?.attemptCount).toBe(1);
  });
});