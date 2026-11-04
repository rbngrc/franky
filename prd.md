# PRD: Franky — EUDR Compliance App

## 1. Product Overview

**Franky** es una aplicación de gestión forestal diseñada para garantizar el cumplimiento del reglamento EUDR (European Union Deforestation Regulation), así como certificaciones complementarias PEFC y SURE. La app permite gestionar el ciclo completo de trazabilidad de la madera: desde la parcela de origen hasta el transporte al centro de destino, asegurando que cada carga cumple con la normativa.

### Objetivo

Digitalizar y centralizar la gestión forestal con foco en cumplimiento normativo, proporcionando una plataforma única para administrar parcelas, expedientes, transportes, flota de camiones, conductores, centros, proveedores y personal asociado, con una experiencia móvil offline para el trabajo de campo.

## 2. Target Users

- **Administradores generales / chopos / forestales**: administran todos los módulos y supervisan el cumplimiento.
- **Empresa**: consulta y gestiona la operativa de su ámbito.
- **Gestores forestales**: administran parcelas, lotes, personal y maquinaria.
- **Transportistas / logística**: gestionan camiones, conductores y transportes.
- **Conductores**: consultan sus transportes asignados, fotografían el vehículo y el ticket de pesaje y sincronizan desde el móvil.
- **Agentes forestales / operarios**: validan transportes en campo mediante escaneo de QR.
- **Administradores de cumplimiento**: supervisan certificaciones EUDR, PEFC y SURE.
- **Operadores de centros**: gestionan los centros de destino de la madera.
- **Superusuario (`DIOS`)**: puede previsualizar la experiencia de conductor y de agente forestal.

## 3. Core Features

### 3.1 Gestión de Parcelas
- CRUD completo de parcelas forestales.
- Creación mediante tres modalidades: clic en mapa SIGPAC, RC manual, dibujo manual.
- **Importación desde archivo GIS**: `.geojson`, `.json`, `.zip`/`.rar` con Shapefile, `.kml`, `.kmz`.
- Geolocalización con geometría PostGIS (SRID 4326).
- Certificaciones: EUDR, PEFC, SURE.
- Datos extra importados desde GIS (`datosExtra`).
- Sub-features: Lotes, Personal asignado, Maquinaria asignada.

### 3.2 Gestión de Transportes
- CRUD completo con trazabilidad.
- Vinculación con parcela, camión, conductor, centro y expediente.
- Cálculo automático de cumplimiento EUDR.
- Código de trazabilidad autogenerado e inmutable.
- Remolque, metros cúbicos (tipo) y nombre editable.
- Datos de pesaje: peso bruto, tara, peso neto, número de ticket, fecha y hora.
- **Fotos de pesaje**: frente, trasera, lateral y ticket.
- Exportación a CSV/PDF y generación de QR.

### 3.3 Gestión de Flota
- **Camiones**: matrícula, marca, modelo, capacidad (t), capacidad m³ (tipo), tara, remolque, activo/inactivo.
- **Conductores** (antes camioneros): DNI, datos personales, nº carnet, activo/inactivo.

### 3.4 Gestión de Centros
- CRUD de centros de destino.
- Datos: nombre, dirección, tipo, coordenadas.

### 3.5 Gestión de Proveedores
- CRUD completo con tipo/número de documento.
- País y región de origen (relevante para EUDR).

### 3.6 Gestión de Expedientes
- CRUD de expedientes con código, número de licitación, descripción, fechas de apertura/adjudicación, estado, importe, observaciones y activo.
- Asociación a proveedor y a transportes.

### 3.7 Panel de Control
- KPIs del sistema (parcelas, superficie, camiones, conductores, transportes, toneladas, centros, proveedores).
- Tarjetas de certificaciones EUDR/PEFC/SURE con porcentaje.
- Gráficas: toneladas por tipo de madera, evolución mensual de carga, cumplimiento de certificaciones, superficie por provincia/municipio, transportes por destino, flota por marca y kilometraje de rutas.
- Mapa de rutas (OSRM) y calendario de transportes.
- Últimos transportes con badges de cumplimiento.

### 3.8 Panel EUDR
- Dashboard de cumplimiento con métricas globales.
- Certificaciones por parcela (EUDR, PEFC, SURE).
- Barra de cumplimiento visual.
- Razones de incumplimiento detalladas.

