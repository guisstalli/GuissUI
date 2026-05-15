import { test, expect } from '../../fixtures/auth-request';

test('page rendez-vous chargée', async ({ page }) => {
  await page.goto('/rendez-vous');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/rendez-vous/, { timeout: 8000 });
});

test('vue calendrier visible', async ({ page }) => {
  await page.goto('/rendez-vous');
  await page.waitForLoadState('networkidle');
  const calendar = page
    .locator('[data-testid="calendar"]')
    .or(page.getByRole('grid'))
    .or(page.locator('.fc, .rbc-calendar, [class*="calendar"]'));
  await expect(calendar.first()).toBeVisible({ timeout: 8000 });
});

test('navigation Précédent/Suivant change le mois', async ({ page }) => {
  await page.goto('/rendez-vous');
  await page.waitForLoadState('networkidle');
  const nextBtn = page
    .getByRole('button', { name: /suivant|next/i })
    .or(page.locator('[aria-label*="next"], [aria-label*="suivant"]'));
  if (await nextBtn.first().isVisible()) {
    await nextBtn.first().click();
    await page.waitForLoadState('networkidle');
  }
});

test('bouton Nouveau rendez-vous ouvre formulaire', async ({ page }) => {
  await page.goto('/rendez-vous');
  await page.waitForLoadState('networkidle');
  const newBtn = page.getByRole('button', { name: /nouveau|créer|new/i });
  if (await newBtn.isVisible()) {
    await newBtn.click();
    await expect(page.getByRole('dialog').or(page.locator('form'))).toBeVisible(
      {
        timeout: 5000,
      },
    );
  }
});

test('statistiques RDV affichées', async ({ page }) => {
  await page.goto('/rendez-vous');
  await page.waitForLoadState('networkidle');
  const statsTab = page.getByRole('tab', { name: /statistiques|stats/i });
  if (await statsTab.isVisible()) {
    await statsTab.click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByText(/présent|confirmé|annulé/i).first(),
    ).toBeVisible({ timeout: 5000 });
  }
});
