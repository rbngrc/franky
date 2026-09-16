import { parseWktCenter } from '../geojson';

describe('parseWktCenter', () => {
  it('returns [lat, lng] for a valid WKT Point', () => {
    expect(parseWktCenter('POINT(30 10)')).toEqual([10, 30]);
  });

  it('returns the arithmetic centroid for a valid WKT Polygon', () => {
    expect(parseWktCenter('POLYGON((0 0,4 0,4 4,0 4,0 0))')).toEqual([1.6, 1.6]);
  });

  it('returns null for invalid WKT', () => {
    expect(parseWktCenter('NOT A WKT')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseWktCenter('')).toBeNull();
  });
});