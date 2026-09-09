import type { FeatureCollection, Polygon, GeoJsonProperties } from 'geojson';

interface MunicipioAPIResponse {
  total_count: number;
  results: Array<{
    municipio: string;
    cod_municipio: string;
    provincia: string;
    cod_provincia: string;
    poblacion: number;
    geo_shape: {
      type: string;
      geometry: {
        type: string;
        coordinates: number[][][];
      };
    };
    categoria?: string;
    latitud?: string;
    longitud?: string;
    [key: string]: unknown;
  }>;
}

type MunicipioFeatureProperties = GeoJsonProperties & {
  cod_municipio: string;
  nombre: string;
  provincia: string;
  poblacion: number;
  categoria?: string;
  latitud?: string;
  longitud?: string;
};

export async function fetchMunicipioPorNombre(
  nombre: string
): Promise<FeatureCollection<Polygon, MunicipioFeatureProperties>> {
  const url = `https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/municipio-limites-categorias-est/records?where=municipio="${encodeURIComponent(
    nombre
  ).toUpperCase()}"&limit=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

  const data: MunicipioAPIResponse = await res.json();

  if (!data.results?.length) {
    throw new Error('No se encontraron municipios');
  }

  const municipio = data.results[0];

  if (!municipio.geo_shape?.geometry) {
    throw new Error('No se encontró geometría del municipio');
  }

  const geomType = municipio.geo_shape.geometry.type;
  const coords = municipio.geo_shape.geometry.coordinates;

  if (geomType !== 'Polygon') {
    throw new Error(`Formato geográfico no soportado: ${geomType}`);
  }

  if (!Array.isArray(coords) || !coords.length) {
    throw new Error('Coordenadas inválidas');
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          cod_municipio: municipio.cod_municipio,
          nombre: municipio.municipio,
          provincia: municipio.provincia,
          poblacion: municipio.poblacion,
          categoria: municipio.categoria,
          latitud: municipio.latitud,
          longitud: municipio.longitud,
        },
        geometry: {
          type: 'Polygon',
          coordinates: coords,
        },
      },
    ],
  };
}

interface SugerenciaAPIResponse {
  results: Array<{
    municipio: string;
    provincia: string;
  }>;
}

export async function buscarSugerenciasMunicipios(query: string, signal?: AbortSignal): Promise<string[]> {
  if (!query || query.length < 3) return [];

  const url = `https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/municipio-limites-categorias-est/records?select=municipio,provincia&where=municipio like "${encodeURIComponent(
    query
  ).toUpperCase()}*"&limit=5`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Error al buscar sugerencias: ${res.statusText}`);

  const data: SugerenciaAPIResponse = await res.json();
  if (!data.results) return [];

  return data.results.map((item) => `${item.municipio} (${item.provincia})`);
}
