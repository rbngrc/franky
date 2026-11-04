import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Kpi } from '../types/dashboard.types';
import { formatKpi } from '../utils/formatters';
import styles from '../../../styles/DashboardStats.module.css';

const KpiCard = ({ kpi }: { kpi: Kpi }) => {
  const [showTip, setShowTip] = useState(false);
  const decimals = kpi.decimals ?? 0;
  const display = kpi.loading ? '...' : formatKpi(kpi.value, decimals);

  return (
    <Link to={kpi.link} className={styles.kpiCard}>
      <span className={styles.kpiStar}>★</span>
      <span className={styles.kpiValue}>{display}</span>
      <span className={styles.kpiLabel}>{kpi.label}</span>
      {kpi.tooltip && (
        <>
          <span
            className={styles.tipToggle}
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
          >
            ℹ
          </span>
          {showTip && (
            <span className={styles.tooltip}>
              {kpi.tooltip.map((r, i) => (
                <span key={i} className={styles.tooltipRow}>
                  ✓ {r}
                </span>
              ))}
            </span>
          )}
        </>
      )}
    </Link>
  );
};

export const KpiGrid = ({ items }: { items: Kpi[] }) => (
  <div className={styles.kpiGrid}>
    {items.map((kpi) => (
      <KpiCard key={kpi.label} kpi={kpi} />
    ))}
  </div>
);
