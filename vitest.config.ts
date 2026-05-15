/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  plugins: [react(), viteTsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setup-tests.ts',
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:8000',
      NEXT_PUBLIC_ENABLE_API_MOCKING: 'false',
      NEXT_PUBLIC_URL: 'http://localhost:3000',
    },
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      include: ['src/**'],
    },
  },
});
