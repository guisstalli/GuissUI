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

  // `NEXT_PUBLIC_API_URL` inclut DÉJÀ `/api/v1` partout ailleurs (.env.example,
  // .env.local, secrets CI) — `auth-options.ts` compose `${API_URL}/auth/...`.
  // Ce fichier ajoutait le préfixe lui-même, ce qui le faisait fonctionner
  // avec une variable mal formée et MASQUAIT le problème : NextAuth, lui,
  // postait sur `/auth/jwt/login/` et récoltait un 404, d'où l'absence de
  // redirection et le timeout de `waitForURL` plus bas.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

  // Obtain a raw access token via the backend API for the auth-request fixture
  // (used for direct API calls in tests, independent of the browser session).
  const loginRes = await request.post(`${apiUrl}/auth/jwt/login/`, {
    data: { email, password },
  });
  expect(loginRes.ok()).toBeTruthy();
  const { access } = (await loginRes.json()) as {
    access: string;
    refresh: string;
    user: unknown;
  };

  // `e2e/.auth/` est dans .gitignore : il existe sur un poste de développeur,
  // JAMAIS sur un checkout CI neuf. Or `fs.writeFileSync` ne crée pas le
  // répertoire parent — d'où un ENOENT qui faisait échouer l'authentification,
  // et avec elle les 45 tests qui en dépendent. (Playwright, lui, crée les
  // répertoires pour `storageState` plus bas : d'où l'asymétrie trompeuse.)
  fs.mkdirSync(path.dirname(tokenFile), { recursive: true });

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
