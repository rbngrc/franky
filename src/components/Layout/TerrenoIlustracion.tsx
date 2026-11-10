import styles from '../../styles/Terreno.module.css';

const contorno = (cx: number, cy: number, rx: number, ry: number, rot: number, seed: number) => {
  const n = 14;
  const r = (rot * Math.PI) / 180;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + Math.sin(a * 3 + seed) * 0.07 + Math.cos(a * 5 + seed * 1.7) * 0.045;
    const x = Math.cos(a) * rx * k;
    const y = Math.sin(a) * ry * k;
    return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [sx, sy] = mid(pts[n - 1], pts[0]);
  let d = `M${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % n]);
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return `${d} Z`;
};

const COLINAS = [
  { cx: 78, cy: 598, rx: 132, ry: 96, rot: -18, escala: [1, 0.82, 0.64, 0.46, 0.3, 0.15] },
  { cx: 190, cy: 402, rx: 98, ry: 76, rot: 16, escala: [1, 0.8, 0.6, 0.4, 0.2] },
  { cx: 62, cy: 174, rx: 86, ry: 68, rot: -12, escala: [1, 0.78, 0.56, 0.34] },
];

export const TerrenoIlustracion = ({ className }: { className?: string }) => (
  <div className={`${styles.terreno} ${className ?? ''}`} aria-hidden="true">
    <svg className={styles.mapa} viewBox="14 30 232 700" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="luz" cx="38%" cy="34%" r="62%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="sombra" cx="68%" cy="72%" r="60%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {COLINAS.map((c, h) => (
        <g key={h}>
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="url(#sombra)" />
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx * 0.94} ry={c.ry * 0.94} fill="url(#luz)" />
        </g>
      ))}

      {COLINAS.map((c, h) => (
        <g key={`c${h}`}>
          {c.escala.map((e, i) => (
            <path
              key={i}
              d={contorno(c.cx, c.cy, c.rx * e, c.ry * e, c.rot, h * 1.3 + i * 0.9)}
              fill={`rgba(255,255,255,${(0.015 + i * 0.008).toFixed(3)})`}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.2"
            />
          ))}
        </g>
      ))}

      <g fill="none" stroke="rgba(255,215,0,0.20)" strokeWidth="1">
        <path d="M-10 300C36 282 66 314 108 304S186 262 270 284" />
        <path d="M-10 330C38 312 68 344 110 334S188 292 270 314" />
        <path d="M-10 500C34 482 64 514 106 504S184 462 270 484" />
      </g>

      <g transform="translate(129 395) scale(0.70) translate(-129 -395)">
        <path
          d="M46 700C88 676 52 638 94 606C136 574 104 520 146 486C188 452 156 386 190 330C216 288 194 200 212 90"
          fill="none"
          stroke="rgba(255,213,79,0.28)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M46 700C88 676 52 638 94 606C136 574 104 520 146 486C188 452 156 386 190 330C216 288 194 200 212 90"
          fill="none"
          stroke="#FFD54F"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="11 10"
        />
        <circle cx="46" cy="700" r="7" fill="#ffffff" stroke="#FFD54F" strokeWidth="3" />
        <circle cx="146" cy="486" r="3.5" fill="#FFD54F" />
        <circle cx="190" cy="330" r="3.5" fill="#FFD54F" />
        <circle cx="212" cy="90" r="7" fill="#FFD54F" stroke="#0D47A1" strokeWidth="3" />
      </g>

      <g>
        <circle cx="210" cy="48" r="15" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />
        <path d="M210 36L216 50L210 46L204 50Z" fill="#FFD54F" />
        <text x="210" y="73" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.65)">N</text>
      </g>
    </svg>
  </div>
);
