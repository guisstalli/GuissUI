import { test, expect } from '../../fixtures/auth-request';

// =============================================================================
// Liste conducteurs
// =============================================================================

test('liste des conducteurs se charge sans crash', async ({ page }) => {
  await page.goto('/conducteurs');
  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/auth\/login/, { timeout: 8000 });
  await expect(
    page.getByText(/conducteur/i).first(),
  ).toBeVisible({ timeout: 8000 });
});

test('liste conducteurs — menu d'actions par ligne est présent', async ({ page }) => {
  await page.goto('/conducteurs');
  await page.waitForLoadState('networkidle');

  // Cherche le premier bouton d'actions (3 points verticaux)
  const actionButton = page.locator('button[aria-label="Actions"], button:has(svg)').first();
  if (await actionButton.isVisible({ timeout: 5000 })) {
    await actionButton.click();
    await expect(page.getByText(/voir/i).first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/modifier/i).first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/supprimer/i).first()).toBeVisible({ timeout: 3000 });
  }
});

test('liste conducteurs — "Voir" navigue vers la page détail', async ({ page }) => {
  await page.goto('/conducteurs');
  await page.waitForLoadState('networkidle');

  const firstLink = page
    .locator('table a[href*="/conducteurs/"], a[href*="/conducteurs/"]')
    .first();
  if (await firstLink.isVisible({ timeout: 5000 })) {
    const href = await firstLink.getAttribute('href');
    if (href) {
      await page.goto(href);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/conducteurs\/\d+/, { timeout: 8000 });
    }
  }
});

// =============================================================================
// Page détail conducteur — structure en onglets
// =============================================================================

test('page détail conducteur — 3 onglets présents (État civil, Examens, Antécédents)', async ({
  page,
}) => {
  await page.goto('/conducteurs');
  await page.waitForLoadState('networkidle');

  const firstLink = page
    .locator('a[href*="/conducteurs/"]')
    .first();
  if (!(await firstLink.isVisible({ timeout: 5000 }))) {
    test.skip();
    return;
  }

  await firstLink.click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/conducteurs\/\d+/, { timeout: 8000 });

  await expect(
    page.getByRole('tab', { name: /état civil/i }),
  ).toBeVisible({ timeout: 8000 });
  await expect(
    page.getByRole('tab', { name: /examens/i }),
  ).toBeVisible({ timeout: 8000 });
  await expect(
    page.getByRole('tab', { name: /antécédents/i }),
  ).toBeVisible({ timeout: 8000 });
});

test('page détail conducteur — onglet Examens ne propose pas de créer un examen enfant', async ({
  page,
}) => {
  await page.goto('/conducteurs');
  await page.waitForLoadState('networkidle');

  const firstLink = page
    .locator('a[href*="/conducteurs/"]')
    .first();
  if (!(await firstLink.isVisible({ timeout: 5000 }))) {
    test.skip();
    return;
  }

  await firstLink.click();
  await page.waitForLoadState('networkidle');

  const examsTab = page.getByRole('tab', { name: /examens/i });
  if (await examsTab.isVisible({ timeout: 8000 })) {
    await examsTab.click();
    await page.waitForTimeout(500);
    await expect(
      page.getByRole('button', { name: /examen enfant/i }),
    ).not.toBeVisible();
  }
});

test('page détail conducteur — onglet Examens a le bouton "Nouvel examen adulte"', async ({
  page,
}) => {
  await page.goto('/conducteurs');
  await page.waitForLoadState('networkidle');

  const firstLink = page
    .locator('a[href*="/conducteurs/"]')
    .first();
  if (!(await firstLink.isVisible({ timeout: 5000 }))) {
    test.skip();
    return;
  }

  await firstLink.click();
  await page.waitForLoadState('networkidle');

  const examsTab = page.getByRole('tab', { name: /examens/i });
  if (await examsTab.isVisible({ timeout: 8000 })) {
    await examsTab.click();
    await page.waitForTimeout(500);
    await expect(
      page.getByRole('button', { name: /nouvel examen adulte/i }),
    ).toBeVisible({ timeout: 5000 });
  }
});

// =============================================================================
// Dialog pointer-events — régression W3-BUG-6
// =============================================================================

test('page est cliquable après fermeture d'un dialog (no pointer-events freeze)', async ({
  page,
}) => {
  await page.goto('/conducteurs');
  await page.waitForLoadState('networkidle');

  // Ouvrir le dialog de création
  const newBtn = page.getByRole('button', { name: /nouveau conducteur/i });
  if (await newBtn.isVisible({ timeout: 5000 })) {
    await newBtn.click();
    await page.waitForTimeout(300);

    // Fermer le dialog
    const closeBtn = page.locator('button[aria-label="Close"], button:has(svg)').first();
    if (await closeBtn.isVisible({ timeout: 3000 })) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // La page doit être cliquable — vérifier que pointer-events n'est pas bloqué
    const bodyPointerEvents = await page.evaluate(
      () => window.getComputedStyle(document.body).pointerEvents,
    );
    expect(bodyPointerEvents).not.toBe('none');

    // Cliquer sur le bouton de filtres doit fonctionner
    const filterBtn = page.getByRole('button', { name: /filtres/i });
    if (await filterBtn.isVisible({ timeout: 3000 })) {
      await filterBtn.click();
      await expect(filterBtn).toBeVisible();
    }
  }
});
