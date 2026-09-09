import { useState } from 'react';

interface ResolvedData {
  direccion: string;
  latitud: number;
  longitud: number;
}

interface GoogleMapsLinkResolverProps {
  onResolve: (data: ResolvedData) => void;
}

function extractCoords(url: string): { lat: number; lng: number } | null {
  const patterns = [
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /[?&]q=(-?\d+\.?\d*)[%2C,]\s*(-?\d+\.?\d*)/,
    /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /destination=(-?\d+\.?\d*)[%2C,]\s*(-?\d+\.?\d*)/,
    /origin=(-?\d+\.?\d*)[%2C,]\s*(-?\d+\.?\d*)/,
  ];

  for (const p of patterns) {
    const m = url.match(p);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
  }
  return null;
}

async function resolveViaProxies(url: string, signal: AbortSignal): Promise<string | null> {
  const endpoints = [
    `/resolve-url-proxy?url=${encodeURIComponent(url)}`,
    `/api/v1/util/resolve-url?url=${encodeURIComponent(url)}`,
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { signal });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.resolvedUrl) return data.resolvedUrl;
    } catch {
      continue;
    }
  }
  return null;
}

async function reverseGeocode(lat: number, lng: number, signal: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`,
      { signal, headers: { 'User-Agent': 'FrankyApp/1.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

export const GoogleMapsLinkResolver: React.FC<GoogleMapsLinkResolverProps> = ({ onResolve }) => {
  const [input, setInput] = useState('');
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    const url = input.trim();
    if (!url) { setError('Pega un enlace de Google Maps'); return; }

    setResolving(true);
    setError(null);

    try {
      const ac = new AbortController();
      let targetUrl = url;

      const needsResolve = /goo\.gl|maps\.app\.goo/i.test(url);
      if (needsResolve) {
        const resolved = await resolveViaProxies(url, ac.signal);
        if (resolved) {
          targetUrl = resolved;
        } else {
          setError('No se pudo resolver el enlace corto. Pega la URL completa desde Google Maps (compartir → copiar enlace en navegador web).');
          setResolving(false);
          return;
        }
      }

      const coords = extractCoords(targetUrl);
      if (!coords) {
        setError('No se encontraron coordenadas en el enlace. Asegúrate de que incluya una ubicación.');
        setResolving(false);
        return;
      }

      const address = await reverseGeocode(coords.lat, coords.lng, ac.signal);

      onResolve({
        direccion: address || `${coords.lat}, ${coords.lng}`,
        latitud: coords.lat,
        longitud: coords.lng,
      });
    } catch {
      setError('Error al resolver la ubicación. Intenta de nuevo.');
    } finally {
      setResolving(false);
    }
  };

  const isShort = /goo\.gl|maps\.app\.goo/i.test(input.trim());

  return (
    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: 6, border: '1px solid #e0e0e0' }}>
      <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
        O desde enlace de Google Maps
      </label>
      <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px' }}>
        Comparte una ubicación desde Google Maps y pega el enlace aquí
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null); }}
          placeholder="https://maps.app.goo.gl/...  o  https://maps.google.com/..."
          className="form-input"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={handleResolve}
          disabled={!input.trim() || resolving}
          className="btn btn-sm btn-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          {resolving ? 'Resolviendo...' : 'Obtener datos'}
        </button>
      </div>
      {isShort && (
        <p style={{ fontSize: 11, color: '#f57c00', marginTop: 4 }}>
          Enlace corto — el backend lo resolverá automáticamente
        </p>
      )}
      {error && <p style={{ color: '#D32F2F', fontSize: 13, marginTop: 4 }}>{error}</p>}
    </div>
  );
};
