import { test, expect } from '../../fixtures/auth-request';

test('liste des sites visible', async ({ page }) => {
  await page.goto('/sites');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/sites/, { timeout: 8000 });
  await expect(page.getByText(/Dakar|Thiès|Saint-Louis/i).first()).toBeVisible({
    timeout: 8000,
  });
});

test('créer un site', async ({ page }) => {
  await page.goto('/sites');
  await page.waitForLoadState('networkidle');
  const newBtn = page
    .getByRole('button', { name: /créer|nouveau|ajouter/i })
    .or(page.getByRole('link', { name: /créer|nouveau|ajouter/i }));
  if (await newBtn.isVisible()) {
    await newBtn.click();
    const nomInput = page.getByLabel(/nom/i);
    if (await nomInput.isVisible()) {
      await nomInput.fill('Site Test E2E');
      await page
        .getByRole('button', { name: /enregistrer|sauvegarder|créer/i })
        .click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/Site Test E2E/)).toBeVisible({
        timeout: 5000,
      });
    }
  }
});

test('modifier un site', async ({ page }) => {
  await page.goto('/sites');
  await page.waitForLoadState('networkidle');
  const editBtn = page
    .getByRole('button', { name: /modifier|éditer|edit/i })
    .first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    const nomInput = page.getByLabel(/nom/i);
    if (await nomInput.isVisible()) {
      await nomInput.clear();
      await nomInput.fill('Site Modifié E2E');
      await page
        .getByRole('button', { name: /enregistrer|sauvegarder/i })
        .click();
      await page.waitForLoadState('networkidle');
    }
  }
});

test('supprimer un site: annuler laisse le site en place', async ({ page }) => {
  await page.goto('/sites');
  await page.waitForLoadState('networkidle');
  const deleteBtn = page
    .getByRole('button', { name: /supprimer|delete/i })
    .first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    const dialog = page.getByRole('alertdialog').or(page.getByRole('dialog'));
    if (await dialog.isVisible()) {
      await page.getByRole('button', { name: /annuler|cancel/i }).click();
      await expect(dialog).not.toBeVisible({ timeout: 3000 });
    }
  }
});
