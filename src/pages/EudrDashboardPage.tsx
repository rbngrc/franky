import { useTransportes } from '../features/transportes/hooks/useTransportes';
import { Link } from 'react-router-dom';
import RouteIcon from '@mui/icons-material/Route';
import GppGoodIcon from '@mui/icons-material/GppGood';
import ForestIcon from '@mui/icons-material/Forest';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StarsIcon from '@mui/icons-material/Stars';
import { useState } from 'react';
import { tipoMaderaLabel } from '../constants/madera';

const CERT_REQUISITOS: Record<string, { label: string; color: string; reqs: string[] }> = {
  EUDR: {
    label: 'EUDR', color: '#2E7D32',
    reqs: ['Geolocalización de la parcela (coordenadas del terreno)', 'Referencia catastral (identificación registral)', 'Sin deforestación después del 31/12/2020', 'Producción legal (laboral, ambiental, fiscal)', 'Declaración de diligencia debida en sistema TRACES'],
  },
  PEFC: {
    label: 'PEFC', color: '#1565C0',
    reqs: ['Monte con certificación PEFC de gestión forestal sostenible', 'Cadena de custodia desde el bosque certificado', 'Auditoría independiente anual', 'Protección de biodiversidad, suelo y agua', 'Derechos laborales y comunitarios'],
  },
  SURE: {
    label: 'SURE', color: '#F57F17',
    reqs: ['Biomasa forestal certificada sostenible (criterios RED II)', 'Cadena de custodia para bioenergía', 'Reducción verificable de emisiones GEI', 'Auditoría independiente anual', 'Uso eficiente de recursos (cascada de la madera)'],
  },
};

const badgeCert = (ok: boolean, label: string) => (
  <span style={{
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '20px',
    background: ok ? '#E8F5E9' : '#FFEBEE',
    color: ok ? '#2E7D32' : '#D32F2F',
    whiteSpace: 'nowrap',
    marginRight: '0.3rem',
  }}>
    {ok ? '✓' : '✗'} {label}
  </span>
);

