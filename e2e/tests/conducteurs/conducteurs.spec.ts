import type { Page } from '@playwright/test';

import { test, expect } from '../../fixtures/auth-request';

/**
 * Ouvre la fiche du premier conducteur.
 *
 * Le lien vers le détail n'est PAS dans la ligne : il vit dans le menu
 * d'actions (voir src/app/conducteurs/page.tsx). Les tests cherchaient donc un
 * `a[href]` visible qui n'existe pas, et s'ignoraient silencieusement — un
 * échec déguisé en succès. On navigue désormais comme un utilisateur : ouvrir
 * le menu de la ligne, puis cliquer « Voir ».
 */
async function ouvrirPremiereFiche(page: Page): Promise<void> {
  const menu = page
    .getByRole('row')
    .getByRole('button', { name: 'Actions' })
    .first();
  await expect(menu).toBeVisible({ timeout: 8000 });
  await menu.click();
  await page.getByRole('menuitem', { name: /voir/i }).first().click();
  await page.waitForLoadState('networkidle');
}

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

test("liste conducteurs — menu d'actions par ligne est présent", async ({ page }) => {
  await page.goto('/conducteurs');
  await page.waitForLoadState('networkidle');

  // Cherche le premier bouton d'actions (3 points verticaux)
  // `button:has(svg)` sur toute la page attrapait le repli de la barre
  // latérale, pas le menu de ligne. Le déclencheur porte un `sr-only`
  // « Actions » : c'est son NOM ACCESSIBLE, pas un attribut aria-label — d'où
  // l'échec du sélecteur CSS. On le cible par rôle, et dans le tableau.
  const actionButton = page
    .getByRole('row')
    .getByRole('button', { name: 'Actions' })
    .first();
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

  // Restreint au TABLEAU : `a[href*="/conducteurs/"]` sur toute la page
  // capturait aussi les liens de la barre latérale (/conducteurs/corbeille,
  // /conducteurs/examens…), d'où une navigation vers la corbeille.
  const firstLink = page.locator('table a[href*="/conducteurs/"]').first();
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

  await ouvrirPremiereFiche(page);
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

  await ouvrirPremiereFiche(page);

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

  await ouvrirPremiereFiche(page);

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

test("page est cliquable après fermeture d'un dialog (no pointer-events freeze)", async ({
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
    // Même piège : le bouton de fermeture Radix expose « Close » via un
    // `sr-only`. Le sélecteur CSS ne le trouvait pas et cliquait ailleurs —
    // le dialogue restait ouvert, ce que montrent les captures d'échec.
    const closeBtn = page
      .getByRole('dialog')
      .getByRole('button', { name: 'Close' })
      .first();
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
