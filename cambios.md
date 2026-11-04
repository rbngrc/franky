# Cambios — Franky

## [0.1.0] — 2026-06-29

### Añadido
- Commit inicial del proyecto (`560e985`)

### Frontend
- CSS unificado: migración de todos los inline styles de las 15 páginas a className en App.css
- Dashboard: grid 1fr 1fr con mapa + CalendarWidget
- Transportes list: columna EUDR con badge en vez de detalle de dos líneas; código trazabilidad con bg monospace
- Transporte detail: código trazabilidad como subtítulo (monospace, bold, 1.15rem); título editable (nombre); badge EUDR encima del QR; eliminado bloque EUDR de columna izquierda (banner naranja de incumplimiento se mantiene)
- TransporteFormData: añadido campo `nombre?` opcional
- SigpacMapViewer: corregido bug de closure en drawingMode (ref); cursor crosshair al dibujar; circleMarkers visibles; polyline discontinua conectando puntos

### Backend
- Backend `vegapunk` con arquitectura hexagonal
- Entidades: parcelas, camiones, camioneros, transportes, centros, proveedores, lotes, personal, maquinaria
- API REST completa con endpoints CRUD + SIGPAC
- Flyway migrations
- Integración INSPIRE WFS para geometría catastral

### Documentación
- Separación de CONTEXT.md en 4 documentos: design.md, prd.md, cambios.md, agents.md
- CONTEXT.md mantenido como resumen índice

## [0.2.0] — 2026-09-09

### Parcelas: certificaciones y ubicación completas
- **Backend** (`vegapunk`):
  - Migración `V202609090001__add_certificaciones_to_parcelas.sql`: columnas `deforestacion_ok`, `produccion_legal_ok`, `certificacion_pefc`, `codigo_certificacion_pefc`, `fecha_auditoria_pefc`, `fecha_vencimiento_pefc`, `certificacion_sure`, `codigo_certificacion_sure`, `fecha_auditoria_sure`, `fecha_vencimiento_sure`.
  - Migración `V202609090002__add_ubicacion_to_parcelas.sql`: columnas `municipio` y `provincia`.
  - Dominio `Parcela` con `actualizarCertificaciones(...)` y `actualizarDatosBasicos(referenciaCatastral, municipio, provincia)`.
  - DTO de actualización ampliado (`ActualizarParcelaRequest`) y response con todos los campos nuevos.
  - `ParcelaApplicationService.actualizarParcela(...)` aplica nombre + datos básicos + certificaciones.
- **Frontend** (`lagalley`): formulario de edición de parcela con nombre, referencia catastral, municipio, provincia y el bloque EUDR/PEFC/SURE.
- **UX**: botón claro **"Editar parcela"** en la cabecera (antes sólo existía "Editar certificaciones"); botón de guardar renombrado a **"Guardar parcela"**.

### Calidad / CI (para el primer push a GitHub)
- `tsconfig.app.json`: excluido el directorio de tests (`src/**/__tests__`, `*.test.*`, `src/test`) del typecheck de build; los tests se validan con Vitest en runtime.
- `vite.config.ts`: `defineConfig` ahora se importa de `vitest/config` para que el bloque `test` sea válido en el typecheck.
- `centro.types.ts`: añadido `localidad?: string | null` (el código de Transportes ya la usaba).
- `transporteApiService.tsx`: corregido `recalcularEudrPorParcela` — faltaba el argumento `body` en `ApiClient.post`.
- Tests actualizados para reflejar el estado real de los componentes: `NotFoundPage.test.tsx` (texto y selector del enlace), `DashboardPage.test.tsx` ("Cumplen EUDR", conteo), `apiClient.test.ts` (mensaje de error).
- Resultado: `lint`, `tsc -b`, `vitest` (36/36) y `npm run build` pasan.

## [0.3.0] — 2026-10-14

### Expedientes: CRUD completo + asociación a proveedor y transporte
- **Backend** (`vegapunk`):
  - `Transporte` (dominio, request, response, DBO y mapper) gana el campo `expedienteId` (columna `transportes.expediente_id`, que ya existía vía migración `V202610060003` pero no estaba mapeada).
  - `TransporteApplicationService` propaga `expedienteId` en alta, edición y respuesta.
- **Frontend** (`lagalley`):
  - `expediente.types.ts` alineado con el backend (`proveedorId`, fechas, `estado`, `importe`, `observaciones`, `activo`).
  - `useExpedientes` ampliado con `createExpediente` / `updateExpediente` / `deleteExpediente`; nuevo `useExpediente(id)`.
  - Nueva `ExpedientesPage` (tabla con proveedor resuelto, estado, importe, acciones y borrado con confirmación), `ExpedienteFormPage` (con selector de proveedor) y `ExpedienteDetailPage` (con proveedor y transportes vinculados).
  - Rutas nuevas: `/expedientes/nuevo`, `/expedientes/editar/:id`, `/expedientes/:id`.
  - `TransporteFormPage` y `TransporteDetailPage` incorporan selector/mostrado de **Expediente**.
  - `InicioPage`: módulo y acción rápida de Expedientes.
  - Constantes `ESTADO_OPTIONS` / `estadoBadgeClass` en `src/constants/expediente.ts`.
