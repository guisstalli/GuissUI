const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // Login
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/screenshots2/login_page.png' });

  try {
    await page.fill('input[type="email"], input[name="email"]', 'test@guiss.sn');
    await page.fill('input[type="password"], input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  } catch(e) { console.log('login error:', e.message); }

  await page.screenshot({ path: '/tmp/screenshots2/after_login.png' });
  console.log('after_login done, URL:', page.url());

  // Patient list
  await page.goto('http://localhost:3000/patients');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/screenshots2/patient_list.png', fullPage: true });
  console.log('patient_list done');

  // Driver list
  await page.goto('http://localhost:3000/conducteurs');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/screenshots2/driver_list.png', fullPage: true });
  console.log('driver_list done');

  // Driver detail
  await page.goto('http://localhost:3000/conducteurs/61');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/screenshots2/driver_detail.png', fullPage: true });
  console.log('driver_detail done');

  // Patient detail
  await page.goto('http://localhost:3000/patients/302');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/screenshots2/patient_detail.png', fullPage: true });
  console.log('patient_detail done');

  await browser.close();
})();
