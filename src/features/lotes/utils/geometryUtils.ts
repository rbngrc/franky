import type { Polygon, MultiPolygon } from 'geojson';

function pointInPolygon(point: number[], polygon: number[][][]): boolean {
  const [x, y] = point;
  const ring = polygon[0];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function isLoteInsideParcela(
  loteGeometria: Polygon | null | undefined,
  parcelaGeoJson: Polygon | MultiPolygon | null
): boolean {
  if (!loteGeometria || loteGeometria.type !== 'Polygon' || !parcelaGeoJson) {
    return true;
  }

  const loteRing = loteGeometria.coordinates[0] as number[][];

  if (parcelaGeoJson.type === 'MultiPolygon') {
    const polys = parcelaGeoJson.coordinates as number[][][][];
    return loteRing.every((point) =>
      polys.some((poly) => pointInPolygon(point, poly))
    );
  }

  if (parcelaGeoJson.type === 'Polygon') {
    const outer = parcelaGeoJson.coordinates as number[][][];
    return loteRing.every((point) => pointInPolygon(point, outer));
  }

  return true;
}
