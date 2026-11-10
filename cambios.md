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

## [0.4.2] — 2026-11-10

### Inicio: menú de módulos
- Eliminada la sección "Acciones rápidas".
- "Módulos" pasa a un menú vertical clásico ordenado **igual que el sidebar** (Panel de Control, Expedientes, Parcelas, Vehículos, Conductores, Transportes, Centros, Proveedores, Cumplimiento).
- Cada módulo con formulario de alta tiene una **flecha** a la derecha que abre un submenú con las acciones de creación (nuevo expediente, nueva parcela desde SIGPAC, importar GIS, nuevo vehículo, nuevo conductor, nuevo transporte, nuevo centro, nuevo proveedor). El submenú permanece abierto hasta volver a pulsar el módulo (o abrir otro) y se cierra al elegir una opción.
- **Toda la fila abre el submenú** (ya no navega directamente): el submenú muestra primero **Consultar** (va al listado del módulo) y debajo las opciones de creación.
- Pantallas de alta y edición (expediente, vehículo, conductor, transporte, centro y proveedor): los enlaces de vuelta **«Volver al menú»** e **«Volver a &lt;módulo&gt;»** se pintan una sola vez desde el layout (`src/components/BackLinks.tsx`, renderizado en `AppLayout`), arriba a la izquierda del contenido, en el mismo sitio en todas las pantallas.

### Inicio: vuelta al menú encima del título
- El **sidebar** mantiene marca y pie en todas las pantallas; en `/` (roles de oficina) **no muestra opciones** y deja el **mapa de relieve** a plena vista, mientras que en el resto de rutas el menú se ve **por encima del dibujo**, atenuado (`src/components/Layout/TerrenoIlustracion.tsx` + `src/styles/Terreno.module.css`).
- El enlace **«← Volver al menú»** ya no va en la cabecera: se muestra encima del título de la página con el estilo `.back-link` de las demás pantallas (`src/components/Layout/AppLayout.tsx`), salvo en `/` y en las pantallas de alta, que ya lo incluyen en `BackLinks`.
- El menú de módulos ocupa de nuevo todo el ancho de la tarjeta (sin ilustración lateral).
- Cabecera: añadidas etiquetas de ruta que faltaban (`/dashboard`, `/expedientes`, `/expedientes/nuevo`, `/parcelas/importar-gis`, `/proveedores`, `/proveedores/nuevo`) para que el título no caiga en «Franky App».
- Tests: orden del menú, apertura del submenú y enlaces de vuelta en `InicioPage.test.tsx` y `CamionFormPage.test.tsx` (165/165 OK).

### Cabecera y descripciones de página
- **Cabecera más grande y visible**: más padding, título a 1.8rem con sombra, **título centrado** (`styles.titleWrap` en `Header.module.css`). El selector de rol, el de conductor y el estado de conexión siguen a la derecha.
- El título de la página vive en la cabecera; en el contenido, el antiguo `h1` pasa a ser una **descripción corta** con la clase `.page-desc` (`App.css`) en Inicio, Panel de Control, Expedientes, Parcelas, Vehículos, Conductores, Transportes, Centros, Proveedores y Cumplimiento.
- Formularios de alta/edición: la descripción indica «Alta de un nuevo …» o «Datos del …» según el caso.
- Formularios y **detalles** (vehículo, conductor, transporte, expediente, centro, proveedor y parcela): los enlaces **«← Volver al menú»** y **«← Volver a &lt;módulo&gt;»** salen siempre en la misma fila superior izquierda del contenido (`BackLinks` en `AppLayout`); se retiraron los enlaces de vuelta que cada detalle pintaba por su cuenta (y el botón «Volver» del detalle de centro).
- La cabecera reconoce también las rutas de edición (`/camiones/editar/…`, etc.) para no caer en «Franky App».