### 3.9 Roles y acceso
- Roles: `ADMIN_GENERAL`, `ADMIN_CHOPOS`, `ADMIN_FORESTAL`, `EMPRESA`, `CONDUCTOR`, `AGENTE_FORESTAL_OPERARIO`, `DIOS`.
- Selector de rol en la cabecera; el sidebar filtra secciones por rol.
- `DIOS` puede previsualizar conductor/agente.
- Selección de conductor para el flujo móvil.

### 3.10 Flujo móvil de conductor
- Home con transportes asignados y estado de sincronización.
- Captura guiada de 4 fotos obligatorias.
- OCR de matrícula (foto frontal) y de ticket de pesaje.
- Revisión y corrección manual de los datos.
- Guardado local (IndexedDB) y sincronización automática/manual.
- Navegación inferior móvil (Inicio, Escáner, Sincronizar).

### 3.11 Flujo de agente forestal
- Listado de transportes a validar.
- Escaneo de QR del transporte o entrada manual del código de trazabilidad/ID.
- Navegación al detalle para validar pesos, ticket y certificaciones.
- Estado online/offline y sincronización.

### 3.12 Offline-first y PWA
- Instalación como PWA (manifest, iconos, service worker).
- Caché de assets y de `/api/v1` (NetworkFirst, 24 h).
- Caché de transportes en IndexedDB.
- Outbox de cambios con `clientRequestId` para reintentos idempotentes.
- Indicador global de conexión: Online, Offline, Sincronizando, pendientes o errores.
- Reintento automático al recuperar conexión y cada 10 s mientras haya conexión.

### 3.13 Cámara, OCR y pesaje
- Captura con cámara (MediaDevices) o selección de archivo como fallback.
- Preprocesado de imagen para OCR.
- Tesseract.js en español, cargado de forma diferida.
- Parser de matrícula y de ticket (pesos, fecha, hora, número).
- Guardado de capturas locales con confianza OCR y estado de sincronización.

## 4. Technical Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite 6 |
| **UI Library** | MUI 7 |
| **Map** | Leaflet + react-leaflet |
| **Routing** | react-router-dom v7 |
| **Charts** | recharts |
| **Offline** | Dexie + IndexedDB |
| **PWA** | vite-plugin-pwa + Workbox |
| **OCR** | tesseract.js |
| **GIS import** | shpjs + @tmcw/togeojson + jszip + node-unrar-js + proj4 |
| **QR** | `qrcode` (client-side) |
| **PDF/CSV** | `jspdf` / export client-side |
| **Geometry** | `@turf/boolean-point-in-polygon`, `wicket` (WKT) |
| **Backend** | Spring Boot 3.3.0 + Java 17 + Maven |
| **Database** | PostgreSQL + Hibernate Spatial + Flyway |
| **Project** | `vegapunk` (backend) |
| **Proxy** | Vite proxy `/api` → `http://localhost:8080` |
| **Tests** | Vitest + Testing Library + Playwright |

## 5. Data Model (entidades principales)

### parcelas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | Identificador único |
| nombre | VARCHAR | Nombre de la parcela |
| geolocalizacion | GEOMETRY (4326) | Geometría PostGIS (SRID 4326) |
| referencia_catastral | VARCHAR | RC de 14 dígitos (UNIQUE) |
| area_metros_cuadrados | NUMERIC | Área |
| municipio | VARCHAR(150) | Municipio (ubicación, editable) |
| provincia | VARCHAR(100) | Provincia (ubicación, editable) |
| datos_extra | JSON/JSONB | Datos adicionales importados de GIS |
| deforestacion_ok | BOOLEAN | EUDR: sin deforestación |
| produccion_legal_ok | BOOLEAN | EUDR: producción legal |
| certificacion_pefc | BOOLEAN | Certificación PEFC |
| codigo_certificacion_pefc | VARCHAR | Código PEFC |
| fecha_auditoria_pefc | DATE | Auditoría PEFC |
| fecha_vencimiento_pefc | DATE | Vencimiento PEFC |
| certificacion_sure | BOOLEAN | Certificación SURE |
| codigo_certificacion_sure | VARCHAR | Código SURE |
| fecha_auditoria_sure | DATE | Auditoría SURE |
| fecha_vencimiento_sure | DATE | Vencimiento SURE |

