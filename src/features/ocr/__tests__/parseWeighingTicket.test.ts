import { describe, expect, it } from 'vitest';
import { parseWeighingTicket } from '../parseWeighingTicket';

const TICKET = `
BASCULA MUNICIPAL Nº 001
FECHA: 12/05/2026 08:45
MATRICULA: 1234 ABC
PESO BRUTO: 26780 kg
TARA: 13500 kg
PESO NETO: 13280 kg
`;

describe('parseWeighingTicket', () => {
  it('extrae todos los campos de un ticket completo', () => {
    const parsed = parseWeighingTicket(TICKET);

    expect(parsed.matricula?.value).toBe('1234 ABC');
    expect(parsed.pesoBrutoKg?.value).toBe(26780);
    expect(parsed.taraKg?.value).toBe(13500);
    expect(parsed.pesoNetoKg?.value).toBe(13280);
    expect(parsed.fecha?.value).toBe('12/05/2026');
    expect(parsed.hora?.value).toBe('08:45');
    expect(parsed.numeroTicket?.value).toBe('001');
  });

  it('convierte toneladas a kilogramos', () => {
    const parsed = parseWeighingTicket('PESO BRUTO: 26.78 t TARA: 13.5 t NETO: 13.28 t');
    expect(parsed.pesoBrutoKg?.value).toBe(26780);
    expect(parsed.taraKg?.value).toBe(13500);
    expect(parsed.pesoNetoKg?.value).toBe(13280);
  });

  it('gestiona separadores de miles españoles', () => {
    const parsed = parseWeighingTicket('BRUTO: 26.780 kg / NETO: 13.280 kg');
    expect(parsed.pesoBrutoKg?.value).toBe(26780);
    expect(parsed.pesoNetoKg?.value).toBe(13280);
  });

  it('reconoce decimales con coma', () => {
    const parsed = parseWeighingTicket('TARA: 13,5');
    expect(parsed.taraKg?.value).toBe(13.5);
  });

  it('reconoce fecha con guiones y año corto', () => {
    const parsed = parseWeighingTicket('FECHA: 05-06-26');
    expect(parsed.fecha?.value).toBe('05/06/2026');
  });

  it('extrae matrícula cuando solo está en el texto del ticket', () => {
    const parsed = parseWeighingTicket('Camión 7894 ZXA salida a las 10:00');
    expect(parsed.matricula?.value).toBe('7894 ZXA');
  });

  it('devuelve null en campos ausentes', () => {
    const parsed = parseWeighingTicket('SIN DATOS DE PESAJE EN ESTE TICKET');
    expect(parsed.matricula).toBeNull();
    expect(parsed.pesoBrutoKg).toBeNull();
    expect(parsed.taraKg).toBeNull();
    expect(parsed.pesoNetoKg).toBeNull();
    expect(parsed.numeroTicket).toBeNull();
  });

  it('maneja texto vacío', () => {
    const parsed = parseWeighingTicket('');
    expect(parsed.matricula).toBeNull();
    expect(parsed.pesoNetoKg).toBeNull();
  });
});