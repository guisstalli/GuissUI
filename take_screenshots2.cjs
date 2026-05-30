const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // Capture all network requests
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('api') || req.url().includes('login') || req.url().includes('auth') || req.url().includes('token')) {
      requests.push({ method: req.method(), url: req.url() });
    }
  });

  const responses = [];
  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('api') || url.includes('login') || url.includes('auth') || url.includes('token')) {
      try {
        const body = await resp.text();
        responses.push({ status: resp.status(), url, body: body.substring(0, 500) });
      } catch(e) {
        responses.push({ status: resp.status(), url, body: 'could not read' });
      }
    }
  });

  await page.goto('http://localhost:3000/auth/login');
  await page.waitForTimeout(1000);

  await page.fill('input[type="email"]', 'admin@guiss.sn');
  await page.fill('input[type="password"]', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  console.log('=== REQUESTS ===');
  requests.forEach(r => console.log(r.method, r.url));
  console.log('=== RESPONSES ===');
  responses.forEach(r => console.log(r.status, r.url, '\n', r.body, '\n---'));

  await browser.close();
})();
