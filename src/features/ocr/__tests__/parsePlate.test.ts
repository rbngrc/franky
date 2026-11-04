import { describe, expect, it } from 'vitest';
import { cleanPlateText, isSpanishPlate, parsePlate } from '../parsePlate';

describe('parsePlate', () => {
  it('reconoce matrícula moderna con espacios', () => {
    const plate = parsePlate('Vehículo 1234 ABC verificada');
    expect(plate).not.toBeNull();
    expect(plate?.formatted).toBe('1234 ABC');
    expect(plate?.normalized).toBe('1234ABC');
    expect(plate?.format).toBe('moderna');
    expect(plate?.confidence).toBe(1);
  });

  it('reconoce matrícula moderna sin separadores', () => {
    const plate = parsePlate('MATRICULA: 5678DEF');
    expect(plate?.formatted).toBe('5678 DEF');
    expect(plate?.normalized).toBe('5678DEF');
  });

  it('reconoce matrícula antigua con guiones', () => {
    const plate = parsePlate('AB-1234-CD');
    expect(plate?.formatted).toBe('AB-1234-CD');
    expect(plate?.format).toBe('antigua');
  });

  it('reconoce matrícula de remolque', () => {
    const plate = parsePlate('R-4321-XYZ');
    expect(plate?.formatted).toBe('R-4321-XYZ');
    expect(plate?.format).toBe('remolque');
  });

  it('no confunde un remolque con una moderna', () => {
    const plate = parsePlate('R 9876 KLM');
    expect(plate?.format).toBe('remolque');
    expect(plate?.formatted).toBe('R-9876-KLM');
  });

  it('limpia acentos y símbolos', () => {
    expect(cleanPlateText('Mátricula: 12.34 ABC!')).toBe('MATRICULA 12 34 ABC');
  });

  it('recupera matrícula con confusiones típicas de OCR', () => {
    const plate = parsePlate('O123 ABC');
    expect(plate).not.toBeNull();
    expect(plate?.normalized).toBe('0123ABC');
    expect(plate?.confidence).toBeLessThan(1);
  });

  it('devuelve null si no hay matrícula', () => {
    expect(parsePlate('Báscula de pesaje municipal')).toBeNull();
  });

  it('valida formato de matrícula', () => {
    expect(isSpanishPlate('1234ABC')).toBe(true);
    expect(isSpanishPlate('AB1234CD')).toBe(true);
    expect(isSpanishPlate('R4321XYZ')).toBe(true);
    expect(isSpanishPlate('123ABC')).toBe(false);
    expect(isSpanishPlate('12345ABCD')).toBe(false);
  });
});