import { test, expect } from '../fixtures/auth-request';

test('page profil accessible', async ({ page }) => {
  await page.goto('/profil');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/profil/, { timeout: 8000 });
});

test("page profil affiche nom et email de l'utilisateur", async ({ page }) => {
  await page.goto('/profil');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/@guiss\.sn|guiss/i).first()).toBeVisible({
    timeout: 8000,
  });
});

test("page profil affiche le rôle de l'utilisateur", async ({ page }) => {
  await page.goto('/profil');
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByText(/staff|admin|docteur|médecin|technicien/i).first(),
  ).toBeVisible({ timeout: 8000 });
});

test('modifier informations personnelles', async ({ page }) => {
  await page.goto('/profil');
  await page.waitForLoadState('networkidle');
  const editBtn = page
    .getByRole('button', { name: /modifier|éditer|edit/i })
    .or(page.getByRole('link', { name: /modifier|éditer/i }));
  if (await editBtn.first().isVisible()) {
    await editBtn.first().click();
    const prenomInput = page.getByLabel(/prénom|prenom/i);
    if (await prenomInput.isVisible()) {
      await prenomInput.clear();
      await prenomInput.fill('TestPrénom');
      await page
        .getByRole('button', { name: /enregistrer|sauvegarder|modifier/i })
        .click();
      await page.waitForLoadState('networkidle');
    }
  }
});
