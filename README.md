# Franky — Frontend

Frontend de **Franky**, aplicación full-stack de gestión forestal orientada al cumplimiento **EUDR** (con PEFC y SURE). Construido con **React 18 + TypeScript + Vite 6** e instalable como **PWA** con soporte **offline-first** para el trabajo de campo.

El backend (Spring Boot) vive en un repositorio separado: **`vegapunk`**.

## Stack

- **React 18 + TypeScript + Vite 6**
- **MUI 7** — iconos y componentes base
- **Leaflet + react-leaflet** — mapas (SIGPAC, rutas y geolocalización)
- **react-router-dom v7** — routing
- **recharts** — gráficas del Panel de Control
- **Dexie + IndexedDB** — caché local y cola de sincronización offline
- **vite-plugin-pwa + Workbox** — manifest, service worker y caché de assets/API
- **tesseract.js** — OCR client-side (matrículas y tickets de pesaje)
- **@turf/boolean-point-in-polygon** — geometría (point-in-polygon)
- **wicket** — parser WKT
- **shpjs / @tmcw/togeojson / jszip / node-unrar-js** — importación GIS
- **qrcode** — QR client-side
- **jspdf** — exportación PDF
- **Vitest + Testing Library** — tests unitarios
- **Playwright** — tests end-to-end

## Requisitos

- Node.js moderno (compatible con Vite 6)
- El backend **`vegapunk`** corriendo en `http://localhost:8080`
- Cámara y micrófono no son necesarios para arrancar, pero el flujo de escaneo requiere **permisos de cámara** y **contexto seguro** (HTTPS o `localhost`)
- El lector de QR usa `BarcodeDetector`; si el navegador no lo soporta, queda la entrada manual del código
- La primera ejecución del OCR descarga el modelo de español de Tesseract (después queda cacheado)

## Puesta en marcha

```bash
npm install
npm run dev
```

El proxy de Vite redirige `/api` → `http://localhost:8080`.

Para probar la PWA y el service worker:

```bash
npm run build
npm run preview
```

## Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Compilar (`tsc -b` + `vite build`) |
| `npm run preview` | Previsualizar build de producción (PWA) |
| `npm run typecheck` | Typecheck de la fuente (`tsc -b`) |
| `npm run typecheck:tests` | Typecheck de los tests (`tsconfig.tests.json`) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm test` / `test:watch` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright; usa `npm run preview` en `:4173`) |
| `npm run format` / `format:check` | Prettier |

> `npx tsc --noEmit` es un no-op en este repo: el `tsconfig.json` raíz sólo contiene `references`. Usa `npm run typecheck` y `npm run typecheck:tests`.

## Funcionalidades

- **Inicio** como home con módulos y acciones rápidas; cambia según el rol.
- **Parcelas**: listado, alta desde SIGPAC, importación GIS y detalle con certificaciones.
- **Transportes**: CRUD, trazabilidad, QR/PDF, remolque, expediente, fotos y datos de pesaje.
- **Flota y personal**: camiones y conductores (antes camioneros).
- **Centros y proveedores**: CRUD completo.
- **Expedientes**: CRUD, estado, importe, proveedor y transportes vinculados.
- **Panel de Control** (`/dashboard`): KPIs, certificaciones, gráficas de toneladas, superficie, flota y kilometraje de rutas.
- **Cumplimiento** (`/eudr`): dashboard EUDR/PEFC/SURE.
- **Flujo conductor**: transportes asignados, escaneo de matrícula y ticket, 4 fotos obligatorias, guardado local y sincronización.
- **Flujo agente forestal**: listado de transportes, escaneo de QR y validación de datos.
- **Offline-first**: caché de transportes, outbox con `clientRequestId` y sincronización automática al recuperar conexión.
- **PWA**: instalable, con caché de assets y de `/api/v1` (NetworkFirst).

## Estructura

```
src/
├── pages/            # Páginas por ruta (incluye conductor/ y agente/)
├── features/         # Lógica por dominio
│   ├── auth/         # AuthContext, LoginPage (scaffold), API de login
│   ├── camera/       # Captura de cámara y preprocesado de imagen
│   ├── config/       # RoleContext, UnidadContext y selectores
│   ├── dashboard/    # KPIs, tipos, hooks y gráficas (recharts)
│   ├── expedientes/  # API, hooks y tipos
│   ├── ocr/          # Tesseract, parser de matrícula y ticket
│   ├── offline/      # Dexie, caché, outbox y sincronización
│   ├── pesaje/       # Guardado de capturas de pesaje
│   ├── pwa/          # Estado de conexión
│   └── …             # parcelas, transportes, camiones, centros, etc.
├── components/       # Layout, QrScanner, CalendarWidget, ErrorBoundary…
├── styles/           # Módulos CSS (*.module.css)
├── App.tsx           # Router + layout
└── index.css         # Variables CSS y resets
e2e/                  # Tests Playwright
```

## Tests

- **Vitest + Testing Library**: `npm test` (34 archivos, 143 tests).
- **Playwright**: `npm run test:e2e` (navegación, Inicio y Panel de Control con APIs mockeadas).

## Documentación

- `CONTEXT.md` — resumen rápido del proyecto
- `design.md` — sistema de diseño
- `prd.md` — requisitos de producto
- `cambios.md` — changelog
- `agents.md` — instrucciones del agente

## Limitaciones conocidas

- **Autenticación**: existen `AuthContext`, `AuthApiService.login`, `LoginPage` y `ProtectedRoute`, pero el router aún no monta `/login` ni protege las rutas, y `ApiClient` no envía token. El selector de rol es la vía operativa actual.
- **Unidades t/m³**: `UnidadContext` y `UnidadSelector` existen, pero el selector no está montado en el layout y los formularios sólo editan toneladas. Los tipos admiten `capacidadM3` y `metrosCubicos`.
- **Offline**: se cachean transportes; la outbox sólo encola `POST`/`PUT` y no hay resolución de conflictos ni Background Sync.
- **OCR**: depende de la calidad de la foto y de la descarga inicial del modelo `spa` de Tesseract.
- **QR**: requiere `BarcodeDetector` (Chromium) y permisos de cámara; hay entrada manual como fallback.
- **Rutas**: el kilometraje usa la API pública de OSRM y puede verse limitado por rate limiting.
- **Build**: Vite avisa de un chunk principal grande; `recharts` y `leaflet` ya están separados en `manualChunks`.
