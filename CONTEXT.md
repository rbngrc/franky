# Franky — Resumen Rápido del Proyecto

> Índice y visión general. Detalle en los documentos especializados de la sección "Documentos".

## ¿Qué es Franky?

**Franky** es una aplicación full-stack de **gestión forestal** orientada al **cumplimiento normativo EUDR** (European Union Deforestation Regulation, reglamento europeo antideforestación), con soporte adicional de las certificaciones **PEFC** y **SURE**.

Permite administrar todo el ciclo de trazabilidad de la madera: desde la **parcela de origen** (con su geometría catastral) hasta el **transporte** al centro de destino, pasando por la **flota** (camiones), los **conductores**, los **centros**, los **expedientes**, los **proveedores** y las **parcelas** con sus sub-recursos (lotes, personal y maquinaria asignada).

La aplicación tiene dos experiencias diferenciadas:

- **Gestión de oficina**: administradores y empresa trabajan con parcelas, expedientes, transportes, flota, centros, proveedores y paneles de cumplimiento.
- **Trabajo de campo**: conductores y agentes forestales usan una interfaz móvil para consultar transportes, escanear QR, fotografiar el vehículo y el ticket de pesaje y sincronizar cuando recuperan cobertura.

## ¿Qué hace?

- **Gestión de parcelas forestales**: CRUD, localización sobre mapa SIGPAC (clic en mapa, referencia catastral manual o dibujo manual), geolocalización PostGIS, **certificaciones EUDR/PEFC/SURE** editables e **importación desde archivos GIS** (`.geojson`, `.json`, `.zip`/`.rar` con Shapefile, `.kml`, `.kmz`).
- **Gestión de transportes**: CRUD con trazabilidad, vinculación a parcela/camión/conductor/centro/expediente, **cálculo automático de cumplimiento EUDR** por parcela, código de trazabilidad autogenerado e inmutable, remolque, listado con **filtro por fecha y ordenación**, exportación a **CSV/PDF** y generación de **QR** (client-side).
- **Flota y personal**: vehículos (camiones y remolques: matrícula, marca, capacidad, tara, tipo…) y conductores (DNI, carnet…).
- **Expedientes**: CRUD con estado, importe, proveedor, fechas y transportes vinculados.
- **Centros y proveedores**: CRUD de centros de destino y proveedores con país/región de origen.
- **Panel de Control** (`/dashboard`): KPIs, certificaciones, toneladas por tipo/mes, superficie por provincia/municipio, transportes por destino, flota por marca, kilometraje de rutas, mapa y calendario.
- **Dashboard EUDR / Cumplimiento**: métricas globales de cumplimiento, barra de progreso y razones de incumplimiento.
- **Flujo móvil de conductor**: transportes asignados, captura de 4 fotos obligatorias (frente, trasera, lateral y ticket), OCR de matrícula y ticket, revisión manual, guardado offline y sincronización.
- **Flujo de agente forestal**: listado de transportes, escaneo de QR (o código manual) y validación de datos/certificaciones.
- **Roles y vistas previas**: ADMIN_GENERAL, ADMIN_CHOPOS, ADMIN_FORESTAL, EMPRESA, CONDUCTOR, AGENTE_FORESTAL_OPERARIO y DIOS (superusuario con vista previa).
- **PWA offline-first**: instalable, caché de assets y de `/api/v1`, caché de transportes en IndexedDB y cola de cambios pendientes.

## ¿Cómo está construido?

### Repositorios
| Repositorio | Rol |
|-------------|-----|
| `lagalley` | **Frontend** React/TypeScript |
| `vegapunk` | **Backend** Spring Boot |

### Frontend (`lagalley`)
- **React 18 + TypeScript + Vite 6** con build y lint (`npm run build` = `tsc -b && vite build`, `npm run lint` = `eslint .`).
- **MUI 7** para iconos y componentes base, **Leaflet/react-leaflet** para mapas, **react-router-dom v7** para routing.
- Organización **feature-based** por dominio: `src/features/{parcela, transporte, camion, conductor, …}/{api,hooks,components,types}`.
- **recharts** para el Panel de Control; **Dexie/IndexedDB** para offline; **vite-plugin-pwa/Workbox** para la PWA.
- **tesseract.js** para OCR client-side y **qrcode/jsPDF** para QR y PDF.
- Geometría con **@turf/boolean-point-in-polygon**, parsing WKT con **wicket** e importación GIS con **shpjs/togeojson/jszip/node-unrar-js**.
- CSS con **módulos por componente** (`src/styles/*.module.css`) + variables centrales en `index.css`.
- Tests unitarios con **Vitest + Testing Library** (`npm test`) y E2E con **Playwright** (`npm run test:e2e`).
- Proxy Vite: `/api` → `http://localhost:8080` (backend). Añade un plugin `resolve-url-proxy` para resolución segura de URLs externas (Google Maps, Nominatim) evitando SSRF.

### Backend (`vegapunk`)
- **Spring Boot 3.3 + Java 17 + Maven**, puerto **8080**.
- **Arquitectura hexagonal**: `domain/` (modelo + puertos) → `application/` (servicios + DTOs) → `infrastructure/` (controllers web + persistencia JPA + configuración).
- **PostgreSQL** con **Hibernate Spatial** (PostGIS, SRID 4326) y **Flyway** para migraciones (`ddl-auto=validate`, `flyway.out-of-order=true`).
- Integración **SIGPAC/INSPIRE WFS + WMS de Catastro** para geometría catastral, con caché local en `C:/sigpac_cache/`.
- Endpoints de **autenticación** (`/api/v1/auth/login`) y **expedientes** consumidos por el frontend.
- Conexión BD local: `jdbc:postgresql://localhost:5432/vegapunk`, usuario `postgres`, password `root`.

