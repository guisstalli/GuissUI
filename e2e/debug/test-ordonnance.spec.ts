import { test, chromium } from '@playwright/test';

test.setTimeout(180_000);

const BASE = 'http://localhost:3000';

test('multi-ordonnance — medicament + optique sidebar', async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error' || t === 'log') {
      const txt = msg.text();
      if (txt.startsWith('[E2E]') || t === 'error') {
        console.log(`[CONSOLE ${t.toUpperCase()}]`, txt.slice(0, 300));
      }
    }
  });
  page.on('pageerror', (err) => console.log('[PAGE ERROR]', err.message.slice(0, 300)));
  page.on('response', async (resp) => {
    const url = resp.url();
    const status = resp.status();
    if (
      url.includes('/ordonnance') ||
      url.includes('/ordonnances') ||
      url.includes('/api/auth/callback') ||
      (status >= 400 && !url.includes('_next'))
    ) {
      console.log(`[HTTP ${status}] ${url.replace(BASE, '')}`);
    }
  });

  console.log('\n=== LOGIN ===');
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
  await page.locator('input[name="email"], input[type="email"]').first().fill('doc.test@guiss.sn');
  await page.locator('input[type="password"]').first().fill('TestPass123!');
  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.waitForTimeout(15000);

  if (page.url().includes('/auth/login')) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  }
  if (page.url().includes('/auth/login')) {
    await page.screenshot({ path: '/tmp/e2e-debug/X-still-login.png', fullPage: true });
    await browser.close();
    return;
  }

  console.log('\n=== EXAM LIST ===');
  await page.goto(`${BASE}/exams/adult`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const voirLinks = page.getByRole('link', { name: /^voir$/i });
  const voirCount = await voirLinks.count();
  console.log('"Voir" link count:', voirCount);
  if (voirCount === 0) {
    await browser.close();
    return;
  }

  await voirLinks.first().click();
  await page.waitForURL(/\/exams\/adult\/\d+/, { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('Exam URL:', page.url());

  console.log('\n=== SIDEBAR — 2 ORDONNANCES ===');
  await page.screenshot({
    path: '/tmp/e2e-debug/11-sidebar-after-multi-refactor.png',
    fullPage: true,
  });

  const ordonnancesHeader = await page.getByText(/^ordonnances$/i).count();
  const medRow = await page.getByText(/^médicamenteuse$/i).count();
  const optRow = await page.getByText(/^correction optique$/i).count();
  console.log('Header "Ordonnances":', ordonnancesHeader);
  console.log('Med row "Médicamenteuse":', medRow);
  console.log('Opt row "Correction optique":', optRow);

  const downloadButtons = await page.getByRole('button', { name: /^télécharger$/i }).count();
  const rediger = await page.getByRole('button', { name: /^rédiger$/i }).count();
  const modifier = await page.getByRole('button', { name: /^modifier$/i }).count();
  console.log('Download buttons:', downloadButtons);
  console.log('"Rédiger" buttons:', rediger);
  console.log('"Modifier" buttons:', modifier);

  console.log('\n=== OPEN MED DIALOG (locked badge) ===');
  const medRedigerOrModifier = page
    .locator('aside')
    .getByRole('button', { name: /^(rédiger|modifier)$/i })
    .first();
  if ((await medRedigerOrModifier.count()) > 0) {
    await medRedigerOrModifier.click();
    await page.waitForTimeout(1200);
    const lockedBadge = await page.getByText(/^Ordonnance médicamenteuse$/i).count();
    const lockedHint = await page.getByText(/Verrouillé/i).count();
    console.log('Locked badge visible:', lockedBadge);
    console.log('Locked hint visible:', lockedHint);
    await page.screenshot({
      path: '/tmp/e2e-debug/12-medic-dialog-locked.png',
      fullPage: true,
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  console.log('\n=== OPEN OPT DIALOG (locked badge) ===');
  const optButton = page
    .locator('aside')
    .getByRole('button', { name: /^(rédiger|modifier)$/i })
    .nth(1);
  if ((await optButton.count()) > 0) {
    await optButton.click();
    await page.waitForTimeout(1200);
    const lockedBadgeOpt = await page
      .getByText(/^Ordonnance de correction optique$/i)
      .count();
    console.log('Locked badge OPT visible:', lockedBadgeOpt);
    await page.screenshot({
      path: '/tmp/e2e-debug/13-optique-dialog-locked.png',
      fullPage: true,
    });
  }

  await browser.close();
});
