import { parsePlate } from './parsePlate';
import type { FieldResult } from './types';

export type ParsedWeighingTicket = {
  matricula: FieldResult<string> | null;
  pesoBrutoKg: FieldResult<number> | null;
  taraKg: FieldResult<number> | null;
  pesoNetoKg: FieldResult<number> | null;
  fecha: FieldResult<string> | null;
  hora: FieldResult<string> | null;
  numeroTicket: FieldResult<string> | null;
};

const collapseWhitespace = (text: string): string => text.replace(/\s+/g, ' ').trim();

const parseNumber = (raw: string): number | null => {
  const value = raw.trim();
  if (!/^\d[\d.,]*$/.test(value)) return null;

  const dots = (value.match(/\./g) ?? []).length;
  const commas = (value.match(/,/g) ?? []).length;

  if (dots === 0 && commas === 0) return Number.parseInt(value, 10);

  if (dots > 0 && commas > 0) {
    const decimalSeparator = dots > commas ? '.' : ',';
    const lastIndex = value.lastIndexOf(decimalSeparator);
    const intPart = value.slice(0, lastIndex).replace(/[.,]/g, '');
    const decPart = value.slice(lastIndex + 1);
    return Number.parseFloat(`${intPart}.${decPart}`);
  }

  const separator = dots ? '.' : ',';
  const parts = value.split(separator);
  if (parts.length === 2 && parts[1].length === 3) {
    return Number.parseInt(parts.join(''), 10);
  }
  return Number.parseFloat(value.replace(separator, '.'));
};

const extractWeight = (text: string, label: RegExp): FieldResult<number> | null => {
  const match = label.exec(text);
  if (!match) return null;

  const tail = text.slice(match.index + match[0].length, match.index + match[0].length + 24);
  const valueMatch = /([\d.,]+)\s*(kg|kgs|t|tn|tm)?/i.exec(tail);
  if (!valueMatch) return null;

  const parsed = parseNumber(valueMatch[1]);
  if (parsed === null) return null;

  const unit = (valueMatch[2] ?? '').toLowerCase();
  const value = ['t', 'tn', 'tm'].includes(unit) ? parsed * 1000 : parsed;
  const fullLabel = match[0];
  const confidence = /peso/i.test(fullLabel) ? 0.97 : 0.85;

  return { value, raw: valueMatch[0].trim(), confidence };
};

const extractFecha = (text: string): FieldResult<string> | null => {
  const match = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/.exec(text);
  if (!match) return null;
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return { value: `${day}/${month}/${year}`, raw: match[0], confidence: 0.96 };
};

const extractHora = (text: string): FieldResult<string> | null => {
  const match = /\b(\d{1,2}):(\d{2})\b/.exec(text);
  if (!match) return null;
  return { value: `${match[1].padStart(2, '0')}:${match[2]}`, raw: match[0], confidence: 0.96 };
};

const extractNumeroTicket = (text: string): FieldResult<string> | null => {
  const ticket = /\bticket\b[:\s]*#?\s*([a-z0-9_-]{2,})/i.exec(text);
  if (ticket) return { value: ticket[1].trim(), raw: ticket[0], confidence: 0.9 };

  const partida = /\b(?:parte|albarán|albaran)\b[:\s]*#?\s*(\d{2,})/i.exec(text);
  if (partida) return { value: partida[1], raw: partida[0], confidence: 0.85 };

  const numero = /\b(?:n[º°o]\s*|número\s*|numero\s*)[:#.]?\s*(\d{3,})/i.exec(text);
  if (numero) return { value: numero[1], raw: numero[0], confidence: 0.8 };

  return null;
};

export const parseWeighingTicket = (text: string): ParsedWeighingTicket => {
  const normalized = collapseWhitespace(text);
  const plate = parsePlate(normalized);

  return {
    matricula: plate ? { value: plate.formatted, raw: plate.rawCleaned, confidence: plate.confidence } : null,
    pesoBrutoKg: extractWeight(normalized, /(?:peso\s*)?bruto/i),
    taraKg: extractWeight(normalized, /(?:peso\s*)?tara\b/i),
    pesoNetoKg: extractWeight(normalized, /(?:peso\s*)?neto\b/i),
    fecha: extractFecha(normalized),
    hora: extractHora(normalized),
    numeroTicket: extractNumeroTicket(normalized),
  };
};