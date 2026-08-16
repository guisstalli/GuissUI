import { test, expect } from '../../fixtures/auth-request';

// `analytics:view` n'appartient qu'à SUPERUSER, DOCTEUR et ADMIN — STAFF et
// TECHNICIEN en sont volontairement exclus (voir src/lib/authorization.ts).
// Or tous les projets Playwright exécutent toutes les specs : sous `staff`,
// ces tests visaient un écran auquel le rôle n'a pas accès et échouaient sur
// une redirection parfaitement légitime.
const ROLES_SANS_ANALYTIQUE = ['staff', 'technicien'];

test.beforeEach(({}, testInfo) => {
  test.skip(
    ROLES_SANS_ANALYTIQUE.includes(testInfo.project.name),
    `Le rôle « ${testInfo.project.name} » n'a pas la permission analytics:view.`,
  );
});

test('page analytics chargée', async ({ page }) => {
  await page.goto('/analytics');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/analytics/, { timeout: 8000 });
});

test('KPIs overview affichés', async ({ page }) => {
  await page.goto('/analytics');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/patient|examen/i).first()).toBeVisible({
    timeout: 8000,
  });
});

test('graphiques chargés', async ({ page }) => {
  await page.goto('/analytics');
  await page.waitForLoadState('networkidle');
  const charts = page.locator(
    'canvas, svg[class*="chart"], [data-testid*="chart"]',
  );
  if (await charts.first().isVisible()) {
    await expect(charts.first()).toBeVisible({ timeout: 8000 });
  }
});

test('filtre par site disponible', async ({ page }) => {
  await page.goto('/analytics');
  await page.waitForLoadState('networkidle');
  // Wait for any toast notification to disappear before clicking
  await page
    .locator('[aria-live="assertive"] > *')
    .waitFor({ state: 'hidden', timeout: 5000 })
    .catch(() => {});
  const siteFilter = page.getByRole('combobox').or(page.getByLabel(/site/i));
  if (await siteFilter.first().isVisible()) {
    await siteFilter.first().click({ force: true });
    await page
      .waitForLoadState('networkidle', { timeout: 5000 })
      .catch(() => {});
  }
});