### camiones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| matricula | PK | Matrícula del camión |
| marca | VARCHAR | Marca |
| modelo | VARCHAR | Modelo |
| capacidad_toneladas | NUMERIC | Capacidad en toneladas |
| capacidad_m3 | NUMERIC | Capacidad en m³ (tipo) |
| tara | NUMERIC | Tara del vehículo |
| remolque_matricula | VARCHAR | Matrícula del remolque |
| activo | BOOLEAN | Estado |

### camioneros / conductores
| Campo | Tipo | Descripción |
|-------|------|-------------|
| dni | PK | DNI del conductor |
| nombre | VARCHAR | Nombre |
| apellidos | VARCHAR | Apellidos |
| telefono | VARCHAR | Teléfono |
| email | VARCHAR | Email |
| numero_carnet | VARCHAR | Nº de carnet |
| activo | BOOLEAN | Estado |

### transportes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK (BigInt) | Identificador único |
| parcela_id | FK → parcelas | Parcela de origen |
| camion_matricula | FK → camiones | Camión utilizado |
| camionero_dni | FK → camioneros | Conductor responsable |
| centro_id | FK → centros | Centro de destino |
| expediente_id | FK → expedientes | Expediente vinculado |
| fecha_carga | DATE | Fecha de carga |
| toneladas_cargadas | NUMERIC | Peso cargado |
| metros_cubicos | NUMERIC | Volumen (tipo) |
| remolque_matricula | VARCHAR | Remolque |
| tipo_madera | VARCHAR | Tipo de madera |
| destino | VARCHAR | Destino |
| eudr_cumplimiento | BOOLEAN | Cumplimiento EUDR |
| eudr_geolocalizacion_ok | BOOLEAN | Geolocalización de parcela OK |
| eudr_referencia_catastral_ok | BOOLEAN | RC de parcela OK |
| pefc_cumplimiento | BOOLEAN | Cumplimiento PEFC |
| sure_cumplimiento | BOOLEAN | Cumplimiento SURE |
| razones_incumplimiento | TEXT | Motivos |
| codigo_trazabilidad | VARCHAR | Código único (inmutable) |
| fecha_creacion | TIMESTAMP | Fecha de registro |
| nombre | VARCHAR | Nombre editable |
| dds_ok | BOOLEAN | DDS (Due Diligence System) |
| referencia_dds | VARCHAR | Referencia DDS |
| coc_pefc_ok | BOOLEAN | CoC PEFC |
| referencia_coc_pefc | VARCHAR | Referencia CoC PEFC |
| coc_sure_ok | BOOLEAN | CoC SURE |
| referencia_coc_sure | VARCHAR | Referencia CoC SURE |
| gei_reduccion_ok | BOOLEAN | Reducción GEI |
| peso_bruto_kg | NUMERIC | Peso bruto de pesaje |
| tara_kg | NUMERIC | Tara de pesaje |
| peso_neto_kg | NUMERIC | Peso neto de pesaje |
| numero_ticket | VARCHAR | Número de ticket |
| fecha_pesaje | DATE | Fecha del pesaje |
| hora_pesaje | TIME | Hora del pesaje |
| fotos | JSON/JSONB | Fotos frente/trasera/lateral/ticket |

### centros
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK | Identificador |
| nombre | VARCHAR | Nombre |
| direccion | VARCHAR | Dirección |
| localidad | VARCHAR | Localidad |
| tipo | VARCHAR | Tipo de centro |
| latitud | NUMERIC | Latitud |
| longitud | NUMERIC | Longitud |
| activo | BOOLEAN | Estado |

### proveedores
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK | Identificador |
| nombre | VARCHAR | Nombre |
| tipo_documento | VARCHAR | Tipo (NIF, CIF…) |
| numero_documento | VARCHAR | Número |
| direccion | VARCHAR | Dirección |
| telefono | VARCHAR | Teléfono |
| email | VARCHAR | Email |
| pais_origen | VARCHAR | País |
| region_origen | VARCHAR | Región |
| activo | BOOLEAN | Estado |

### expedientes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK | Identificador |
| codigo_expediente | VARCHAR | Código único |
| numero_licitacion | VARCHAR | Número de licitación |
| descripcion | TEXT | Descripción |
| fecha_apertura | DATE | Apertura |
| fecha_adjudicacion | DATE | Adjudicación |
| proveedor_id | FK → proveedores | Proveedor |
| estado | VARCHAR | BORRADOR, ABIERTO, ADJUDICADO, EN_EJECUCION, CERRADO, ANULADO |
| importe | NUMERIC | Importe |
| observaciones | TEXT | Observaciones |
| activo | BOOLEAN | Estado |

