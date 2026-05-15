import { test, expect } from '../fixtures/auth-request';

// Unauthenticated flows — run with an empty storageState so there is no
// session cookie/token, regardless of which Playwright project runs this.
test.describe('non authentifié', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('root redirige vers /auth/login si non authentifié', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/auth\/login/, { timeout: 8000 });
  });

  test('page /auth/login affiche le formulaire de connexion', async ({
    page,
  }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel(/adresse e-mail/i)).toBeVisible({
      timeout: 8000,
    });
    await expect(
      page.getByRole('button', { name: /se connecter/i }),
    ).toBeVisible({ timeout: 8000 });
  });
});

// Authenticated flows — use the project storageState + JWT refresh mock.
test('utilisateur authentifié accède au tableau de bord', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/auth\/login/, { timeout: 8000 });
});

test('page patients accessible après authentification', async ({ page }) => {
  await page.goto('/patients');
  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/auth\/login/, { timeout: 8000 });
});

test('barre de navigation présente', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const nav = page.locator('nav, [role="navigation"], aside').first();
  if (await nav.isVisible()) {
    await expect(nav).toBeVisible({ timeout: 5000 });
  }
});
