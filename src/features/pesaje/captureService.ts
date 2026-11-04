import { db } from '../offline/db';
import { enqueueOutbox, generateClientRequestId } from '../offline/syncQueue';
import type { CapturaRecord } from '../offline/db';
import type { CapturaFotos, FotoClave } from './types/captura.types';

export const FOTOS_OBLIGATORIAS: readonly FotoClave[] = ['frente', 'trasera', 'lateral', 'ticket'];

export type SaveCapturaInput = {
  transporteId: number;
  parcelaId: string;
  camionMatricula: string;
  camioneroDni: string;
  fechaCarga: string;
  toneladasCargadas: number;
  tipoMadera: string;
  destino: string;
  centroId?: number;
  parcelaReferenciaCatastral?: string;
  matricula: string;
  pesoNetoKg: number | null;
  pesoBrutoKg: number | null;
  taraKg: number | null;
  numeroTicket: string | null;
  fecha: string | null;
  hora: string | null;
  fotos: CapturaFotos;
  ocrConfidence: number;
};

export const tieneTodasLasFotos = (fotos: CapturaFotos): boolean =>
  FOTOS_OBLIGATORIAS.every((clave) => Boolean(fotos[clave]));

export const saveCapturaTransporte = async (input: SaveCapturaInput): Promise<string> => {
  if (!tieneTodasLasFotos(input.fotos)) {
    throw new Error('Las 4 fotos son obligatorias');
  }

  const id = generateClientRequestId();
  await db.transaction('rw', db.outbox, db.capturas, async () => {
    await enqueueOutbox({
      type: 'TRANSPORTE_UPDATE',
      method: 'PUT',
      endpoint: `/transportes/${input.transporteId}`,
      payload: {
        parcelaId: input.parcelaId,
        camionMatricula: input.camionMatricula,
        camioneroDni: input.camioneroDni,
        fechaCarga: input.fechaCarga,
        toneladasCargadas: input.toneladasCargadas,
        tipoMadera: input.tipoMadera,
        destino: input.destino,
        centroId: input.centroId,
        parcelaReferenciaCatastral: input.parcelaReferenciaCatastral,
        matricula: input.matricula,
        pesoNetoKg: input.pesoNetoKg,
        pesoBrutoKg: input.pesoBrutoKg,
        taraKg: input.taraKg,
        numeroTicket: input.numeroTicket,
        fechaPesaje: input.fecha,
        horaPesaje: input.hora,
        fotos: input.fotos,
        clientRequestId: id,
      },
      clientRequestId: id,
    });
    await db.capturas.put({
      id,
      transporteId: input.transporteId,
      matricula: input.matricula,
      pesoNetoKg: input.pesoNetoKg,
      pesoBrutoKg: input.pesoBrutoKg,
      taraKg: input.taraKg,
      numeroTicket: input.numeroTicket,
      fecha: input.fecha,
      hora: input.hora,
      fotoFrente: input.fotos.frente,
      fotoTrasera: input.fotos.trasera,
      fotoLateral: input.fotos.lateral,
      fotoTicket: input.fotos.ticket,
      createdAt: Date.now(),
      ocrConfidence: input.ocrConfidence,
      synced: false,
    });
  });
  return id;
};

export const getLocalCapturas = async (): Promise<CapturaRecord[]> => {
  return db.capturas.orderBy('createdAt').reverse().toArray();
};

export const getLocalCapturasByTransporte = async (transporteId: number): Promise<CapturaRecord[]> => {
  return db.capturas.where('transporteId').equals(transporteId).sortBy('createdAt');
};

export const deleteLocalCaptura = async (id: string): Promise<void> => {
  await db.capturas.delete(id);
};