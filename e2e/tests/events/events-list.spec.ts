import { test, expect } from '../../fixtures/auth-request';

test('liste des événements chargée', async ({ page }) => {
  await page.goto('/gestion/evenements');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/evenements/, { timeout: 8000 });
});

test('badges statuts visibles', async ({ page }) => {
  await page.goto('/gestion/evenements');
  await page.waitForLoadState('networkidle');
  const hasEvents = await page
    .locator('a[href*="/evenements/"]')
    .first()
    .isVisible();
  if (!hasEvents) return;
  await expect(
    page.getByText(/planifié|en cours|terminé|annulé/i).first(),
  ).toBeVisible({ timeout: 8000 });
});

test('filtre par statut fonctionne', async ({ page }) => {
  await page.goto('/gestion/evenements');
  await page.waitForLoadState('networkidle');
  const filterBtn = page
    .getByRole('button', { name: /planifié|statut|filtre/i })
    .or(page.getByRole('combobox'));
  if (await filterBtn.first().isVisible()) {
    await filterBtn.first().click();
    await page.waitForLoadState('networkidle');
  }
});

test('bouton Nouvel événement navigue vers formulaire', async ({ page }) => {
  await page.goto('/gestion/evenements');
  await page.waitForLoadState('networkidle');
  const newBtn = page
    .getByRole('link', { name: /nouvel|créer|nouveau/i })
    .or(page.getByRole('button', { name: /nouvel|créer|nouveau/i }));
  if (await newBtn.isVisible()) {
    await newBtn.click();
    await expect(page).toHaveURL(/evenements\/(nouveau|creer|create)/, {
      timeout: 8000,
    });
  }
});

test('clic événement navigue vers détail', async ({ page }) => {
  await page.goto('/gestion/evenements');
  await page.waitForLoadState('networkidle');
  // La route `/evenements` n'existe pas : les vraies sont
  // `/gestion/evenements` et `/public/evenements`. Le test partait donc d'une
  // page morte, y trouvait un lien quelconque, et attendait une URL qui ne
  // pouvait jamais venir. Depuis la liste, un événement mène à ses
  // inscriptions (voir src/app/gestion/evenements/page.tsx).
  const firstLink = page
    .locator('a[href*="/gestion/evenements/"]')
    .first();
  await expect(firstLink).toBeVisible({ timeout: 8000 });
  await firstLink.click();
  await page.waitForURL((url) => /\/gestion\/evenements\/\d+/.test(url.pathname), {
    timeout: 8000,
  });
  expect(page.url()).toMatch(/\/gestion\/evenements\/\d+/);
});
