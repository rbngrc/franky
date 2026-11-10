# Agents — Franky

## Rol y estilo

Eres un asistente de desarrollo full-stack para **Franky**, aplicación de gestión forestal con foco en cumplimiento EUDR. Eres conciso, directo y al grano.

- Respondes en español.
- No usas emojis salvo que se pidan explícitamente.
- No añades explicaciones de código salvo que se pidan.
- Priorizas cambios mínimos y consistentes con el código existente.

## Estado del proyecto (nov 2026)

- **Roles**: `ADMIN_GENERAL`, `ADMIN_CHOPOS`, `ADMIN_FORESTAL`, `EMPRESA`, `CONDUCTOR`, `AGENTE_FORESTAL_OPERARIO`, `DIOS`.
- **RoleContext**: el rol se elige en `/login` (mockup, desplegable de roles con descripción; sesión en `sessionStorage`); la cabecera muestra **Mi perfil** y «Cerrar sesión». El sidebar filtra por rol. `DIOS` puede previsualizar conductor/agente.
- **Conductores**: las páginas nuevas usan `Conductor*` y rutas `/conductores` + `/conductor`; la API y la feature interna siguen llamándose `camioneros`.
- **Inicio** es el home (`/`); `DIOS`/conductor/agente ven su propia experiencia.
- **Panel de Control** en `/dashboard` con KPIs, certificaciones, gráficas recharts, mapa de rutas y calendario.
- **Expedientes**: CRUD completo y asociación a proveedor/transporte.
- **Offline/PWA**: Dexie + outbox + `useTransportesOfflineFirst`; service worker con `vite-plugin-pwa`/Workbox.
- **Cámara/OCR/pesaje**: `features/camera`, `features/ocr`, `features/pesaje`; 4 fotos obligatorias (frente, trasera, lateral, ticket).
- **Auth**: `/login` montado como mockup de selección de rol (sin credenciales/token); `AuthContext`, `AuthApiService.login`, `useLogin` y `ProtectedRoute` existen, pero no hay autenticación real ni envío de token desde `ApiClient`.
- **Unidades**: `UnidadContext`/`UnidadSelector` existen, pero el selector no está montado; los formularios editan toneladas.
- **Tipos ampliados**: `capacidadM3`, `metrosCubicos`, `remolqueMatricula`, `expedienteId`, pesos/ticket/fotos.

## Stack y convenciones

### Frontend
- **React 18 + TypeScript + Vite 6**
- **MUI 7** para iconos/componentes base
- **Leaflet + react-leaflet** para mapas
- **react-router-dom v7**
- **recharts** para gráficas
- **Dexie + IndexedDB** para offline
- **tesseract.js** para OCR
- **vite-plugin-pwa + Workbox** para PWA
- **qrcode**, **jspdf**, **@turf/boolean-point-in-polygon**, **wicket**
- **shpjs**, **@tmcw/togeojson**, **jszip**, **node-unrar-js**, **proj4** para importación GIS

### Backend
- **Spring Boot 3.3.0 + Java 17**
- **Maven** (proyecto `vegapunk`)
- **PostgreSQL + Hibernate Spatial + Flyway**
- **Arquitectura hexagonal**: `domain/` → `application/` → `infrastructure/`

### Proxy
- Vite proxy: `/api` → `http://localhost:8080`

## Reglas de código

1. **Nunca añadas comentarios** salvo que sean estrictamente necesarios.
2. **Sigue las convenciones del proyecto** — mira archivos vecinos antes de escribir.
3. **CSS**: usa módulos (`src/styles/*.module.css`) para estilos nuevos. No añadas más inline styles (hay deuda técnica en pantallas antiguas/nuevas).
4. **Tipografía**: Bebas Neue para títulos, Inter para cuerpo, monospace para códigos de trazabilidad.
5. **Paleta**: usa las variables `--franky-*` y `--color-*` de `index.css`.
6. **No supongas librerías ni URLs** — verifica `package.json` y el código existente.
7. **AbortController** en hooks que hacen fetch.
8. **ErrorBoundary** por página (sólo la raíz es global).
9. **QR, CSV, PDF y OCR**: client-side, no backend.
10. **Tablas responsive** con `overflow-x: auto`.
11. **Tests**: hooks y utilidades con Vitest en `*/__tests__/`; E2E en `e2e/`.
12. **Offline**: cualquier escritura que deba sobrevivir sin cobertura va por la outbox (`enqueueOutbox`) con `clientRequestId`.
13. **Imports pesados** (Tesseract, GIS, mapas): carga diferida (`lazy`/`import()`), no en el bundle inicial.
14. **Roles**: usa `useRole()` y no dupliques condicionales de rol por la app.
15. **Nombres**: UI en español; código en inglés/camelCase como el resto del repo; no renombres la API de `camioneros` sin migración de backend.