### Fondo de sección (watermark)
- Cada sección de oficina pinta su icono como **marca de agua grande y suave** en la esquina inferior derecha del contenido (`src/components/Layout/SeccionFondo.tsx` + `.watermark` en `AppLayout.module.css`): Panel de Control, Expedientes, Parcelas, Vehículos, Conductores, Transportes, Centros, Proveedores y Cumplimiento.
- El icono va detrás del contenido (`.content` con `z-index: 1`), es decorativo (`aria-hidden`, `pointer-events: none`) y se oculta en móvil (`max-width: 900px`). En Inicio no se muestra.

### Tablas de consulta unificadas
- Todas las tablas de consulta (Vehículos, Conductores, Transportes, Expedientes, Centros, Proveedores y Parcelas) muestran en la columna de acciones **solo «Ver detalle →»** (`btn btn-sm btn-outline`), con el mismo aspecto.
- Los botones de **Editar** y **Eliminar** pasan a los detalles: transporte, expediente, centro, parcela, vehículo, conductor y proveedor los muestran arriba a la derecha, en el mismo sitio. Al borrar se vuelve al listado; si el registro tiene transportes/expedientes asociados, se muestra el error en el propio detalle.
- Vehículos y conductores estrenan `DELETE /camiones/{matricula}` y `DELETE /camioneros/{dni}` en el backend (`CamionApplicationService`/`CamioneroApplicationService` y sus controladores). Proveedores ya tenía endpoint de borrado.
- La tabla de Parcelas usa ahora la tabla común (`.table` / `.table-wrapper`) y los estados EUDR como badges.
- Nuevo estilo `.btn-outline-danger` en `App.css` para el botón de eliminar de las cabeceras de detalle.
- La cabecera de Parcelas (descripción + «+ Nueva parcela») solo se muestra en el listado, no en el detalle de parcela.

### Parcelas: misma estética que el resto
- La página de Parcelas deja las pestañas, usa el encabezado común (`.page-container` + `.page-header`) con la descripción y un botón **«+ Nueva parcela»** que lleva a la nueva pantalla de alta.
- Nueva ruta **`/parcelas/nueva`** (`src/pages/NuevaParcelaPage.tsx`): una sola página con dos botones arriba, **Desde catastro** / **Importar desde GIS**, que cambian el contenido, igual que las pestañas de «Nuevo vehículo». Las rutas antiguas siguen funcionando.
- La lista se ve en `/parcelas/tabla` (opción «Consultar» del menú). El alta tiene **«← Volver al menú»** y **«← Volver a parcelas»**.
- En el sidebar y en el menú de Inicio, la opción de alta pasa a ser una sola: **«Nueva parcela»**.

### Sidebar con submenús
- En las páginas con menú (roles de oficina), cada opción del sidebar es ahora un **botón que despliega un submenú** igual que en Inicio: «Consultar» más las acciones de creación del módulo (nuevo expediente, nueva parcela, vehículo, conductor, transporte, centro, proveedor).
- El submenú se cierra al elegir una opción o al volver a pulsar el módulo, y solo hay uno abierto a la vez. «Inicio» sigue navegando directamente y los menús de conductor/agente no cambian.

### Vehículos: camiones y remolques
- La sección "Camiones" pasa a llamarse **Vehículos** (sidebar, cabecera, Inicio y títulos), sin cambiar las rutas `/camiones`.
- Formulario de alta con **dos pestañas**: "Camiones" y "Remolques"; el tipo se guarda en el nuevo campo `tipo` (`CAMION` / `REMOLQUE`, por defecto `CAMION`).
- Listado de vehículos con columna **Tipo** (badge) y detalle adaptado según sea camión o remolque.
- Formularios de transporte (alta y edición): el remolque se elige de un **desplegable** con los remolques activos; el desplegable de camión ya no muestra remolques.
- En el alta/edición de un camión, el remolque asignado también se elige de la lista de remolques.
- **Marca y modelo no son obligatorios para remolques** (solo la matrícula); en los camiones siguen siendo obligatorios.
- Panel de Control: "Camiones activos", capacidad media y flota por marca excluyen los remolques.
- Backend (`vegapunk`): migración `V202611100001__add_tipo_to_camiones.sql`, campo `tipo` en dominio, DTOs, entidad JPA y mapper.
- CSS: nuevo `src/styles/CamionFormPage.module.css` (pestañas) y clase `.badge-info` en `App.css`.
- Tests: 164/164 OK (nuevo caso de guardado de remolque desde la pestaña).

