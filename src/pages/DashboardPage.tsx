import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import GppGoodIcon from '@mui/icons-material/GppGood';
import ForestIcon from '@mui/icons-material/Forest';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useState } from 'react';

import { useParcelas } from '../features/parcelas/hooks/useParcelas';
import { useCamiones } from '../features/camiones/hooks/useCamiones';
import { useCamioneros } from '../features/camioneros/hooks/useCamioneros';
import { useTransportes } from '../features/transportes/hooks/useTransportes';
import { useCentros } from '../features/centros/hooks/useCentros';
import { DashboardRoutesMap } from '../features/dashboard/components/DashboardRoutesMap';
import { CalendarWidget } from '../components/CalendarWidget';

const iconMap: Record<string, React.ReactNode> = {
  'Parcelas': <WarehouseIcon sx={{ fontSize: 32 }} />,
  'Camiones activos': <LocalShippingIcon sx={{ fontSize: 32 }} />,
  'Camioneros activos': <PersonIcon sx={{ fontSize: 32 }} />,
  'Transportes registrados': <RouteIcon sx={{ fontSize: 32 }} />,
};

function CertCard({ cert }: { cert: {
  key: string; value: number; total: number; label: string;
  icon: React.ReactNode; color: string; link: string; reqs: string[];
} }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
        padding: '1rem 1rem',
        borderRadius: '12px',
        border: '2px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'default',
      }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.8rem', color: cert.color, display: 'flex' }}>{cert.icon}</span>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.8rem',
            lineHeight: 1,
            color: cert.color,
            letterSpacing: '1px',
          }}>
            {cert.value}<span style={{ fontSize: '1rem', color: '#90A4AE', marginLeft: '0.25rem' }}>/ {cert.total}</span>
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#546E7A',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>{cert.label}</div>
        </div>
      </div>
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <span style={{ color: '#90A4AE', fontSize: '1.1rem' }}>ℹ</span>
        {showTip && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            background: '#263238',
            color: '#fff',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 100,
            lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Requisitos:</div>
            {cert.reqs.map((r, i) => (
              <div key={i} style={{ color: '#B2DFDB' }}>✓ {r}</div>
            ))}
            <div style={{
              position: 'absolute',
              bottom: -6,
              right: 12,
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #263238',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

export const DashboardPage = () => {
  const { parcelas, totalParcelas, isLoading: loadingP } = useParcelas();
  const { camiones, isLoading: loadingCam } = useCamiones();
  const { camioneros, isLoading: loadingCamo } = useCamioneros();
  const { transportes, isLoading: loadingT } = useTransportes();
  const { centros, isLoading: loadingCentros } = useCentros();

  const cumplenEudr = transportes.filter((t) => t.eudrCumplimiento).length;
  const cumplenPefc = transportes.filter((t) => t.pefcCumplimiento).length;
  const cumplenSure = transportes.filter((t) => t.sureCumplimiento).length;

  const stats = [
    { value: totalParcelas, label: 'Parcelas', link: '/parcelas/tabla', loading: loadingP },
    { value: camiones.filter((c) => c.activo).length, label: 'Camiones activos', link: '/camiones', loading: loadingCam },
    { value: camioneros.filter((c) => c.activo).length, label: 'Camioneros activos', link: '/camioneros', loading: loadingCamo },
    { value: transportes.length, label: 'Transportes registrados', link: '/transportes', loading: loadingT },
  ];

  const certs = [
    {
      key: 'eudr', value: cumplenEudr, total: transportes.length, label: 'Cumplen EUDR',
      icon: <GppGoodIcon sx={{ fontSize: 28 }} />, color: '#2E7D32', link: '/eudr',
      reqs: ['Geolocalización de la parcela (coordenadas del terreno)', 'Referencia catastral (identificación registral)', 'Sin deforestación después del 31/12/2020', 'Producción legal (laboral, ambiental, fiscal)', 'Declaración de diligencia debida en sistema TRACES'],
    },
    {
      key: 'pefc', value: cumplenPefc, total: transportes.length, label: 'Cumplen PEFC',
      icon: <ForestIcon sx={{ fontSize: 28 }} />, color: '#1565C0', link: '/eudr',
      reqs: ['Monte con certificación PEFC de gestión forestal sostenible', 'Cadena de custodia desde el bosque certificado', 'Auditoría independiente anual', 'Protección de biodiversidad, suelo y agua', 'Derechos laborales y comunitarios'],
    },
    {
      key: 'sure', value: cumplenSure, total: transportes.length, label: 'Cumplen SURE',
      icon: <VerifiedUserIcon sx={{ fontSize: 28 }} />, color: '#F57F17', link: '/eudr',
      reqs: ['Biomasa forestal certificada sostenible (criterios RED II)', 'Cadena de custodia para bioenergía', 'Reducción verificable de emisiones GEI', 'Auditoría independiente anual', 'Uso eficiente de recursos (cascada de la madera)'],
    },
  ];

  const ultimosTransportes = [...transportes].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.8rem' }}>
          Panel de Control
        </h1>
        <p className="page-subtitle">
          Resumen del sistema de gestión forestal y certificaciones
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.link}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FFD700';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(21, 101, 192, 0.15), 0 0 0 1px rgba(255, 215, 0, 0.2)';
              const star = e.currentTarget.querySelector('.stat-star') as HTMLElement;
              if (star) star.style.opacity = '1';
              const icon = e.currentTarget.querySelector('.stat-icon-el') as HTMLElement;
              if (icon) icon.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
              const star = e.currentTarget.querySelector('.stat-star') as HTMLElement;
              if (star) star.style.opacity = '0.3';
              const icon = e.currentTarget.querySelector('.stat-icon-el') as HTMLElement;
              if (icon) icon.style.transform = '';
            }}
          >
            <span
              className="stat-star"
              style={{
                position: 'absolute',
                top: '6px',
                right: '8px',
                fontSize: '0.75rem',
                color: '#FFD700',
                opacity: 0.3,
                transition: 'opacity 0.3s',
              }}
            >
              ★
            </span>

            <span
              className="stat-icon-el"
              style={{
                fontSize: '2rem',
                color: '#1565C0',
                marginBottom: '0.15rem',
                transition: 'transform 0.3s',
                display: 'flex',
              }}
            >
              {iconMap[s.label] || <HomeIcon sx={{ fontSize: 32 }} />}
            </span>

            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '3rem',
              lineHeight: 1,
              color: '#1565C0',
              letterSpacing: '2px',
            }}>
              {s.loading ? '...' : s.value}
            </div>

            <div style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#546E7A',
              marginTop: '0.15rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.3rem',
          margin: '0 0 0.75rem',
          color: '#0D47A1',
          letterSpacing: '1px',
        }}>
          ★ Certificaciones
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {certs.map((c) => (
            <CertCard key={c.key} cert={c} />
          ))}
        </div>
      </section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          background: '#FFFFFF',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #E8EDF2',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.3rem',
            margin: '0 0 1rem',
            color: '#0D47A1',
            letterSpacing: '1px',
          }}>
            ★ Acceso rápido
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { to: '/parcelas/crear-sigpac', label: '+ Añadir parcela desde SIGPAC' },
              { to: '/camiones/nuevo', label: '+ Registrar nuevo camión' },
              { to: '/camioneros/nuevo', label: '+ Registrar nuevo camionero' },
              { to: '/transportes/nuevo', label: '+ Registrar nuevo transporte' },
              { to: '/eudr', label: 'Ver panel de cumplimiento certificaciones' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  color: '#1565C0',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(21, 101, 192, 0.06)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = '';
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {ultimosTransportes.length > 0 && (
          <div style={{
            background: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #E8EDF2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.3rem',
              margin: '0 0 1rem',
              color: '#0D47A1',
              letterSpacing: '1px',
            }}>
              ★ Últimos transportes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {ultimosTransportes.map((t) => (
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
                    <div style={{ fontSize: '0.8rem', color: '#546E7A', marginTop: '2px' }}>
                      {t.parcelaNombre || t.parcelaId}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {[ 
                      { ok: t.eudrCumplimiento, label: 'EUDR' },
                      { ok: t.pefcCumplimiento, label: 'PEFC' },
                      { ok: t.sureCumplimiento, label: 'SURE' },
                    ].map((c) => (
                      <span key={c.label} style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '20px',
                        background: c.ok ? '#E8F5E9' : '#FFEBEE',
                        color: c.ok ? '#2E7D32' : '#D32F2F',
                        whiteSpace: 'nowrap',
                      }}>
                        {c.ok ? '✓' : '✗'} {c.label}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {!loadingT && !loadingCentros && !loadingP && transportes.length > 0 && (
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
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.3rem',
              margin: '0 0 1rem',
              color: '#0D47A1',
              letterSpacing: '1px',
            }}>
              ★ Rutas de transporte
            </h2>
            <DashboardRoutesMap transportes={transportes} centros={centros} parcelas={parcelas} />
          </div>
          <div style={{
            background: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #E8EDF2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.3rem',
              margin: '0 0 1rem',
              color: '#0D47A1',
              letterSpacing: '1px',
            }}>
              ★ Calendario transportes
            </h2>
            <CalendarWidget transportes={transportes} />
          </div>
        </div>
      )}
    </div>
  );
};
