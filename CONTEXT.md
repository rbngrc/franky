# Franky — Resumen Rápido del Proyecto

> Índice y visión general. Detalle en los documentos especializados de la sección "Documentos".

## ¿Qué es Franky?

**Franky** es una aplicación full-stack de **gestión forestal** orientada al **cumplimiento normativo EUDR** (European Union Deforestation Regulation, reglamento europeo antideforestación), con soporte adicional de las certificaciones **PEFC** y **SURE**.

Permite administrar todo el ciclo de trazabilidad de la madera: desde la **parcela de origen** (con su geometría catastral) hasta el **transporte** al centro de destino, pasando por la **flota** (camiones), los **camioneros**, los **centros**, las **parcelas** y sus sub-recursos (lotes, personal y maquinaria asignada), y los **proveedores**.

## ¿Qué hace?

- **Gestión de parcelas forestales**: CRUD completo, localización sobre mapa SIGPAC (3 modalidades: clic en mapa, referencia catastral manual o dibujo manual), geolocalización PostGIS y **certificaciones EUDR/PEFC/SURE** editables.
- **Gestión de transportes**: CRUD con trazabilidad, vinculación a parcela/camión/camionero/centro, **cálculo automático de cumplimiento EUDR** por parcela, código de trazabilidad autogenerado e inmutable, exportación a **CSV** y generación de **QR** (client-side).
- **Flota y personal**: camiones (matrícula, marca, capacidad, tara…) y camioneros (DNI, carnet…).
- **Centros y proveedores**: CRUD de centros de destino y proveedores con país/región de origen.
- **Dashboard EUDR / Cumplimiento**: métricas globales de cumplimiento, barra de progreso y razones de incumplimiento.
- **Dashboard principal**: métricas, mapa de geolocalización y calendario de transportes.

## ¿Cómo está construido?

### Repositorios
| Repositorio | Rol |
|-------------|-----|
| `lagalley` | **Frontend** React/TypeScript |
| `vegapunk` | **Backend** Spring Boot |

### Frontend (`lagalley`)
- **React 18 + TypeScript + Vite 6** con build y lint (`npm run build` = `tsc -b && vite build`, `npm run lint` = `eslint .`).
- **MUI 7** para componentes base, **Leaflet/react-leaflet** para mapas, **react-router-dom v7** para routing.
- Organización **feature-based** por dominio: `src/features/{parcela, transporte, camion, …}/{api,hooks,components,types}`.
- QR (`qrcode`) y CSV client-side; geometría con `@turf/boolean-point-in-polygon` y parsing WKT con `wicket`; PDF con `jspdf`.
- CSS con **módulos por componente** (`src/styles/*.module.css`) + señales centrales en `index.css`.
- Tests unitarios con **Vitest + Testing Library** (`npm test`).
- Proxy Vite: `/api` → `http://localhost:8080` (backend). Añade un plugin `resolve-url-proxy` para resolución segura de URLs externas (Google Maps, Nominatim) evitando SSRF.

### Backend (`vegapunk`)
- **Spring Boot 3.3 + Java 17 + Maven**, puerto **8080**.
- **Arquitectura hexagonal**: `domain/` (modelo + puertos) → `application/` (servicios + DTOs) → `infrastructure/` (controllers web + persistencia JPA + configuración).
- **PostgreSQL** con **Hibernate Spatial** (PostGIS, SRID 4326) y **Flyway** para migraciones (`ddl-auto=validate`, `flyway.out-of-order=true`).
- Integración **SIGPAC/INSPIRE WFS + WMS de Catastro** para geometría catastral, con caché local en `C:/sigpac_cache/`.
- Conexión BD local: `jdbc:postgresql://localhost:5432/vegapunk`, usuario `postgres`, password `root`.

## ¿Por qué está construido así?

| Decisión | Razón |
|----------|-------|
| Arquitectura hexagonal en backend | Separación clara de dominio/infraestructura, facilita testear con mocks y cambiar persistencia sin tocar lógica de negocio. |
| Feature-based en frontend | Escalabilidad: cada dominio (parcela, transporte…) agrupa su API, hooks, types y componentes. |
| Proxy Vite en vez de CORS en producción | Evita exponer CORS y centraliza el acceso al backend. |
| `AbortController` en hooks | Evita race conditions al desmontar componentes o cancelar peticiones. |
| `ErrorBoundary` por página | Contención de errores aislada (no tumba toda la app; sólo la raíz es global). |
| QR/CSV client-side | No carga al backend y funciona offline sin generar archivos en servidor. |
| `ddl-auto=validate` + Flyway | Migraciones versionadas y controladas; el esquema no se modifica por Hibernate. |
| Módulos CSS (`*.module.css`) | Aislamiento de estilos por componente sin conflictos de nombres globales. |

## 📄 Documentos

| Archivo | Contenido |
|---------|-----------|
| **`design.md`** | Sistema de diseño (formato Google Stitch): tokens, colores, tipografía, layout, componentes, elevación, shapes, do's & don'ts. |
| **`prd.md`** | Product Requirements: objetivo, usuarios, features, stack, data model, API endpoints, rutas, arquitectura, decisiones. |
| **`cambios.md`** | Changelog: historial de cambios del proyecto. |
| **`agents.md`** | Instrucciones del agente: rol, stack, convenciones, workflow, restricciones. |
| **`README.md`** | Guía de inicio rápido del repositorio `lagalley`. |

## Stack Resumen

- **Frontend**: React 18 + TS + Vite 6 + MUI 7 + Leaflet + react-router-dom v7
- **Backend**: Spring Boot 3.3 + Java 17 + Maven (`vegapunk`)
- **DB**: PostgreSQL + Hibernate Spatial (PostGIS) + Flyway
- **Proxy**: Vite `/api` → `http://localhost:8080`

## Archivos Clave (Frontend)

| Archivo | Propósito |
|---------|-----------|
| `src/App.tsx` | Router + layout base (rutas anidadas bajo `AppLayout`) |
| `src/index.css` | Variables CSS (*--franky-**, *--color-**), resets, keyframes |
| `src/pages/` | Páginas por ruta (parcelas, camiones, transportes, centros, proveedores, EUDR…) |
| `src/features/` | Lógica por dominio: api, hooks, components, types |
| `src/components/` | Shared: CalendarWidget, ConfirmDialog, LoadingIndicator, ErrorBoundary, Layout (AppLayout/Header/Sidebar) |
| `src/styles/` | Módulos CSS (`*.module.css`) por componente/página |
| `vite.config.ts` | Proxy `/api` + plugin `resolve-url-proxy` |

## Cómo arrancar

1. **Backend** (`vegapunk`): con PostgreSQL local arriba, `mvn spring-boot:run` (aplica migraciones Flyway al arrancar).
2. **Frontend** (`lagalley`): `npm install` y `npm run dev` (Vite, con proxy a `localhost:8080`).