### Login mockup y "Mi perfil"
- Nueva página `/login` (`src/pages/LoginPage.tsx` + `LoginPage.module.css`): **desplegable de roles** (sin usuarios ni credenciales) con la descripción de lo que puede hacer el rol elegido y botón **Entrar**.
- Fondo de la pantalla: mapa topográfico con curvas de nivel, parcelas y una **ruta punteada** (mismo lenguaje visual que el sidebar), en SVG dentro de la propia página.
- `src/features/auth/mockRoles.ts`: roles con su descripción y datos mockup del perfil, etiquetas de rol y `getRol`.
- El selector de rol desaparece de la cabecera; en su lugar hay un botón **Mi perfil** desplegable con nombre, rol, cargo, email, teléfono y DNI, y **Cerrar sesión** (vuelve a `/login`).
- Guardia de sesión en `App.tsx`: sin sesión (`franky.sesion` en `sessionStorage`) cualquier ruta redirige a `/login`.
- Se mantienen los selectores de vista previa (DIOS) y de conductor.

### Inicio y sidebar: transición del menú
- Al elegir una opción del menú de Inicio, la tarjeta de módulos anima su salida hacia el sidebar y navega tras la transición.
- Al entrar en Inicio, el menú aparece desde el lateral (sensación de venir del sidebar); al salir de Inicio, la navegación del sidebar entra animada. Respeta `prefers-reduced-motion`.

### Transportes: nombre persistente y listado
- **Backend** (`vegapunk`): el nombre del transporte se persiste de extremo a extremo (migración `V202611100002__add_nombre_to_transportes.sql`, campo en request/response, dominio `Transporte`, `TransporteDbo`, `TransporteMapper`, `TransporteApplicationService` y test de dominio). Requiere reiniciar el backend para aplicar la migración.
- Formulario de transporte (`TransporteFormPage`): campo **Nombre** (alta y edición).
- Tabla de transportes: quitadas las columnas «Código Trazabilidad», «Camión» y «Camionero»; en su lugar se muestra **Nombre** (enlaza al detalle; si no hay nombre, `TRANSPORTE #<id>`).
- Los nombres de transporte se muestran y se guardan siempre en mayúsculas (tabla, detalle, PDF y formularios).

## [0.4.1] — 2026-11-10

### Transportes: filtros por fecha y layout del listado
- Filtro por fecha de carga (input `date`) con botón "Ver todas" y ordenación por fecha (más recientes/más antiguos primero); la exportación CSV exporta lo visible tras filtrar.
- `CalendarWidget` movido arriba del listado, centrado y **fijo** (`position: sticky`) al hacer scroll.
- Botones "Exportar CSV" y "+ Nuevo transporte" centrados y más grandes.
- Tabla a ancho completo (el calendario ya no ocupa columna lateral), con fila "No hay transportes en la fecha seleccionada" cuando el filtro no tiene resultados.
- Estilos nuevos en `src/styles/TransportesPage.module.css` (acciones, filtros, calendario fijo).
- Tests: orden por defecto y filtrado por fecha en `TransportesPage.test.tsx` (163/163 OK).

### Básculas: volcado local y respuesta inmediata sin timeouts
- `public/basculas-es.json`: volcado de básculas de OSM para Castilla y León (generado con Nominatim por teselas: etiquetas de pesaje + nombres `báscula`/`pesaje`), servido como estático por la propia app.
- `fetchBasculasCercanas` responde **al instante** desde el volcado local cuando cubre el corredor; si el volcado existe pero la zona no está cubierta, devuelve vacío **sin consultar fuentes en vivo** (cero timeouts en rutas nuevas).
- Photon/Overpass/Nakordoni quedan solo como respaldo cuando el volcado no está disponible; errores legibles en vez de `Failed to fetch`.
- Caché: se reutiliza la de consultas en vivo anteriores; se mantiene lectura del formato v4.
