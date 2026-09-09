# Franky — Frontend

Frontend de **Franky**, aplicación full-stack de gestión forestal orientada al cumplimiento **EUDR** (con PEFC y SURE). Construido con **React 18 + TypeScript + Vite 6**.

El backend (Spring Boot) vive en un repositorio separado: **`vegapunk`**.

## Stack

- **React 18 + TypeScript + Vite 6**
- **MUI 7** — componentes base
- **Leaflet + react-leaflet** — mapas (SIGPAC)
- **react-router-dom v7** — routing
- **@turf/boolean-point-in-polygon** — geometría (point-in-polygon)
- **wicket** — parser WKT
- **qrcode** — QR client-side
- **jspdf** — exportación PDF
- **Vitest + Testing Library** — tests unitarios

## Requisitos

- Node.js (moderno, compatible con Vite 6)
- El backend **`vegapunk`** corriendo en `http://localhost:8080`

## Puesta en marcha

```bash
npm install
npm run dev
```

El proxy de Vite redirige `/api` → `http://localhost:8080`.

## Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Compilar (`tsc -b` + `vite build`) |
| `npm run lint` | ESLint |
| `npm run preview` | Previsualizar build de producción |
| `npm test` / `npm run test:watch` | Tests unitarios (Vitest) |
| `npm run format` / `format:check` | Prettier |

## Estructura

```
src/
├── pages/            # Páginas por ruta
├── features/         # Lógica por dominio (api / hooks / components / types)
├── components/       # Shared components (Layout, CalendarWidget, …)
├── styles/           # Módulos CSS (*.module.css)
├── App.tsx           # Router + layout
└── index.css         # Variables CSS y resets
```

## Documentación

- `CONTEXT.md` — resumen rápido del proyecto
- `design.md` — sistema de diseño
- `prd.md` — requisitos de producto
- `cambios.md` — changelog
- `agents.md` — instrucciones del agente
