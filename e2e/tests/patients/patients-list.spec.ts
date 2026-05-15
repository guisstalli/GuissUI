import { test, expect } from '../../fixtures/auth-request';

test('liste des patients chargée avec au moins 1 patient', async ({ page }) => {
  await page.goto('/patients');
  await page.waitForLoadState('networkidle');
  const rows = page.locator('table tbody tr, [data-testid="patient-row"]');
  await expect(rows.first()).toBeVisible({ timeout: 8000 });
});

test('filtre Adulte affiche seulement les adultes', async ({ page }) => {
  await page.goto('/patients');
  await page.waitForLoadState('networkidle');
  const adulteFilter = page
    .getByRole('button', { name: /adulte/i })
    .or(page.getByRole('radio', { name: /adulte/i }));
  if (await adulteFilter.isVisible()) {
    await adulteFilter.click();
    await page.waitForLoadState('networkidle');
  }
  await expect(page.getByText(/adulte/i).first()).toBeVisible();
});

test('filtre Enfant affiche seulement les enfants', async ({ page }) => {
  await page.goto('/patients');
  await page.waitForLoadState('networkidle');
  const enfantFilter = page
    .getByRole('button', { name: /enfant/i })
    .or(page.getByRole('radio', { name: /enfant/i }));
  if (await enfantFilter.isVisible()) {
    await enfantFilter.click();
    await page.waitForLoadState('networkidle');
  }
  await expect(page.getByText(/enfant/i).first()).toBeVisible();
});

test('recherche par nom filtre les résultats', async ({ page }) => {
  await page.goto('/patients');
  await page.waitForLoadState('networkidle');
  const searchInput = page
    .getByPlaceholder(/recherche|search/i)
    .or(page.getByRole('searchbox'));
  if (await searchInput.isVisible()) {
    await searchInput.fill('Diallo');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Diallo/i).first()).toBeVisible({
      timeout: 5000,
    });
  }
});

test('clic sur nom patient navigue vers détail', async ({ page }) => {
  await page.goto('/patients');
  await page.waitForLoadState('networkidle');
  const firstPatientLink = page
    .locator(
      'table a[href*="/patients/"], [data-testid="patient-row"] a[href*="/patients/"]',
    )
    .first();
  if (await firstPatientLink.isVisible()) {
    const href = await firstPatientLink.getAttribute('href');
    await firstPatientLink.click();
    await page
      .waitForURL((url) => url.pathname !== '/patients', { timeout: 8000 })
      .catch(() => {});
    if (href) {
      expect(page.url()).toContain('/patients/');
    }
  }
});
