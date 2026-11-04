import type { ReactNode } from 'react';
import styles from '../../../styles/DashboardChart.module.css';

interface Props {
  title: string;
  subtitle?: string;
  tall?: boolean;
  isEmpty?: boolean;
  emptyText?: string;
  legend?: { label: string; color: string; value?: string }[];
  children: ReactNode;
}

export const ChartCard = ({
  title,
  subtitle,
  tall,
  isEmpty,
  emptyText = 'Sin datos para mostrar',
  legend,
  children,
}: Props) => (
  <div className={styles.chartCard}>
    <h3 className={styles.chartTitle}>{title}</h3>
    {subtitle && <p className={styles.chartSubtitle}>{subtitle}</p>}
    {isEmpty ? (
      <div className={styles.empty}>{emptyText}</div>
    ) : (
      <div className={tall ? styles.chartBoxTall : styles.chartBox}>{children}</div>
    )}
    {legend && legend.length > 0 && (
      <div className={styles.legendRow}>
        {legend.map((l) => (
          <span key={l.label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: l.color }} />
            {l.label}
            {l.value !== undefined && ` — ${l.value}`}
          </span>
        ))}
      </div>
    )}
  </div>
);