- **Tests**: nuevo `ExpedientesPage.test.tsx`; `InicioPage.test.tsx` incluye Expedientes. Resultado: `vitest` (140/140) y `mvn -Dtest=TransporteTest` (3/3) pasan.

## [0.3.1] — 2026-10-14

### Camión y Transporte: soporte de remolque
- **Backend** (`vegapunk`): se mapea la columna `remolque_matricula` (ya existente vía migración `V202610060003`) en `Camion` y `Transporte` (dominio, request, response, DBO, mapper y servicios). No cambia el esquema; sólo se expone un campo que la BD y los tipos del frontend ya contemplaban.
- **Frontend** (`lagalley`):
  - `CamionFormPage`: nuevo campo **Remolque (matrícula)**.
  - `CamionDetailPage`: muestra el remolque.
  - `TransporteFormPage` y `TransporteDetailPage` (edición + lectura): nuevo campo remolque.
  - Test `CamionFormPage.test.tsx` actualizado (el payload incluye `remolqueMatricula`).
- **Datos de prueba** creados vía API (Quedan persistidos en la BD local):
  - Proveedor `Maderas del Norte S.L.` (NIF B12345678, España / Castilla y León).
  - Camionero `87654321X` (Carlos / Pruebas Test).
  - Camión `9999PRU` (Volvo FH16, tara 13500) con remolque `R-1111-REM`.
  - Expediente `EXP-PRUEBA-001` (id 1, estado ADJUDICADO, importe 12345,67 €, **proveedor asignado**: Maderas del Norte S.L.).
  - Transporte (id 5) que enlaza parcela PRAE + camión `9999PRU` + camionero `87654321X` + expediente 1 + remolque `R-1111-REM`.
- **Nota**: crear un camión cuya matrícula contenga espacios devuelve 400 porque el controlador construye la cabecera `Location` con `URI.create("/api/v1/camiones/" + matricula)`. Se recomienda URL-encodear la matrícula en `CamionController.registrarCamion`/`actualizarCamion` (pendiente).

## [0.4.0] — 2026-11-04

### Movilidad, roles, PWA offline, OCR y Panel de Control

#### Roles y navegación
- **`RoleContext`** con `ADMIN_GENERAL`, `ADMIN_CHOPOS`, `ADMIN_FORESTAL`, `EMPRESA`, `CONDUCTOR`, `AGENTE_FORESTAL_OPERARIO` y `DIOS`.
- Selector de rol en `Header`; sidebar filtrado por rol (Inicio, Panel de Control, Expedientes, Parcelas, Camiones, Conductores, Transportes, Centros, Proveedores, Cumplimiento).
- `DIOS` puede previsualizar la experiencia de conductor/agente; selector de conductor activo.
- Nuevas homes por rol: `ConductorHomePage` y `AgenteHomePage`; `InicioPage` delega en ellas según el rol.
- Páginas renombradas de `Camionero*` a `Conductor*` (con exports de compatibilidad) y rutas `/conductores` + `/conductor`.
- **Corrección**: enlaces heredados `/camionero`/`/camionero/escanear/:id` actualizados a `/conductor`; textos con escapes `\u00xx` corregidos en la UI del conductor.

#### Autenticación (scaffold)
- `AuthContext` con persistencia en `localStorage` (`franky.auth.user`).
- `AuthApiService.login` tipado con `LoginResponse` (`/auth/login`).
- `useLogin`, `LoginPage` y `ProtectedRoute`.
- **Pendiente**: montar `/login` en el router, proteger rutas y enviar token desde `ApiClient`.

#### Flujo de conductor y pesaje
- `ConductorEscanearPage`: flujo guiado de 4 fotos obligatorias (frente, trasera, lateral, ticket), OCR de matrícula y ticket, revisión/edición manual, confianza media de OCR y guardado.
- `features/camera`: `CameraCapture`, `useCamera`, captura desde vídeo/archivo, downscale y preprocesado para OCR.
- `features/ocr`: Tesseract.js (`spa`) con carga diferida, `parsePlate` y `parseWeighingTicket` (peso bruto, tara, neto, ticket, fecha y hora).
- `features/pesaje`: `saveCapturaTransporte`, validación de las 4 fotos y persistencia de `CapturaRecord` (con estado `synced`).
- Transporte ampliado con `pesoBrutoKg`, `taraKg`, `pesoNetoKg`, `numeroTicket`, `fechaPesaje`, `horaPesaje` y `fotos`.

