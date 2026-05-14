import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // --- Setup projects (one per role) ---
    {
      name: 'setup:admin',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup:staff',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup:docteur',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup:technicien',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // --- Test projects (authenticated, one per role) ---
    {
      name: 'admin',
      testMatch: /.*\.spec\.ts/,
      testIgnore: [
        /tests\/exams\/.*/, // exam tests require depistage permissions
        /.*\.public\.spec\.ts/, // public tests run in the public project only
        /tests\/auth\/login\.spec\.ts/, // login tests run in no-auth project
        /tests\/patients\/.*/, // admin has no patients permissions
        /tests\/appointments\/.*/, // admin has no appointments permissions
        /tests\/billing\/.*/, // admin has no billing permissions
        /tests\/events\/.*/, // admin has no events permissions
        /tests\/conducteurs\/.*/, // admin has no conducteurs permissions
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup:admin'],
    },
    {
      name: 'staff',
      testMatch: /.*\.spec\.ts/,
      testIgnore: [
        /tests\/exams\/.*/, // exam tests require depistage permissions
        /.*\.public\.spec\.ts/,
        /tests\/auth\/login\.spec\.ts/,
        /tests\/admin\/.*/, // staff cannot manage users
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/staff.json',
      },
      dependencies: ['setup:staff'],
    },
    {
      name: 'docteur',
      testMatch: /.*\.spec\.ts/,
      testIgnore: [
        /.*\.public\.spec\.ts/,
        /tests\/auth\/login\.spec\.ts/,
        /tests\/admin\/.*/, // admin pages require admin role
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/docteur.json',
      },
      dependencies: ['setup:docteur'],
    },
    {
      name: 'technicien',
      testMatch: /.*\.spec\.ts/,
      testIgnore: [
        /.*\.public\.spec\.ts/,
        /tests\/auth\/login\.spec\.ts/,
        /tests\/admin\/.*/, // admin pages require admin role
        /tests\/analytics\/.*/, // analytics reserved for médecins and admins
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/technicien.json',
      },
      dependencies: ['setup:technicien'],
    },

    // --- Public project (no auth required) ---
    {
      name: 'public',
      testMatch: /.*\.public\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // --- No-auth project for login flow tests ---
    {
      name: 'no-auth',
      testMatch: /tests\/auth\/login\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
    },
  ],

  webServer: {
    command: `yarn dev --port ${PORT}`,
    timeout: 120 * 1000,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
