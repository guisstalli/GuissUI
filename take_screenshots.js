const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // Login
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForTimeout(2000);

  // Take screenshot of login page before login
  await page.screenshot({ path: '/tmp/screenshots/login_page.png', fullPage: true });
  console.log('login_page screenshot done');

  // Fill login form
  try {
    await page.fill('input[name="email"]', 'test@guiss.sn');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log('After login, URL:', page.url());
  } catch(e) {
    console.log('login error:', e.message);
  }

  // If still on login page, try other credentials
  if (page.url().includes('/auth/login')) {
    console.log('First login failed, trying saisie credentials...');
    await page.fill('input[name="email"]', 'saisie@guiss.sn');
    await page.fill('input[name="password"]', 'Saisie1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log('After second login attempt, URL:', page.url());
  }

  await page.screenshot({ path: '/tmp/screenshots/after_login.png', fullPage: true });
  console.log('after_login screenshot done, URL:', page.url());

  // Screenshot exam adult list
  console.log('Navigating to exam adult list...');
  await page.goto('http://localhost:3000/exams/adult');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/tmp/screenshots/exam_adult_list.png', fullPage: true });
  console.log('exam_adult_list done, URL:', page.url());

  // Screenshot adult exam detail
  console.log('Navigating to adult exam detail 201...');
  await page.goto('http://localhost:3000/exams/adult/201');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/tmp/screenshots/exam_adult_detail.png', fullPage: true });
  console.log('exam_adult_detail done, URL:', page.url());

  // Screenshot child exam detail
  console.log('Navigating to child exam detail 91...');
  await page.goto('http://localhost:3000/exams/child/91');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/tmp/screenshots/exam_child_detail.png', fullPage: true });
  console.log('exam_child_detail done, URL:', page.url());

  await browser.close();
  console.log('All done!');
})();
