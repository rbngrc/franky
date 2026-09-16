import { test, expect } from '@playwright/test';

const mockCamiones = [
  { matricula: '1234ABC', marca: 'Mercedes', modelo: 'Actros', capacidadToneladas: 24, tara: 12000, activo: true },
];

async function mockApis(page: import('@playwright/test').Page, options?: { camiones?: Array<Record<string, unknown>> }) {
  const camiones = options?.camiones ?? [];
  await page.route('**/api/v1/parcelas*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [], totalPages: 0, totalElements: 0, size: 100, number: 0 }) });
  });
  await page.route('**/api/v1/camiones', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(camiones) });
    } else {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ...route.request().postDataJSON(), activo: true }) });
    }
  });
  await page.route('**/api/v1/camiones/*', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(camiones[0] || mockCamiones[0]) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...route.request().postDataJSON(), activo: true }) });
    }
  });
  await page.route('**/api/v1/camioneros', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route('**/api/v1/transportes', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route('**/api/v1/centros', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route('**/api/v1/proveedores*', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
}

test.describe('CRUD Camiones', () => {
  test('lista vacía muestra empty state', async ({ page }) => {
    await mockApis(page, { camiones: [] });
    await page.goto('/camiones');
    await expect(page.getByText('No hay camiones registrados')).toBeVisible();
  });

  test('lista muestra camiones en tabla', async ({ page }) => {
    await mockApis(page, { camiones: mockCamiones });
    await page.goto('/camiones');
    await expect(page.getByText('1234ABC')).toBeVisible();
    await expect(page.getByText('Mercedes')).toBeVisible();
    await expect(page.getByText('Actros')).toBeVisible();
  });

  test('navegar a crear camión y ver formulario', async ({ page }) => {
    await mockApis(page, { camiones: [] });
    await page.goto('/camiones');
    await page.getByRole('link', { name: '+ Nuevo camión' }).first().click();
    await expect(page.getByRole('heading', { name: 'Nuevo camión', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Ej: 1234ABC')).toBeVisible();
    await expect(page.getByPlaceholder('Ej: Mercedes')).toBeVisible();
    await expect(page.getByPlaceholder('Ej: Actros')).toBeVisible();
  });

  test('validación de formulario: campos vacíos muestran errores', async ({ page }) => {
    await mockApis(page, { camiones: [] });
    await page.goto('/camiones/nuevo');
    await page.getByRole('button', { name: 'Guardar camión' }).click();
    await expect(page.getByText('La matrícula es obligatoria')).toBeVisible();
    await expect(page.getByText('La marca es obligatoria')).toBeVisible();
    await expect(page.getByText('El modelo es obligatorio')).toBeVisible();
  });

  test('crear camión nuevo: formulario válido', async ({ page }) => {
    await mockApis(page, { camiones: [] });
    await page.goto('/camiones/nuevo');
    await page.getByPlaceholder('Ej: 1234ABC').fill('9999XYZ');
    await page.getByPlaceholder('Ej: Mercedes').fill('MAN');
    await page.getByPlaceholder('Ej: Actros').fill('TGX');
    await page.getByRole('button', { name: 'Guardar camión' }).click();
    await page.waitForURL('**/camiones', { timeout: 5000 });
  });
});