#### Flujo de agente forestal
- `AgenteEscanearPage` con `QrScanner` (`BarcodeDetector`) y entrada manual de código de trazabilidad/ID; resuelve y abre el transporte.
- `AgenteHomePage` con listado de transportes, estado online/offline, sincronización y badges EUDR/PEFC/SURE.

#### Offline-first y PWA
- `Dexie` (`franky-offline`) con `transportesCache`, `outbox` y `capturas` (versiones 1–3).
- `OfflineProvider`, `useOnlineStatus`, `useOutbox` y `ConnectionStatus` (Online/Offline/Sincronizando/pendientes/errores).
- `syncQueue`: encolado idempotente con `clientRequestId`, cabecera `X-Client-Request-Id`, reintentos, marcado de fallos y limpieza al sincronizar.
- `transportesCache` y `useTransportesOfflineFirst`: red primero y fallback a caché local; filtrado por conductor.
- `vite-plugin-pwa` + Workbox: manifest, iconos 192/512/maskable, `registerType: autoUpdate`, precache de assets, NetworkFirst para `/api/v1` (24 h) y CacheFirst para el CDN de Tesseract.
- Metadatos PWA en `index.html` (theme-color, apple-touch-icon, apple-mobile-web-app).
- `MobileBottomNav` para conductor/agente (Inicio, Escáner, Sincronizar) y layout móvil sin sidebar.

#### Panel de Control
- Ruta `/dashboard` restaurada y enlazada desde Inicio y sidebar.
- `useDashboardStats`: KPIs (parcelas, superficie, camiones, conductores, transportes, toneladas, ratios, centros, proveedores), certificaciones y series agregadas.
- Componentes `KpiGrid`, `ChartCard` y gráficas recharts: toneladas por tipo de madera, evolución mensual, cumplimiento de certificaciones, superficie por provincia/municipio, transportes por destino, flota por marca y kilometraje de rutas.
- `DashboardRoutesMap` calcula rutas con OSRM (con fallback a distancia Haversine) y expone `onDistances` al gráfico de kilometraje.
- Mapa, calendario y últimos transportes con badges de cumplimiento.

#### Importación GIS de parcelas
- Nueva ruta `/parcelas/importar-gis` y `ImportarParcelaGisPage`.
- `ParcelaGisImportModal` reutilizable en el detalle de parcela.
- `parseGisFile`: soporte `.geojson`, `.json`, `.zip`/`.rar` con Shapefile, `.kml` y `.kmz`; detección de campos (nombre, RC, municipio, provincia), datos extra, área, WKT y previsualización en mapa.
- Nuevas dependencias: `shpjs`, `@tmcw/togeojson`, `jszip`, `node-unrar-js`, `proj4`.

#### Tipos y datos
- `Camion`: `capacidadM3?`, `remolqueMatricula?`.
- `Parcela`: `datosExtra`, certificaciones y campos de ubicación ya soportados.
- `Transporte`: `metrosCubicos`, `remolqueMatricula`, `expedienteId`, pesos/ticket/fotos, `conductorDni`/`conductorNombre` (compatibilidad con `camionero*`).
- `Expediente`: código, licitación, fechas, proveedor, estado, importe, observaciones y activo.
- Constantes `TIPO_MADERA_OPTIONS`/`tipoMaderaLabel` y `ESTADO_OPTIONS`/`estadoLabel`/`estadoBadgeClass`.

#### Tests y calidad
- Nuevos tests: cámara (captura/downscale/preprocesado), OCR (matrícula/ticket), offline (sync queue/caché), pesaje, GIS import, `useTransportesOfflineFirst`, `ExpedientesPage`, `InicioPage` y `apiClient`.
- `tsconfig.tests.json` para typecheck de tests; `npm run typecheck:tests`.
- Resultado de referencia: **34 archivos / 143 tests**, `typecheck` y `typecheck:tests` OK, `lint` OK (6 warnings de `react-refresh`), `build` OK (aviso de chunk >500 kB).

#### Pendientes conocidos
- Auth no cableada en router/`ApiClient` (ver arriba).
- `UnidadContext`/`UnidadSelector` existen pero no están montados; los formularios sólo editan toneladas.
- Offline limitado a transportes; sin resolución de conflictos ni Background Sync.
- OCR/QR dependen del dispositivo, permisos y navegador; requieren revisión humana.
- El kilometraje de rutas usa la API pública de OSRM (posible rate limiting).
- Quedan inline styles en pantallas nuevas/antiguas; la guía sigue siendo usar módulos CSS.
