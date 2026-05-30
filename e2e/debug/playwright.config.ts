import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  use: { trace: 'off', screenshot: 'off', video: 'off' },
  reporter: 'list',
  workers: 1,
  retries: 0,
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
