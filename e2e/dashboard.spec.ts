import { test, expect } from '@playwright/test';

const mockParcelas = [
  {
    id: 'p1',
    nombre: 'Parcela Norte',
    wktGeolocalizacion: 'POINT(-4.7 41.6)',
    eudrCompliant: true,
    municipio: 'Ávila',
    provincia: 'Ávila',
    areaMetrosCuadrados: 500000,
  },
  {
    id: 'p2',
    nombre: 'Parcela Sur',
    wktGeolocalizacion: 'POINT(-5.2 41.2)',
    eudrCompliant: false,
    municipio: 'Burgos',
    provincia: 'Burgos',
    areaMetrosCuadrados: 250000,
  },
];

const mockCamiones = [
  { matricula: '1234ABC', marca: 'Mercedes', modelo: 'Actros', capacidadToneladas: 24, tara: 12000, activo: true },
  { matricula: '5678DEF', marca: 'Volvo', modelo: 'FH', capacidadToneladas: 26, tara: 13000, activo: false },
];

const mockCamioneros = [
  { dni: '12345678A', nombre: 'Juan', apellidos: 'López García', telefono: '600111222', email: 'juan@test.com', numeroCarnet: 'C1', activo: true },
  { dni: '87654321B', nombre: 'Ana', apellidos: 'Martínez Ruiz', telefono: '600333444', email: 'ana@test.com', numeroCarnet: 'C2', activo: true },
];

const mockTransportes = [
  {
    id: 1,
    parcelaId: 'p1',
    parcelaNombre: 'Parcela Norte',
    camionMatricula: '1234ABC',
    camionMarca: 'Mercedes',
    camioneroDni: '12345678A',
    camioneroNombre: 'Juan López García',
    fechaCarga: '2026-05-01',
    toneladasCargadas: 22,
    tipoMadera: 'ROBLE',
    destino: 'Madrid',
    centroId: 1,
    eudrCumplimiento: true,
    eudrGeolocalizacionOk: true,
    eudrReferenciaCatastralOk: true,
    pefcCumplimiento: true,
    sureCumplimiento: true,
    codigoTrazabilidad: 'TRZ-2026-0001',
  },
];

const mockCentros = [
  { id: 1, nombre: 'Aserradero Central', direccion: 'Polígono 1', localidad: 'Madrid', tipo: 'Aserradero', latitud: 40.4168, longitud: -3.7038, activo: true },
];

const mockProveedores = [];

async function mockAllApis(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/parcelas*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: mockParcelas, totalPages: 1, totalElements: 2, size: 100, number: 0 }),
    });
  });
  await page.route('**/api/v1/camiones', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCamiones) });
  });
  await page.route('**/api/v1/camioneros', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCamioneros) });
  });
  await page.route('**/api/v1/transportes', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockTransportes) });
  });
  await page.route('**/api/v1/centros', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCentros) });
  });
  await page.route('**/api/v1/proveedores*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProveedores) });
  });
  await page.route('https://router.project-osrm.org/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        routes: [{ distance: 412300.5, geometry: { coordinates: [[-4.7, 41.6], [-3.7, 40.4]] } }],
      }),
    });
  });
  await page.route('https://{s}.tile.openstreetmap.org/**', (route) => route.abort());
}

test('la pantalla de inicio muestra el menú de módulos', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/');
  await expect(page.getByRole('main').getByRole('heading', { name: 'Inicio', exact: true })).toBeVisible();
  await expect(page.getByText('Módulos')).toBeVisible();
  await expect(page.getByText('Acciones rápidas')).toBeVisible();
  await expect(page.getByRole('link', { name: /Panel de Control/ }).first()).toBeVisible();
});

test('navega a un módulo desde el menú de inicio', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/');
  await page.getByRole('link', { name: /Camiones/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Camiones', exact: true })).toBeVisible();
});

test('el menú de inicio enlaza con el panel de control', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/');
  await page.getByRole('link', { name: /Estadísticas y métricas/ }).click();
  await expect(page.getByRole('main').getByRole('heading', { name: 'Panel de Control', exact: true })).toBeVisible();
});

test('carga el panel de control con datos mock', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/dashboard');
  await expect(page.getByRole('main').getByRole('heading', { name: 'Panel de Control', exact: true })).toBeVisible();
  await expect(page.getByText('★ Certificaciones')).toBeVisible();
  await expect(page.getByText('Metros cúbicos por tipo de madera')).toBeVisible();
  await expect(page.getByText('Evolución mensual de carga')).toBeVisible();
  await expect(page.getByText('Cumplimiento de certificaciones')).toBeVisible();
  await expect(page.getByText('Superficie por provincia')).toBeVisible();
  await expect(page.getByText('Transportes por centro de destino')).toBeVisible();
  await expect(page.getByText('Flota por marca')).toBeVisible();
  await expect(page.getByText('Kilometraje de rutas')).toBeVisible();
  await expect(page.getByText('★ Últimos transportes')).toBeVisible();
});

test('el panel de control muestra los KPIs calculados', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/dashboard');
  await expect(page.getByRole('main').getByText('Metros cúbicos cargados', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByText('Parcelas', { exact: true })).toBeVisible();
  await expect(page.getByText('Cumplen EUDR', { exact: false })).toBeVisible();
});

test('navega al detalle de camiones desde el panel de control', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/dashboard');
  await page.getByRole('link', { name: 'Camiones' }).first().click();
  await expect(page.getByRole('heading', { name: 'Camiones', exact: true })).toBeVisible();
});