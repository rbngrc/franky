import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../offline/db';
import { saveCapturaTransporte, tieneTodasLasFotos } from '../captureService';
import type { CapturaFotos } from '../types/captura.types';

const baseCaptura = () => ({
  transporteId: 7,
  parcelaId: 'parcela-1',
  camionMatricula: '1234 ABC',
  camioneroDni: '12345678Z',
  fechaCarga: '2026-05-12',
  toneladasCargadas: 13.28,
  tipoMadera: 'PINO',
  destino: 'Serradora Norte',
  centroId: 3,
  parcelaReferenciaCatastral: '00000A001',
  matricula: '1234 ABC',
  pesoNetoKg: 13280,
  pesoBrutoKg: 26780,
  taraKg: 13500,
  numeroTicket: '001234',
  fecha: '12/05/2026',
  hora: '08:45',
  fotos: {
    frente: 'data:image/jpeg;base64,frente',
    trasera: 'data:image/jpeg;base64,trasera',
    lateral: 'data:image/jpeg;base64,lateral',
    ticket: 'data:image/jpeg;base64,ticket',
  },
  ocrConfidence: 0.88,
});

describe('captureService', () => {
  beforeEach(async () => {
    await Promise.all([db.outbox.clear(), db.capturas.clear()]);
  });

  it('guarda la captura localmente y encola un PUT como TRANSPORTE_UPDATE', async () => {
    const id = await saveCapturaTransporte(baseCaptura());

    const local = await db.capturas.get(id);
    expect(local).toBeDefined();
    expect(local?.transporteId).toBe(7);
    expect(local?.matricula).toBe('1234 ABC');
    expect(local?.pesoNetoKg).toBe(13280);
    expect(local?.fotoFrente).toBe('data:image/jpeg;base64,frente');
    expect(local?.fotoTicket).toBe('data:image/jpeg;base64,ticket');
    expect(local?.synced).toBe(false);
    expect(local?.createdAt).toBeTypeOf('number');

    const entry = await db.outbox.get(id);
    expect(entry).toBeDefined();
    expect(entry?.type).toBe('TRANSPORTE_UPDATE');
    expect(entry?.method).toBe('PUT');
    expect(entry?.endpoint).toBe('/transportes/7');
    expect(entry?.status).toBe('pending');
    expect(entry?.payload.clientRequestId).toBe(id);
    expect(entry?.payload.camionMatricula).toBe('1234 ABC');
    expect(entry?.payload.fechaPesaje).toBe('12/05/2026');
    expect(entry?.payload.horaPesaje).toBe('08:45');
    expect(entry?.payload.centroId).toBe(3);
    expect(entry?.payload.fotos).toEqual(baseCaptura().fotos);
  });

  it('genera un id distinto para cada captura guardada', async () => {
    const a = await saveCapturaTransporte(baseCaptura());
    const b = await saveCapturaTransporte({ ...baseCaptura(), matricula: '5678 DEF' });

    expect(a).not.toBe(b);
    expect(await db.capturas.count()).toBe(2);
    expect(await db.outbox.count()).toBe(2);
  });

  it('rechaza si faltan fotos obligatorias', async () => {
    const fotos: CapturaFotos = { ...baseCaptura().fotos };
    delete fotos.frente;
    await expect(
      saveCapturaTransporte({ ...baseCaptura(), fotos }),
    ).rejects.toThrow('Las 4 fotos son obligatorias');

    expect(await db.capturas.count()).toBe(0);
    expect(await db.outbox.count()).toBe(0);
  });

  it('tieneTodasLasFotos requiere frente, trasera, lateral y ticket', () => {
    expect(tieneTodasLasFotos(baseCaptura().fotos)).toBe(true);
    expect(tieneTodasLasFotos({ frente: 'a', trasera: 'b', lateral: 'c' })).toBe(false);
    expect(tieneTodasLasFotos({})).toBe(false);
  });
});