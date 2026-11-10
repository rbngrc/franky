import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, type UserRole } from '../features/config/RoleContext';
import { ROLES, ROLE_LABELS, getRol } from '../features/auth/mockRoles';
import styles from '../styles/LoginPage.module.css';

const RUTA =
  'M40 812 C 200 786 250 664 404 692 S 620 566 780 592 S 980 472 1080 386 S 1240 268 1400 246';

const COLINAS = [
  { cx: 250, cy: 770, rx: 260, ry: 170, rot: -14 },
  { cx: 1080, cy: 190, rx: 230, ry: 160, rot: 22 },
  { cx: 760, cy: 920, rx: 300, ry: 150, rot: 6 },
  { cx: 1320, cy: 700, rx: 200, ry: 130, rot: -20 },
];

const FondoMapa = () => (
  <svg className={styles.mapa} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <pattern id="loginRejilla" width="72" height="72" patternUnits="userSpaceOnUse">
        <path d="M72 0H0V72" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      </pattern>
    </defs>

    <rect width="1440" height="900" fill="url(#loginRejilla)" />

    {COLINAS.map((c, i) => (
      <g key={i} transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}>
        {[1, 0.8, 0.6, 0.42, 0.26].map((e, j) => (
          <ellipse
            key={j}
            cx={c.cx}
            cy={c.cy}
            rx={c.rx * e}
            ry={c.ry * e}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1.2"
          />
        ))}
      </g>
    ))}

    <g fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeDasharray="6 5">
      <path d="M880 700L1010 660L1120 730L1070 830L910 810Z" />
      <path d="M150 260L300 230L360 330L250 400L140 350Z" />
    </g>

    <path d={RUTA} fill="none" stroke="rgba(255,213,79,0.18)" strokeWidth="14" strokeLinecap="round" />
    <path d={RUTA} fill="none" stroke="#FFD54F" strokeWidth="4" strokeDasharray="16 14" strokeLinecap="round" />

    <circle cx="40" cy="812" r="8" fill="#FFFFFF" stroke="#FFD54F" strokeWidth="4" />
    {[
      [404, 692],
      [780, 592],
      [1080, 386],
    ].map(([cx, cy]) => (
      <g key={`${cx}-${cy}`}>
        <circle cx={cx} cy={cy} r="6" fill="rgba(13,71,161,0.5)" />
        <circle cx={cx} cy={cy} r="4" fill="#FFD54F" />
      </g>
    ))}
    <circle cx="1400" cy="246" r="9" fill="#FFD54F" stroke="rgba(13,71,161,0.85)" strokeWidth="4" />

    <g transform="translate(1310 110)">
      <circle r="18" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.28)" />
      <path d="M0 -14L7 2L0 -2.5L-7 2Z" fill="#FFD54F" />
      <text y="34" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.55)">
        N
      </text>
    </g>

    <g stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
      <line x1="156" y1="864" x2="300" y2="864" />
      <line x1="156" y1="858" x2="156" y2="870" />
      <line x1="300" y1="858" x2="300" y2="870" />
    </g>
    <text x="228" y="852" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.55)">
      1 km
    </text>
  </svg>
);

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setRole, setConductorDni } = useRole();
  const [rol, setRol] = useState<UserRole>('ADMIN_GENERAL');
  const datos = getRol(rol);

  const entrar = () => {
    setRole(rol);
    setConductorDni(rol === 'CONDUCTOR' ? datos.dni ?? null : null);
    try {
      sessionStorage.setItem('franky.sesion', '1');
    } catch {
      // sin almacenamiento disponible
    }
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.page}>
      <FondoMapa />

      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.star}>★</span> FRANKY
        </div>
        <div className={styles.brandSub}>Forestal Tracker</div>

        <h1 className={styles.title}>Elige tu rol</h1>
        <p className={styles.subtitle}>Acceso de prueba: no hace falta contraseña.</p>

        <label className={styles.label} htmlFor="rol">
          Rol
        </label>
        <select
          id="rol"
          className={styles.select}
          value={rol}
          onChange={(e) => setRol(e.target.value as UserRole)}
        >
          {ROLES.map((r) => (
            <option key={r.rol} value={r.rol}>
              {ROLE_LABELS[r.rol]}
            </option>
          ))}
        </select>

        <div className={styles.descripcion}>
          <div className={styles.descripcionRol}>Qué puede hacer</div>
          <p className={styles.descripcionTexto}>{datos.descripcion}</p>
        </div>

        <button type="button" className={styles.entrar} onClick={entrar}>
          Entrar
        </button>

        <p className={styles.note}>Maqueta sin credenciales: solo se guarda el rol elegido en este navegador.</p>
      </div>
    </div>
  );
};
