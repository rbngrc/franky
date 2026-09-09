# PRD: Franky — EUDR Compliance App

## 1. Product Overview

**Franky** es una aplicación de gestión forestal diseñada para garantizar el cumplimiento del reglamento EUDR (European Union Deforestation Regulation), así como certificaciones complementarias PEFC y SURE. La app permite gestionar el ciclo completo de trazabilidad de la madera: desde la parcela de origen hasta el transporte al centro de destino, asegurando que cada carga cumple con la normativa.

### Objetivo

Digitalizar y centralizar la gestión forestal con foco en cumplimiento normativo, proporcionando una plataforma única para administrar parcelas, transportes, flota de camiones, camioneros, centros, proveedores y personal asociado.

## 2. Target Users

- **Gestores forestales**: Administran parcelas, lotes, personal y maquinaria
- **Transportistas / Logística**: Gestionan camiones, camioneros y transportes
- **Administradores de cumplimiento**: Supervisan certificaciones EUDR, PEFC, SURE
- **Operadores de centros**: Gestionan los centros de destino de la madera

## 3. Core Features

### 3.1 Gestión de Parcelas
- CRUD completo de parcelas forestales
- Creación mediante tres modalidades: clic en mapa SIGPAC, RC manual, dibujo manual
- Geolocalización con geometría PostGIS (SRID 4326)
- Certificaciones: EUDR, PEFC, SURE
- Sub-features: Lotes, Personal asignado, Maquinaria asignada

### 3.2 Gestión de Transportes
- CRUD completo con trazabilidad
- Vinculación con parcela, camión, camionero y centro
- Cálculo automático de cumplimiento EUDR
- Código de trazabilidad autogenerado
- Exportación a CSV y generación de QR
- Nombre editable por el usuario

### 3.3 Gestión de Flota
- **Camiones**: matrícula, marca, modelo, capacidad, tara, activo/inactivo
- **Camioneros**: DNI, datos personales, nº carnet, activo/inactivo

### 3.4 Gestión de Centros
- CRUD de centros de destino
- Datos: nombre, dirección, tipo, coordenadas

### 3.5 Gestión de Proveedores
- CRUD completo con tipo/número de documento
- País y región de origen (relevante para EUDR)

### 3.6 Panel EUDR
- Dashboard de cumplimiento con métricas globales
- Certificaciones por parcela (EUDR, PEFC, SURE)
- Barra de cumplimiento visual
- Razones de incumplimiento detalladas

### 3.7 Dashboard Principal
- Métricas globales
- Mapa con geolocalización de parcelas/transportes
- Calendario de transportes (CalendarWidget)

## 4. Technical Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite 6 |
| **UI Library** | MUI 7 |
| **Map** | Leaflet + react-leaflet |
| **Routing** | react-router-dom v7 |
| **QR** | `qrcode` (client-side) |
| **CSV** | Client-side export |
| **Geometry** | `@turf/boolean-point-in-polygon` |
| **Backend** | Spring Boot 3.3.0 + Java 17 + Maven |
| **Database** | PostgreSQL + Hibernate Spatial + Flyway |
| **Project** | `vegapunk` (backend) |
| **Proxy** | Vite proxy `/api` → `http://localhost:8080` |

## 5. Data Model (11 entidades)

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
| capacidad_toneladas | NUMERIC | Capacidad |
| tara | NUMERIC | Tara del vehículo |
| activo | BOOLEAN | Estado |

### camioneros
| Campo | Tipo | Descripción |
|-------|------|-------------|
| dni | PK | DNI del camionero |
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
| camionero_dni | FK → camioneros | Camionero responsable |
| centro_id | FK → centros | Centro de destino |
| fecha_carga | DATE | Fecha de carga |
| toneladas_cargadas | NUMERIC | Peso cargado |
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

### centros
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | PK | Identificador |
| nombre | VARCHAR | Nombre |
| direccion | VARCHAR | Dirección |
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

### Camiones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/camiones` | Listar todos |
| POST | `/camiones` | Crear nuevo |
| GET | `/camiones/{matricula}` | Obtener por matrícula |
| POST | `/camiones/{matricula}` | Actualizar |

