import { test, expect } from '@playwright/test';

const mockParcelas = [
  {
    id: 'p1',
    nombre: 'Parcela Norte',
    wktGeolocalizacion: 'POINT(-4.7 41.6)',
    eudrCompliant: true,
    municipio: 'Ávila',
    provincia: 'Ávila',
  },
  {
    id: 'p2',
    nombre: 'Parcela Sur',
    wktGeolocalizacion: 'POINT(-5.2 41.2)',
    eudrCompliant: false,
    municipio: 'Burgos',
    provincia: 'Burgos',
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
    centroId: null,
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
        routes: [{ geometry: { coordinates: [[-4.7, 41.6], [-3.7, 40.4]] } }],
      }),
    });
  });
  await page.route('https://{s}.tile.openstreetmap.org/**', (route) => route.abort());
}

test('carga el dashboard con datos mock', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/');
  await expect(page.getByText('Panel de Control')).toBeVisible();
  await expect(page.getByText('Parcelas', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('2').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Transportes' }).first()).toBeVisible();
});

test('navega al detalle de camiones desde el dashboard', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Camiones' }).first().click();
  await expect(page.getByRole('heading', { name: 'Camiones', exact: true })).toBeVisible();
});