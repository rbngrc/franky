import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../features/dashboard/hooks/useDashboardStats';
import { KpiGrid } from '../features/dashboard/components/KpiGrid';
import { DashboardRoutesMap } from '../features/dashboard/components/DashboardRoutesMap';
import { ToneladasPorTipoMaderaChart } from '../features/dashboard/components/charts/ToneladasPorTipoMaderaChart';
import { ToneladasPorMesChart } from '../features/dashboard/components/charts/ToneladasPorMesChart';
import { CumplimientoCertificacionesChart } from '../features/dashboard/components/charts/CumplimientoCertificacionesChart';
import { SuperficieChart } from '../features/dashboard/components/charts/SuperficieChart';
import { TransportesPorDestinoChart } from '../features/dashboard/components/charts/TransportesPorDestinoChart';
import { CamionesPorMarcaChart } from '../features/dashboard/components/charts/CamionesPorMarcaChart';
import { KilometrajeRutasChart } from '../features/dashboard/components/charts/KilometrajeRutasChart';
import type { RouteDistance } from '../features/dashboard/types/dashboard.types';
import { CalendarWidget } from '../components/CalendarWidget';
import { useParcelas } from '../features/parcelas/hooks/useParcelas';
import { useCentros } from '../features/centros/hooks/useCentros';
import { useTransportes } from '../features/transportes/hooks/useTransportes';
import styles from '../styles/DashboardStats.module.css';

export const DashboardPage = () => {
  const stats = useDashboardStats();
  const { parcelas } = useParcelas();
  const { centros } = useCentros();
  const { transportes } = useTransportes();

  const [distancias, setDistancias] = useState<RouteDistance[]>([]);
  const onDistances = useCallback((d: RouteDistance[]) => setDistancias(d), []);

  const certCards = useMemo(
    () =>
      stats.certificaciones.map((c) => (
        <Link key={c.key} to="/eudr" className={styles.certCard}>
          <span className={styles.certMain}>
            <span className={styles.certValue} style={{ color: c.color }}>
              {stats.isLoading ? '...' : c.cumplidos}
              <span className={styles.certTotal}>/ {c.total}</span>
            </span>
            <span className={styles.certLabel}>
              Cumplen {c.label} · {c.porcentaje}%
            </span>
          </span>
          <span className={styles.certLabel} style={{ color: c.color }}>
            {c.porcentaje}%
          </span>
        </Link>
      )),
    [stats.certificaciones, stats.isLoading],
  );

  return (
    <div className="page-container">
      <div className={styles.header}>
        <p className="page-desc">
          Estadísticas del sistema de gestión forestal y certificaciones
        </p>
      </div>

      {stats.parcelasTruncadas && (
        <div className={styles.truncationWarning}>
          <span>⚠</span>
          <span>
            Solo se han cargado las primeras 100 parcelas del total. Las estadísticas de
            superficie pueden estar incompletas.
          </span>
        </div>
      )}

      <KpiGrid items={stats.kpis} />

      <h2 className={styles.sectionTitle}>★ Certificaciones</h2>
      <div className={styles.certGrid}>{certCards}</div>

      <h2 className={styles.sectionTitle}>★ Actividad y carga</h2>
      <div className={styles.chartsGrid}>
        <ToneladasPorMesChart
          toneladas={stats.toneladasPorMes}
          transportes={stats.transportesPorMes}
        />
        <CumplimientoCertificacionesChart data={stats.certificaciones} />
      </div>

      <h2 className={styles.sectionTitle}>★ Materia prima y destinos</h2>
      <div className={styles.chartsGrid}>
        <ToneladasPorTipoMaderaChart data={stats.toneladasPorTipoMadera} />
        <TransportesPorDestinoChart data={stats.transportesPorDestino} />
      </div>

      <h2 className={styles.sectionTitle}>★ Superficie forestal</h2>
      <div className={styles.chartsGrid}>
        <SuperficieChart data={stats.hectareasPorProvincia} titulo="Superficie por provincia" />
        <SuperficieChart
          data={stats.hectareasPorMunicipio}
          titulo="Superficie por municipio"
          subtitulo="Top 10"
        />
      </div>

      <h2 className={styles.sectionTitle}>★ Flota y rutas</h2>
      <div className={styles.chartsGrid}>
        <CamionesPorMarcaChart data={stats.camionesPorMarca} />
        <KilometrajeRutasChart data={distancias} isLoading={stats.isLoading} />
      </div>

      <h2 className={styles.sectionTitle}>★ Mapa y calendario</h2>
      <div className={styles.chartsGrid}>
        <div className={styles.mapCard}>
          <DashboardRoutesMap
            transportes={transportes}
            centros={centros}
            parcelas={parcelas}
            onDistances={onDistances}
          />
        </div>
        <div className={styles.mapCard}>
          <CalendarWidget transportes={transportes} />
        </div>
      </div>

      {stats.ultimosTransportes.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>★ Últimos transportes</h2>
          <div className={styles.listCard}>
            <div className={styles.list}>
              {stats.ultimosTransportes.map((t) => (
                <Link key={t.id} to={`/transportes/${t.id}`} className={styles.listItem}>
                  <div>
                    <span className={styles.listCode}>
                      #{t.codigoTrazabilidad?.slice(0, 8) || t.id}
                    </span>
                    <span className={styles.listDate}>
                      {new Date(t.fechaCarga).toLocaleDateString('es-ES')}
                    </span>
                    <div className={styles.listSub}>
                      {t.parcelaNombre || t.parcelaId}
                    </div>
                  </div>
                  <div className={styles.badges}>
                    {[
                      { ok: t.eudrCumplimiento, label: 'EUDR' },
                      { ok: t.pefcCumplimiento, label: 'PEFC' },
                      { ok: t.sureCumplimiento, label: 'SURE' },
                    ].map((c) => (
                      <span
                        key={c.label}
                        className={`${styles.badge} ${c.ok ? styles.badgeOk : styles.badgeFail}`}
                      >
                        {c.ok ? '✓' : '✗'} {c.label}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
