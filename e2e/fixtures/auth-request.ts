/**
 * Custom Playwright fixture that provides an authenticated `APIRequestContext`.
 *
 * The base `request` fixture is unauthenticated — it only inherits browser
 * storageState (cookies/localStorage) but does not inject Authorization headers.
 *
 * This fixture reads the access token that auth.setup.ts saves to
 * `e2e/.auth/<role>-token.json` and creates a request context with a
 * `Authorization: Bearer` header. The token file is written once per setup run,
 * so we never hit the 10/min login throttle during parallel test execution.
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { test as base, request as baseRequest } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.resolve(__dirname, '../.auth');

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function readAccessToken(projectName: string): string {
  const name = projectName.replace(/^setup:/, '');
  const filePath = path.join(AUTH_DIR, `${name}-token.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { access } = JSON.parse(raw) as { access: string; savedAt: number };
    return access;
  } catch {
    throw new Error(
      `[auth-request] Token file not found for project "${projectName}". ` +
        `Run auth setup first: yarn playwright test --project=setup:${name}`,
    );
  }
}

type WorkerFixtures = {
  /** Access token shared across all tests in the same worker (login once per worker). */
  _workerAccessToken: string;
};

type TestFixtures = {
  /** Authenticated APIRequestContext with Bearer token. */
  apiRequest: Awaited<ReturnType<typeof baseRequest.newContext>>;
  /**
   * Override of the built-in `page` fixture.
   * Intercepts every POST to /jwt/refresh/ and responds with the saved access
   * token — this prevents the rotating refresh token in storageState from ever
   * reaching the real backend, so all test contexts share the same valid token
   * without triggering blacklist / 401 failures.
   */
  page: import('@playwright/test').Page;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Read the access token saved by auth.setup.ts — once per worker, no HTTP call.
  _workerAccessToken: [
    async ({}, use, workerInfo) => {
      const access = readAccessToken(workerInfo.project.name);
      await use(access);
    },
    { scope: 'worker' },
  ],

  apiRequest: async ({ _workerAccessToken }, use) => {
    const authCtx = await baseRequest.newContext({
      baseURL: apiUrl(),
      extraHTTPHeaders: { Authorization: `Bearer ${_workerAccessToken}` },
    });
    await use(authCtx);
    await authCtx.dispose();
  },

  // Intercept JWT refresh so the storageState refresh token is never consumed.
  page: async ({ page, _workerAccessToken }, use) => {
    await page.route('**/api/v1/auth/jwt/refresh/', async (route) => {
      let refreshToken = '';
      try {
        refreshToken =
          (route.request().postDataJSON() as { refresh?: string })?.refresh ??
          '';
      } catch {
        /* ignore parse errors */
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access: _workerAccessToken, refresh: refreshToken }),
      });
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
