import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/', title: 'Panel de Control' },
  { path: '/parcelas/tabla', title: 'Parcelas' },
  { path: '/camiones', title: 'Camiones' },
  { path: '/camioneros', title: 'Camioneros' },
  { path: '/transportes', title: 'Transportes' },
  { path: '/centros', title: 'Centros' },
  { path: '/proveedores', title: 'Proveedores' },
  { path: '/eudr', title: 'Cumplimiento' },
];

async function mockAllApis(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/parcelas*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: [], totalPages: 0, totalElements: 0, size: 100, number: 0 }),
    });
  });
  await page.route('**/api/v1/camiones', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
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
  await page.route('https://{s}.tile.openstreetmap.org/**', (route) => route.abort());
}

test('todas las rutas principales responden sin 404', async ({ page }) => {
  for (const { path } of ROUTES) {
    await mockAllApis(page);
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded');
    const pageTitle = await page.title();
    expect(pageTitle).toContain('FRANKY');
    expect(page.url()).not.toContain('/404');
    await page.waitForTimeout(300);
  }
});

test('404 page se muestra para rutas inexistentes', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/ruta/no/existe');
  expect(page.url()).toContain('/ruta/no/existe');
});

test('sidebar contiene todas las secciones principales', async ({ page }) => {
  await mockAllApis(page);
  await page.goto('/');
  await expect(page.getByText('FRANKY')).toBeVisible();
  const links = page.locator('nav a');
  await expect(links).toHaveCount(8);
});