### lotes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | Identificador |
| parcela_id | FK → parcelas | Parcela padre |
| nombre | VARCHAR | Nombre del lote |
| especie | VARCHAR | Especie forestal |
| superficie_hectareas | NUMERIC | Superficie |
| fecha_plantacion | DATE | Fecha |

### personal_asignado
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | Identificador |
| parcela_id | FK → parcelas | Parcela padre |
| nombre | VARCHAR | Nombre |
| rol | VARCHAR | Rol |
| jornadas | INTEGER | Días trabajados |
| coste_jornada | NUMERIC | Coste por jornada |
| fecha | DATE | Fecha |

### maquinaria_asignada
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID PK | Identificador |
| parcela_id | FK → parcelas | Parcela padre |
| nombre | VARCHAR | Nombre |
| tipo | VARCHAR | Tipo |
| horas | NUMERIC | Horas |
| coste_hora | NUMERIC | Coste por hora |
| fecha | DATE | Fecha |

## 6. API Endpoints (`/api/v1/...`)

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Login (`username`, `password`) → `LoginResponse` con `username`, `rol`, `nombreCompleto`, `token?` |

### Camiones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/camiones` | Listar todos |
| POST | `/camiones` | Crear nuevo |
| GET | `/camiones/{matricula}` | Obtener por matrícula |
| POST | `/camiones/{matricula}` | Actualizar |

### Conductores (camioneros en la API)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/camioneros` | Listar todos |
| POST | `/camioneros` | Crear nuevo |
| GET | `/camioneros/{dni}` | Obtener por DNI |
| POST | `/camioneros/{dni}` | Actualizar |

### Transportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/transportes` | Listar todos |
| POST | `/transportes` | Crear nuevo |
| GET | `/transportes/{id}` | Obtener por ID |
| PUT | `/transportes/{id}` | Actualizar (incluye pesaje/fotos/remolque/expediente) |
| DELETE | `/transportes/{id}` | Eliminar |
| POST | `/transportes/recalcular-eudr/{parcelaId}` | Recalcular cumplimiento |

### Parcelas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/parcelas` | Listar todas (paginado, `Pageable`) |
| POST | `/parcelas` | Crear nueva |
| GET | `/parcelas/{id}` | Obtener por ID |
| GET | `/parcelas/search/intersects?areaWkt=` | Buscar parcelas que intersectan un área |
| PUT | `/parcelas/{id}` | Actualizar (nombre + datos básicos + certificaciones) |
| DELETE | `/parcelas/{id}` | Eliminar |
| POST | `/parcelas/import` | Importar desde SIGPAC/GIS (GeoJSON/WKT) |

### Centros
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/centros` | Listar todos |
| POST | `/centros` | Crear nuevo |
| GET | `/centros/{id}` | Obtener por ID |
| POST | `/centros/{id}` | Actualizar |
| DELETE | `/centros/{id}` | Eliminar |

### Proveedores
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/proveedores` | Listar todos |
| POST | `/proveedores` | Crear nuevo |
| GET | `/proveedores/{id}` | Obtener por ID |
| PUT | `/proveedores/{id}` | Actualizar |
| DELETE | `/proveedores/{id}` | Eliminar |

### Expedientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/expedientes` | Listar todos |
| POST | `/expedientes` | Crear nuevo |
| GET | `/expedientes/{id}` | Obtener por ID |
| PUT | `/expedientes/{id}` | Actualizar |
| DELETE | `/expedientes/{id}` | Eliminar |

### Lotes (sub-feature de ParcelaDetailPage)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/lotes?parcelaId=` | Listar por parcela |
| POST | `/lotes` | Crear nuevo |
| PUT | `/lotes/{id}` | Actualizar |
| DELETE | `/lotes/{id}` | Eliminar |

### Maquinaria (sub-feature de ParcelaDetailPage)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/maquinaria?parcelaId=` | Listar por parcela |
| POST | `/maquinaria` | Crear nueva |
| DELETE | `/maquinaria/{id}` | Eliminar |

### Personal (sub-feature de ParcelaDetailPage)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/personal?parcelaId=` | Listar por parcela |
| POST | `/personal` | Crear nuevo |
| DELETE | `/personal/{id}` | Eliminar |

### Ubicaciones (provincias y municipios)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/ubicaciones/provincias` | Lista de provincias |
| GET | `/ubicaciones/municipios?provincia=` | Lista de municipios por provincia |

