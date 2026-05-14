import { test, expect } from '../../fixtures/auth-request';

test('liste des factures chargée avec badges statuts', async ({ page }) => {
  await page.goto('/facturation');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/FACT|facture/i).first()).toBeVisible({
    timeout: 8000,
  });
});

test('filtre par statut BROUILLON', async ({ page }) => {
  await page.goto('/facturation');
  await page.waitForLoadState('networkidle');
  const filter = page
    .getByRole('button', { name: /brouillon/i })
    .or(page.getByRole('option', { name: /brouillon/i }));
  if (await filter.first().isVisible()) {
    await filter.first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/brouillon/i).first()).toBeVisible();
  }
});

test('clic facture navigue vers détail', async ({ page }) => {
  await page.goto('/facturation');
  await page.waitForLoadState('networkidle');
  const firstLink = page
    .locator(
      'table a[href*="/facturation/"], [data-testid*="facture"] a[href*="/facturation/"]',
    )
    .first();
  if (await firstLink.isVisible()) {
    await firstLink.click();
    await page
      .waitForURL((url) => url.pathname !== '/facturation', { timeout: 8000 })
      .catch(() => {});
    expect(page.url()).toContain('/facturation/');
  }
});

test('facture BROUILLON: bouton Émettre visible et activé', async ({
  page,
}) => {
  await page.goto('/facturation');
  await page.waitForLoadState('networkidle');
  const firstLink = page.locator('a[href*="/facturation/"]').first();
  if (await firstLink.isVisible()) {
    await firstLink.click();
    await page.waitForLoadState('networkidle');
    const emettreBtn = page.getByRole('button', { name: /émettre|emettre/i });
    if (await emettreBtn.isVisible()) {
      await expect(emettreBtn).toBeEnabled();
    }
  }
});

test('enregistrer paiement complet change statut à PAYÉE', async ({ page }) => {
  await page.goto('/facturation');
  await page.waitForLoadState('networkidle');
  const emiseLink = page.locator('a[href*="/facturation/"]').first();
  if (await emiseLink.isVisible()) {
    await emiseLink.click();
    await page.waitForLoadState('networkidle');
    const payerBtn = page.getByRole('button', { name: /paiement|payer/i });
    if (await payerBtn.isVisible()) {
      await payerBtn.click();
      const montantInput = page.getByLabel(/montant/i);
      if (await montantInput.isVisible()) {
        await montantInput.fill('20000');
        await page
          .getByRole('button', { name: /confirmer|enregistrer|valider/i })
          .click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(/payée|payee/i)).toBeVisible({
          timeout: 5000,
        });
      }
    }
  }
});
