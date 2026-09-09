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