## ¿Por qué está construido así?

| Decisión | Razón |
|----------|-------|
| Arquitectura hexagonal en backend | Separación clara de dominio/infraestructura, facilita testear con mocks y cambiar persistencia sin tocar lógica de negocio. |
| Feature-based en frontend | Escalabilidad: cada dominio (parcela, transporte…) agrupa su API, hooks, types y componentes. |
| IndexedDB + outbox (`clientRequestId`) | Permite trabajar sin cobertura en campo y reintentar de forma idempotente al recuperar conexión. |
| PWA con Workbox | Instalación en móvil y caché de assets/API sin tiendas de aplicaciones. |
| OCR client-side (tesseract.js) | Evita enviar fotos al backend y funciona en el dispositivo; el resultado siempre se revisa a mano. |
| Proxy Vite en vez de CORS en producción | Evita exponer CORS y centraliza el acceso al backend. |
| `AbortController` en hooks | Evita race conditions al desmontar componentes o cancelar peticiones. |
| `ErrorBoundary` por página | Contención de errores aislada (no tumba toda la app; sólo la raíz es global). |
| QR/CSV/PDF client-side | No carga al backend y funciona offline sin generar archivos en servidor. |
| `ddl-auto=validate` + Flyway | Migraciones versionadas y controladas; el esquema no se modifica por Hibernate. |
| Módulos CSS (`*.module.css`) | Aislamiento de estilos por componente sin conflictos de nombres globales. |
| Roles en el cliente (`RoleContext`) | Permite adaptar navegación y vistas por rol mientras se completa la autenticación de servidor. |

## 📄 Documentos

| Archivo | Contenido |
|---------|-----------|
| **`design.md`** | Sistema de diseño (formato Google Stitch): tokens, colores, tipografía, layout, componentes, elevación, shapes, do's & don'ts. |
| **`prd.md`** | Product Requirements: objetivo, usuarios, features, stack, data model, API endpoints, rutas, arquitectura, decisiones. |
| **`cambios.md`** | Changelog: historial de cambios del proyecto. |
| **`agents.md`** | Instrucciones del agente: rol, stack, convenciones, workflow, restricciones. |
| **`README.md`** | Guía de inicio rápido del repositorio `lagalley`. |

## Stack Resumen

- **Frontend**: React 18 + TS + Vite 6 + MUI 7 + Leaflet + react-router-dom v7 + recharts
- **Offline/PWA**: Dexie + IndexedDB + vite-plugin-pwa + Workbox
- **OCR/Cámara**: tesseract.js + MediaDevices + Canvas
- **Backend**: Spring Boot 3.3 + Java 17 + Maven (`vegapunk`)
- **DB**: PostgreSQL + Hibernate Spatial (PostGIS) + Flyway
- **Proxy**: Vite `/api` → `http://localhost:8080`

## Archivos Clave (Frontend)

| Archivo | Propósito |
|---------|-----------|
| `src/App.tsx` | Router + layout base (rutas anidadas bajo `AppLayout`) |
| `src/main.tsx` | Providers: Auth, Role, Unidad y Offline |
| `src/index.css` | Variables CSS (`--franky-*`, `--color-*`), resets, keyframes |
| `src/pages/` | Páginas por ruta (Inicio, Parcelas, Camiones, Conductores, Transportes, Centros, Proveedores, Expedientes, Dashboard, EUDR, conductor/agente) |
| `src/features/` | Lógica por dominio: api, hooks, components, types |
| `src/features/offline/` | Dexie, caché de transportes, outbox y sincronización |
| `src/features/ocr/` | Tesseract, parser de matrícula y ticket de pesaje |
| `src/features/dashboard/` | `useDashboardStats`, KPIs, gráficas y mapa de rutas |
| `src/components/` | Layout (AppLayout/Header/Sidebar/MobileBottomNav), QrScanner, CalendarWidget, ConfirmDialog, LoadingIndicator, ErrorBoundary |
| `src/styles/` | Módulos CSS (`*.module.css`) por componente/página |
| `vite.config.ts` | Proxy `/api`, PWA/Workbox y plugin `resolve-url-proxy` |

## Cómo arrancar

1. **Backend** (`vegapunk`): con PostgreSQL local arriba, `mvn spring-boot:run` (aplica migraciones Flyway al arrancar).
2. **Frontend** (`lagalley`): `npm install` y `npm run dev` (Vite, con proxy a `localhost:8080`).
3. **PWA/offline**: `npm run build` y `npm run preview` (el service worker sólo se registra en build).

## Estado actual y pendientes

- `npm run typecheck`, `npm run typecheck:tests`, `npm run lint`, `npm test` (143/143) y `npm run build` pasan.
- **Acceso**: `/login` es un mockup (selección de rol, sin credenciales ni token); la sesión se guarda en `sessionStorage` y sin ella las rutas redirigen a `/login`. La cabecera muestra **Mi perfil** y «Cerrar sesión». Siguen pendientes la autenticación real (`AuthApiService`, `ProtectedRoute` sin montar como guardia real) y el envío de token desde `ApiClient`.
- El selector de unidad t/m³ existe pero no está montado; los formularios sólo editan toneladas.
- La caché offline cubre transportes; no hay resolución de conflictos ni Background Sync.
- El OCR y el QR dependen del navegador/dispositivo y siempre requieren revisión humana.