### SIGPAC / Catastro
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/sigpac/parcela-geometry?rc=` | Geometría por RC (INSPIRE WFS; 503 si no disponible) |
| GET | `/sigpac/parcela-por-click?lat=&lng=` | Parcela por coordenadas |
| GET | `/sigpac/recintos?provincia=&municipio=` | Recintos por municipio |
| GET | `/sigpac/recintos-coordenadas?x=&y=` | Recintos por coordenadas |
| GET | `/sigpac/provincias` | Lista de provincias |
| GET | `/sigpac/municipios?codigoProvincia=` | Municipios por provincia |
| GET | `/sigpac/wms-proxy?url=` | Proxy WMS Catastro |
| GET | `/sigpac/geojson?provincia=&municipio=` | Caché local GeoJSON (C:/sigpac_cache) |

## 7. Frontend Routes

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | InicioPage | Home con módulos; conductor/agente ven su propia home |
| `/dashboard` | DashboardPage | Panel de Control con KPIs y gráficas |
| `/eudr` | EudrDashboardPage | Panel de cumplimiento |
| `/parcelas` | ParcelasPage | Sección parcelas (redirige a `tabla`) |
| `/parcelas/tabla` | TablaDetalladaPage | Listado detallado de parcelas |
| `/parcelas/crear-sigpac` | CrearParcelaPage | Crear vía SIGPAC |
| `/parcelas/importar-gis` | ImportarParcelaGisPage | Importar desde archivo GIS |
| `/parcelas/detalle/:id` | ParcelaDetailPage | Detalle con tabs |
| `/camiones` | CamionesPage | Listado de camiones |
| `/camiones/nuevo` | CamionFormPage | Nuevo camión |
| `/camiones/editar/:matricula` | CamionFormPage | Editar camión |
| `/camiones/:matricula` | CamionDetailPage | Detalle camión |
| `/conductores` | ConductoresPage | Listado de conductores |
| `/conductores/nuevo` | ConductorFormPage | Nuevo conductor |
| `/conductores/editar/:dni` | ConductorFormPage | Editar conductor |
| `/conductores/:dni` | ConductorDetailPage | Detalle conductor |
| `/transportes` | TransportesPage | Listado de transportes |
| `/transportes/nuevo` | TransporteFormPage | Nuevo transporte |
| `/transportes/editar/:id` | TransporteFormPage | Editar transporte |
| `/transportes/:id` | TransporteDetailPage | Detalle con QR, PDF/CSV y fotos |
| `/centros` | CentrosPage | Listado de centros |
| `/centros/nuevo` | CentroFormPage | Nuevo centro |
| `/centros/editar/:id` | CentroFormPage | Editar centro |
| `/centros/:id` | CentroDetailPage | Detalle centro |
| `/proveedores` | ProveedoresPage | Listado de proveedores |
| `/proveedores/nuevo` | ProveedorFormPage | Nuevo proveedor |
| `/proveedores/editar/:id` | ProveedorFormPage | Editar proveedor |
| `/proveedores/:id` | ProveedorDetailPage | Detalle proveedor |
| `/expedientes` | ExpedientesPage | Listado de expedientes |
| `/expedientes/nuevo` | ExpedienteFormPage | Nuevo expediente |
| `/expedientes/editar/:id` | ExpedienteFormPage | Editar expediente |
| `/expedientes/:id` | ExpedienteDetailPage | Detalle con transportes |
| `/conductor` | ConductorHomePage | Home móvil del conductor |
| `/conductor/escanear/:transporteId` | ConductorEscanearPage | Captura de fotos + OCR + pesaje |
| `/agente` | AgenteHomePage | Home del agente forestal |
| `/agente/escanear` | AgenteEscanearPage | Escáner QR |
| `*` | NotFoundPage | 404 |

> `LoginPage` y `ProtectedRoute` existen pero todavía no están montados en el router.

## 8. Arquitectura (Backend Hexagonal)

```
domain/model/         → Entidades puras con value objects
domain/port/out/      → Interfaces de repositorio
application/          → Application services + DTOs Request/Response
infrastructure/
  in/web/             → REST controllers
  out/persistence/    → DBOs, JPA repos, Mappers, Adapters
  configuration/      → WebConfig (CORS), BeanConfiguration, SpatialConfiguration
