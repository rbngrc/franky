import Wkt from 'wicket';

export function parseWktCenter(wkt: string): [number, number] | null {
  try {
    const w = new Wkt.Wkt();
    w.read(wkt);
    const geoJson = w.toJson();
    if (geoJson.type === 'Point') return [geoJson.coordinates[1], geoJson.coordinates[0]];
    if (geoJson.type === 'Polygon') {
      const coords = geoJson.coordinates[0];
      const sumLng = coords.reduce((s: number, c: number[]) => s + c[0], 0);
      const sumLat = coords.reduce((s: number, c: number[]) => s + c[1], 0);
      return [sumLat / coords.length, sumLng / coords.length];
    }
    return null;
  } catch {
    return null;
  }
}
