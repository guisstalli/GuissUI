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

  // Take screenshot of login page
  await page.screenshot({ path: '/tmp/screenshots/login_page.png', fullPage: true });
  console.log('login_page screenshot done');

  // Fill login form with admin@guiss.sn
  console.log('Filling login form with admin@guiss.sn / Admin1234!');
  await page.fill('input[name="email"]', 'admin@guiss.sn');
  await page.fill('input[name="password"]', 'Admin1234!');

  // Click submit and wait for navigation
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(e => console.log('nav timeout:', e.message)),
    page.click('button[type="submit"]')
  ]);

  await page.waitForTimeout(3000);
  console.log('After login URL:', page.url());

  await page.screenshot({ path: '/tmp/screenshots/after_login.png', fullPage: true });
  console.log('after_login screenshot done');

  // Check if login succeeded
  if (page.url().includes('/auth/login')) {
    console.log('Login failed, checking page for error messages...');
    const errorText = await page.textContent('body').catch(() => '');
    console.log('Page text (first 500 chars):', errorText.substring(0, 500));

    // Try other credentials
    const credsList = [
      ['superuser@guiss.sn', 'Admin1234!'],
      ['admin@guiss.sn', 'admin123'],
      ['docteur1@guiss.sn', 'Admin1234!'],
    ];

    for (const [email, pwd] of credsList) {
      console.log(`Trying ${email} / ${pwd}...`);
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', pwd);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 8000 }).catch(() => {}),
        page.click('button[type="submit"]')
      ]);
      await page.waitForTimeout(2000);
      console.log('URL after attempt:', page.url());
      if (!page.url().includes('/auth/login')) {
        console.log('Login succeeded with:', email);
        break;
      }
    }
  }

  console.log('Final login URL:', page.url());

  // Screenshot exam adult list
  console.log('Navigating to /exams/adult...');
  await page.goto('http://localhost:3000/exams/adult');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/screenshots/exam_adult_list.png', fullPage: true });
  console.log('exam_adult_list done, URL:', page.url());

  // Log visible text on this page
  const listText = await page.locator('main, [role="main"], body').first().innerText().catch(() => '');
  console.log('Page content preview:', listText.substring(0, 800));

  // Screenshot adult exam detail
  console.log('Navigating to /exams/adult/201...');
  await page.goto('http://localhost:3000/exams/adult/201');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/screenshots/exam_adult_detail.png', fullPage: true });
  console.log('exam_adult_detail done, URL:', page.url());

  const detailText = await page.locator('main, [role="main"], body').first().innerText().catch(() => '');
  console.log('Adult detail page content preview:', detailText.substring(0, 800));

  // Screenshot child exam detail
  console.log('Navigating to /exams/child/91...');
  await page.goto('http://localhost:3000/exams/child/91');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/screenshots/exam_child_detail.png', fullPage: true });
  console.log('exam_child_detail done, URL:', page.url());

  const childText = await page.locator('main, [role="main"], body').first().innerText().catch(() => '');
  console.log('Child detail page content preview:', childText.substring(0, 800));

  await browser.close();
  console.log('All done!');
})();