```

## 9. Componentes Compartidos (Frontend)

- `CalendarWidget.tsx` — Mini calendario mensual con conteo de transportes por día
- `ConfirmDialog.tsx` — Diálogo de confirmación reutilizable
- `LoadingIndicator.tsx` — Indicador de carga
- `QrScanner.tsx` — Lector QR con `BarcodeDetector` (fallback manual)
- `Layout/` — `AppLayout` (header + sidebar + outlet), `Header`, `Sidebar`, `MobileBottomNav`
- `ErrorBoundary/` — Error boundary por página (sólo la raíz es global)
- `features/dashboard/components/` — `KpiGrid`, `ChartCard`, `DashboardRoutesMap` y gráficas recharts
- `features/pwa/components/ConnectionStatus.tsx` — Estado online/offline/sync
- `features/camera/CameraCapture.tsx` — Captura de cámara con fallback a archivo

## 10. Funcionalidades Clave: Mapa SIGPAC e importación GIS

- Mapa Leaflet con `World_Imagery` (ESRI) + WMS Catastro (`PARCELA`).
- 3 modalidades de creación:
  1. Clic en mapa → GetFeatureInfo → extrae RC → backend INSPIRE WFS.
  2. RC manual → mismo backend.
  3. Dibujo manual → clics → polígono (id `manual-*`).
- **Importación GIS**: parser client-side de GeoJSON/JSON, Shapefile (`.zip`/`.rar`), KML/KMZ; mapeo de campos a nombre/RC/municipio/provincia, selección de features, previsualización en mapa y guardado vía API.
- Bug conocido: INSPIRE WFS backend devuelve 503 (servicio no disponible).
- Cache local: escanea `{PROVINCIA}/{MUNICIPIO}/{codigo5d}/resultado.geojson`.
- Client-side point-in-polygon con `@turf/boolean-point-in-polygon`.

## 11. Decisiones Técnicas

- Proxy Vite en vez de CORS en producción (actualmente ambos).
- AbortController en hooks para evitar race conditions.
- QR/CSV/PDF client-side (sin backend).
- OCR client-side con tesseract.js; el resultado se revisa y corrige antes de guardar.
- Offline-first con IndexedDB (Dexie), caché de transportes y outbox idempotente (`clientRequestId`).
- PWA con `vite-plugin-pwa`/Workbox: precache de assets y NetworkFirst para `/api/v1`.
- Roles y navegación adaptados en cliente (`RoleContext`).
- Tablas responsive con `overflow-x: auto`.
- Validación visual campo a campo en formularios.
- CSS con módulos por componente (`src/styles/*.module.css`) + variables centrales en `index.css`.
- Feature-based organization en `src/features/` (api / hooks / components / types por dominio).
- Plugin Vite `resolve-url-proxy`: resolución segura de URLs externas (Google Maps, Nominatim) con allowlist de hosts y bloqueo de hosts privados (anti-SSRF).
- Tests unitarios con Vitest + Testing Library y E2E con Playwright.

## 12. Límites y Restricciones

- INSPIRE WFS puede no estar disponible (503); el proxy WMS de Catastro puede devolver 502.
- La caché SIGPAC depende de la estructura de directorios local (`C:/sigpac_cache/{PROVINCIA}/{MUNICIPIO}/…/resultado.geojson`).
- Las geometrías se almacenan en SRID 4326.
- El cumplimiento EUDR se recalcula por parcela, no por transporte individual.
- El nombre del transporte es editable; el código de trazabilidad es autogenerado e inmutable.
- El tipo `Provincia` del frontend está limitado a Ávila, Burgos, León y Palencia.
- La geolocalización de una parcela no se puede modificar una vez establecida (regla de dominio).
- **Autenticación**: `/login` no está montado, las rutas no están protegidas y `ApiClient` no envía token; el rol se selecciona en cliente.
- **Unidades**: el selector t/m³ no está montado; los formularios sólo editan toneladas aunque los tipos admiten m³.
- **Offline**: sólo se cachean transportes; no hay resolución de conflictos ni Background Sync; la outbox sólo soporta `POST`/`PUT`.
- **OCR/QR**: dependen de la cámara, permisos, contexto seguro y soporte del navegador (`BarcodeDetector`); requieren revisión humana.
- **Rutas**: el kilometraje usa la API pública de OSRM y puede sufrir rate limiting.
- **Build**: Vite avisa de chunk principal grande (>500 kB); `recharts` y `leaflet` están separados en `manualChunks`.
