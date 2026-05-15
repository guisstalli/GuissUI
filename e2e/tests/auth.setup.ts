import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { test as setup, expect } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'Test@1234';

const ROLES = {
  'setup:admin': {
    email: 'admin@guiss.sn',
    password: E2E_PASSWORD,
    authFile: 'e2e/.auth/admin.json',
    tokenFile: path.resolve(__dirname, '../.auth/admin-token.json'),
  },
  'setup:staff': {
    email: 'staff1@guiss.sn',
    password: E2E_PASSWORD,
    authFile: 'e2e/.auth/staff.json',
    tokenFile: path.resolve(__dirname, '../.auth/staff-token.json'),
  },
  'setup:docteur': {
    email: 'docteur1@guiss.sn',
    password: E2E_PASSWORD,
    authFile: 'e2e/.auth/docteur.json',
    tokenFile: path.resolve(__dirname, '../.auth/docteur-token.json'),
  },
  'setup:technicien': {
    email: 'technicien1@guiss.sn',
    password: E2E_PASSWORD,
    authFile: 'e2e/.auth/technicien.json',
    tokenFile: path.resolve(__dirname, '../.auth/technicien-token.json'),
  },
} as const;

setup('authenticate', async ({ page, request }) => {
  const projectName = (setup.info().project.name ??
    'setup:staff') as keyof typeof ROLES;
  const { email, password, authFile, tokenFile } =
    ROLES[projectName] ?? ROLES['setup:staff'];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

  // Obtain a raw access token via the backend API for the auth-request fixture
  // (used for direct API calls in tests, independent of the browser session).
  const loginRes = await request.post(`${apiUrl}/api/v1/auth/jwt/login/`, {
    data: { email, password },
  });
  expect(loginRes.ok()).toBeTruthy();
  const { access } = (await loginRes.json()) as {
    access: string;
    refresh: string;
    user: unknown;
  };

  fs.writeFileSync(
    tokenFile,
    JSON.stringify({ access, savedAt: Date.now() }),
    'utf-8',
  );

  // Log in through the actual UI so NextAuth creates a valid encrypted session
  // cookie — no localStorage hacks needed.
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');

  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.getByRole('button', { name: /se connecter/i }).click();

  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
    timeout: 15000,
  });
  await page.waitForLoadState('networkidle');

  await page.context().storageState({ path: authFile });
});
