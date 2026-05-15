import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('login avec credentials valides redirige vers dashboard', async ({
  page,
}) => {
  await page.goto('/auth/login');
  await page.getByLabel(/e.mail|adresse/i).fill('staff1@guiss.sn');
  await page.getByLabel(/mot de passe|password/i).fill('Test@1234');
  await page
    .getByRole('button', { name: /connexion|se connecter|login/i })
    .click();
  await page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
    timeout: 10000,
  });
  expect(page.url()).not.toContain('/auth/login');
});

test('login avec mauvais mot de passe affiche une erreur', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel(/e.mail|adresse/i).fill('staff1@guiss.sn');
  await page.getByLabel(/mot de passe|password/i).fill('MauvaisMotDePasse!');
  await page
    .getByRole('button', { name: /connexion|se connecter|login/i })
    .click();
  await expect(
    page
      .getByText(/incorrect|invalide|erreur|invalid|error/i)
      .or(page.locator('[data-sonner-toast]'))
      .first(),
  ).toBeVisible({ timeout: 5000 });
  expect(page.url()).toContain('/auth/login');
});

test('champs vides bloquent la soumission', async ({ page }) => {
  await page.goto('/auth/login');
  await page
    .getByRole('button', { name: /connexion|se connecter|login/i })
    .click();
  expect(page.url()).toContain('/auth/login');
});

test('redirect automatique vers /auth/login si non authentifié', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForURL((url) => url.pathname.includes('/auth/login'), {
    timeout: 8000,
  });
  expect(page.url()).toContain('/auth/login');
});