### Camioneros
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
| PUT | `/transportes/{id}` | Actualizar |
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
| POST | `/parcelas/import` | Importar desde SIGPAC (GeoJSON) |

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
| `/` | DashboardPage | Métricas + mapa + calendario |
| `/parcelas` | ParcelasPage (redirige a `tabla`) | Sección parcelas |
| `/parcelas/tabla` | TablaDetalladaPage | Listado detallado de parcelas |
| `/parcelas/crear-sigpac` | CrearParcelaPage | Crear vía SIGPAC |
| `/parcelas/detalle/:id` | ParcelaDetailPage | Detalle con tabs |
| `/camiones` | CamionesPage | Listado de camiones |
| `/camiones/nuevo` | CamionFormPage | Nuevo camión |
| `/camiones/editar/:matricula` | CamionFormPage | Editar camión |
| `/camiones/:matricula` | CamionDetailPage | Detalle camión |
| `/camioneros` | CamionerosPage | Listado de camioneros |
| `/camioneros/nuevo` | CamioneroFormPage | Nuevo camionero |
| `/camioneros/editar/:dni` | CamioneroFormPage | Editar camionero |
| `/camioneros/:dni` | CamioneroDetailPage | Detalle camionero |
| `/transportes` | TransportesPage | Listado de transportes |
| `/transportes/nuevo` | TransporteFormPage | Nuevo transporte |
| `/transportes/editar/:id` | TransporteFormPage | Editar transporte |
| `/transportes/:id` | TransporteDetailPage | Detalle con QR + CSV |
| `/centros` | CentrosPage | Listado de centros |
| `/centros/nuevo` | CentroFormPage | Nuevo centro |
| `/centros/editar/:id` | CentroFormPage | Editar centro |
| `/centros/:id` | CentroDetailPage | Detalle centro |
| `/proveedores` | ProveedoresPage | Listado de proveedores |
| `/proveedores/nuevo` | ProveedorFormPage | Nuevo proveedor |
| `/proveedores/editar/:id` | ProveedorFormPage | Editar proveedor |
| `/proveedores/:id` | ProveedorDetailPage | Detalle proveedor |
| `/eudr` | EudrDashboardPage | Panel de cumplimiento |
| `*` | NotFoundPage | 404 |

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
- `Layout/` — `AppLayout` (header + sidebar + outlet), `Header`, `Sidebar`
- `ErrorBoundary/` — Error boundary por página (sólo la raíz es global)

## 10. Funcionalidades Clave: Mapa SIGPAC

- Mapa Leaflet con `World_Imagery` (ESRI) + WMS Catastro (`PARCELA`)
- 3 modalidades de creación:
  1. Clic en mapa → GetFeatureInfo → extrae RC → backend INSPIRE WFS
  2. RC manual → mismo backend
  3. Dibujo manual → clics → polígono (id `manual-*`)
- Bug conocido: INSPIRE WFS backend devuelve 503 (servicio no disponible)
- Cache local: escanea `{PROVINCIA}/{MUNICIPIO}/{codigo5d}/resultado.geojson`
- Client-side point-in-polygon con `@turf/boolean-point-in-polygon`

## 11. Decisiones Técnicas

- Proxy Vite en vez de CORS en producción (actualmente ambos)
- AbortController en hooks para evitar race conditions
- QR client-side (librería `qrcode`)
- CSV export client-side (sin backend)
- Tablas responsive con `overflow-x: auto`
- Validación visual campo a campo en formularios
- CSS con módulos por componente (`src/styles/*.module.css`) + variables centrales en `index.css`
- Feature-based organization en `src/features/` (api / hooks / components / types por dominio)
- Plugin Vite `resolve-url-proxy`: resolución segura de URLs externas (Google Maps, Nominatim) con allowlist de hosts y bloqueo de hosts privados (anti-SSRF)
- Tests unitarios con Vitest + Testing Library

## 12. Límites y Restricciones

- INSPIRE WFS puede no estar disponible (503); el proxy WMS de Catastro puede devolver 502
- La caché SIGPAC depende de la estructura de directorios local (`C:/sigpac_cache/{PROVINCIA}/{MUNICIPIO}/…/resultado.geojson`)
- Las geometrías se almacenan en SRID 4326
- El cumplimiento EUDR se recalcula por parcela, no por transporte individual
- El nombre del transporte es editable, el código de trazabilidad es autogenerado e inmutable
- El tipo `Provincia` del frontend está limitado a Ávila, Burgos, León y Palencia
- La geolocalización de una parcela no se puede modificar una vez establecida (regla de dominio)