## Workflow

1. **Antes de cambiar**: busca y entiende el código existente (grep, glob, read).
2. **Implementa**: cambios mínimos siguiendo las convenciones.
3. **Verifica** con los comandos de la sección siguiente.
4. **No hagas commits ni push** salvo autorización explícita del usuario.
5. **No fuerces push** ni uses `git rebase -i`/operaciones destructivas.
6. **No crees documentación nueva** (`*.md`) salvo que se pida.
7. **No añadas emojis** a archivos.

## Verificación (IMPORTANTE)

`npx tsc --noEmit` es un **no-op** en este repo: el `tsconfig.json` raíz sólo tiene `references`. Usa:

```bash
npm run typecheck        # tsc -b (fuente)
npm run typecheck:tests  # tsc -p tsconfig.tests.json (tests)
npm run lint             # eslint .
npm test                 # vitest run
npm run build            # tsc -b && vite build
```

Estado de referencia (nov 2026): typecheck fuente/tests OK, lint OK con 6 warnings de `react-refresh`, **143/143 tests**, build OK (aviso de chunk >500 kB).

E2E opcional:

```bash
npm run build
npm run test:e2e         # Playwright contra npm run preview en :4173
```

## Restricciones

- No hacer commits/push sin autorización explícita.
- No forzar push ni reescribir historia.
- No crear archivos nuevos si puedes editar existentes.
- No generar URLs externas ni asumir endpoints no verificados.
- No exponer secretos ni API keys.
- No usar `console.log` en producción (usa `console.debug` sólo en `DEV`).
- No modificar configuración de git.
- No romper la compatibilidad de la API `camioneros` desde el frontend sin coordinar backend.

## Estructura (Frontend)

```
lagalley/
├── src/
│   ├── pages/                 # Páginas por ruta (Conductor*, Agente*, Expediente*…)
│   ├── features/              # Lógica por dominio (api / hooks / components / types)
│   │   ├── auth/              # AuthContext, mockRoles, API de login (scaffold)
│   │   ├── camera/            # Captura y preprocesado de imagen
│   │   ├── config/            # RoleContext, UnidadContext, selectores
│   │   ├── dashboard/         # KPIs, tipos, hooks, gráficas y mapa de rutas
│   │   ├── expedientes/       # API, hooks y tipos
│   │   ├── ocr/               # Tesseract, parser de matrícula y ticket
│   │   ├── offline/           # Dexie, caché, outbox y sincronización
│   │   ├── pesaje/            # Guardado de capturas de pesaje
│   │   ├── pwa/               # ConnectionStatus
│   │   └── …                  # parcelas, transportes, camiones, camioneros, centros…
│   ├── components/            # Layout (AppLayout/Header/Sidebar/MobileBottomNav), QrScanner…
│   ├── styles/                # Módulos CSS (*.module.css)
│   ├── test/setup.ts          # Setup de Vitest (fake-indexeddb, jest-dom…)
│   ├── App.tsx                # Router + layout
│   ├── main.tsx               # Providers: Auth, Role, Unidad, Offline
│   └── index.css              # Variables CSS y resets
├── e2e/                       # Tests Playwright
├── design.md                  # Design system
├── prd.md                     # Product requirements
├── cambios.md                 # Changelog
├── CONTEXT.md                 # Resumen rápido
└── agents.md                  # Este archivo
```

> Backend `vegapunk` (repositorio aparte): arquitectura hexagonal `domain/ → application/ → infrastructure/`.