export const EudrDashboardPage = () => {
  const { transportes, isLoading, error } = useTransportes();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipList, setTooltipList] = useState<string | null>(null);

  if (isLoading) return <p className="text-muted" style={{ padding: '1rem' }}>Cargando datos...</p>;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;

  const total = transportes.length;
  const cumplenEudr = transportes.filter((t) => t.eudrCumplimiento);
  const cumplenPefc = transportes.filter((t) => t.pefcCumplimiento);
  const cumplenSure = transportes.filter((t) => t.sureCumplimiento);
  const cumplenTodo = transportes.filter((t) => t.eudrCumplimiento && t.pefcCumplimiento && t.sureCumplimiento);
  const conIncidencias = transportes.filter((t) => !t.eudrCumplimiento || !t.pefcCumplimiento || !t.sureCumplimiento);

  const statCards = [
    { key: 'total', value: total, label: 'Total transportes', icon: <RouteIcon sx={{ fontSize: 32 }} />, color: '#1565C0' },
    { key: 'eudr', value: cumplenEudr.length, label: 'Cumplen EUDR', icon: <GppGoodIcon sx={{ fontSize: 32 }} />, color: '#2E7D32' },
    { key: 'pefc', value: cumplenPefc.length, label: 'Cumplen PEFC', icon: <ForestIcon sx={{ fontSize: 32 }} />, color: '#1565C0' },
    { key: 'sure', value: cumplenSure.length, label: 'Cumplen SURE', icon: <VerifiedUserIcon sx={{ fontSize: 32 }} />, color: '#F57F17' },
    { key: 'todo', value: cumplenTodo.length, label: 'Completo (todo ✓)', icon: <StarsIcon sx={{ fontSize: 32 }} />, color: '#6A1B9A' },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Panel de Cumplimiento Certificaciones</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {statCards.map((s) => (
          <Link
            key={s.key}
            to="/transportes"
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
              padding: '1.5rem 1.25rem',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              border: '2px solid transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHovered(s.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                fontSize: '0.75rem',
                color: '#FFD700',
                opacity: hovered === s.key ? 1 : 0.3,
                transition: 'opacity 0.3s',
              }}
            >★</span>
            <span
              style={{
                fontSize: '2rem',
                color: '#1565C0',
                marginBottom: '0.15rem',
                transition: 'transform 0.3s',
                display: 'flex',
                transform: hovered === s.key ? 'scale(1.15)' : '',
              }}
            >{s.icon}</span>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '3rem',
              lineHeight: 1,
              color: s.color,
              letterSpacing: '2px',
            }}>{s.value}</div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#546E7A',
              marginTop: '0.15rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center',
            }}>{s.label}</div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '12px',
                border: '2px solid #FFD700',
                opacity: hovered === s.key ? 1 : 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none',
              }}
            />
          </Link>
        ))}
      </div>

      {total > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}>
          <div style={{
            background: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #E8EDF2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.3rem',
                margin: 0,
                color: '#0D47A1',
                letterSpacing: '1px',
              }}>
                ★ Transportes certificados ({cumplenTodo.length})
              </h2>
              <div style={{ position: 'relative' }}>
                <span style={{ color: '#90A4AE', cursor: 'pointer', fontSize: '1.1rem' }}
                  onMouseEnter={() => setTooltipList('cert')}
                  onMouseLeave={() => setTooltipList(null)}
                >ℹ</span>
                {tooltipList === 'cert' && (
                  <div style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
                    background: '#263238', color: '#fff', padding: '0.75rem 1rem',
                    borderRadius: '8px', fontSize: '0.8rem', minWidth: '240px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100,
                    lineHeight: 1.5,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#B2DFDB' }}>Requisitos certificaciones:</div>
                    {Object.values(CERT_REQUISITOS).map((cert) => (
                      <div key={cert.label} style={{ marginBottom: '0.3rem' }}>
                        <div style={{ fontWeight: 600, color: cert.color, marginBottom: '0.15rem' }}>{cert.label}:</div>
                        {cert.reqs.map((r, i) => (
                          <div key={i} style={{ color: '#B2DFDB', marginLeft: '0.5rem' }}>✓ {r}</div>
                        ))}
                      </div>
                    ))}
                    <div style={{
                      position: 'absolute', bottom: -6, right: 12,
                      width: 0, height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #263238',
                    }} />
                  </div>
                )}
              </div>
            </div>
            {cumplenTodo.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Ningún transporte cumple todas las certificaciones</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {cumplenTodo.map((t) => (
                  <Link
                    key={t.id}
                    to={`/transportes/${t.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      borderBottom: '1px solid #E8EDF2',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(21, 101, 192, 0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1565C0' }}>
                        #{t.codigoTrazabilidad?.slice(0, 8) || t.id}
                      </span>
                      <span style={{ color: '#78909C', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        {new Date(t.fechaCarga).toLocaleDateString()}
                      </span>
                      {t.tipoMadera && (
                        <span style={{ fontSize: '0.8rem', color: '#546E7A', marginLeft: '0.5rem' }}>
                          {tipoMaderaLabel(t.tipoMadera)}
                        </span>
                      )}
                      <div style={{ marginTop: '0.25rem' }}>
                        {badgeCert(t.eudrCumplimiento, 'EUDR')}
                        {badgeCert(t.pefcCumplimiento, 'PEFC')}
                        {badgeCert(t.sureCumplimiento, 'SURE')}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '20px',
                      background: '#F3E5F5',
                      color: '#6A1B9A',
                      whiteSpace: 'nowrap',
                    }}>Completo</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #E8EDF2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.3rem',
                margin: 0,
                color: '#0D47A1',
                letterSpacing: '1px',
              }}>
                ★ Transportes con incidencias ({conIncidencias.length})
              </h2>
              <div style={{ position: 'relative' }}>
                <span style={{ color: '#90A4AE', cursor: 'pointer', fontSize: '1.1rem' }}
                  onMouseEnter={() => setTooltipList('inc')}
                  onMouseLeave={() => setTooltipList(null)}
                >ℹ</span>
                {tooltipList === 'inc' && (
                  <div style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
                    background: '#263238', color: '#fff', padding: '0.75rem 1rem',
                    borderRadius: '8px', fontSize: '0.8rem', minWidth: '240px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100,
                    lineHeight: 1.5,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#B2DFDB' }}>Requisitos certificaciones:</div>
                    {Object.values(CERT_REQUISITOS).map((cert) => (
                      <div key={cert.label} style={{ marginBottom: '0.3rem' }}>
                        <div style={{ fontWeight: 600, color: cert.color, marginBottom: '0.15rem' }}>{cert.label}:</div>
                        {cert.reqs.map((r, i) => (
                          <div key={i} style={{ color: '#B2DFDB', marginLeft: '0.5rem' }}>✓ {r}</div>
                        ))}
                      </div>
                    ))}
                    <div style={{
                      position: 'absolute', bottom: -6, right: 12,
                      width: 0, height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #263238',
                    }} />
                  </div>
                )}
              </div>
            </div>
            {conIncidencias.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Todos los transportes cumplen todas las certificaciones</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {conIncidencias.map((t) => (
                  <Link
                    key={t.id}
                    to={`/transportes/${t.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      borderBottom: '1px solid #E8EDF2',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(211, 47, 47, 0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1565C0' }}>
                        #{t.codigoTrazabilidad?.slice(0, 8) || t.id}
                      </span>
                      <span style={{ color: '#78909C', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        {new Date(t.fechaCarga).toLocaleDateString()}
                      </span>
                      {t.tipoMadera && (
                        <span style={{ fontSize: '0.8rem', color: '#546E7A', marginLeft: '0.5rem' }}>
                          {tipoMaderaLabel(t.tipoMadera)}
                        </span>
                      )}
                      <div style={{ marginTop: '0.25rem' }}>
                        {badgeCert(t.eudrCumplimiento, 'EUDR')}
                        {badgeCert(t.pefcCumplimiento, 'PEFC')}
                        {badgeCert(t.sureCumplimiento, 'SURE')}
                      </div>
                      {t.razonesIncumplimiento?.length ? (
                        <div style={{ fontSize: '0.75rem', color: '#D32F2F', marginTop: '2px' }}>
                          {t.razonesIncumplimiento.map((r, i) => <span key={i}>✗ {r}{i < t.razonesIncumplimiento!.length - 1 ? ' | ' : ''}</span>)}
                        </div>
                      ) : null}
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '20px',
                      background: '#FFEBEE',
                      color: '#D32F2F',
                      whiteSpace: 'nowrap',
                    }}>Incidencias</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
