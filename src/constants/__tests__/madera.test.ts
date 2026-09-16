import { TIPO_MADERA_OPTIONS, tipoMaderaLabel } from '../madera';

describe('tipoMaderaLabel', () => {
  it('returns the correct label for every known value', () => {
    TIPO_MADERA_OPTIONS.forEach((option) => {
      expect(tipoMaderaLabel(option.value)).toBe(option.label);
    });
  });

  it('returns the value itself for an unknown type', () => {
    expect(tipoMaderaLabel('ABEDUL')).toBe('ABEDUL');
  });
});