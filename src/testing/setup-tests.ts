import '@testing-library/jest-dom/vitest';

import { initializeDb, resetDb } from '@/testing/mocks/db';
import { server } from '@/testing/mocks/server';

vi.mock('zustand');

// Polyfills requis par les composants Radix UI (Select, Switch) dans jsdom
if (typeof window !== 'undefined') {
  // Radix UI Select requires hasPointerCapture / releasePointerCapture
  if (!window.Element.prototype.hasPointerCapture) {
    window.Element.prototype.hasPointerCapture = () => false;
  }
  if (!window.Element.prototype.setPointerCapture) {
    window.Element.prototype.setPointerCapture = () => undefined;
  }
  if (!window.Element.prototype.releasePointerCapture) {
    window.Element.prototype.releasePointerCapture = () => undefined;
  }
  // scrollIntoView n'est pas implémenté dans jsdom
  if (!window.Element.prototype.scrollIntoView) {
    window.Element.prototype.scrollIntoView = () => undefined;
  }
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  vi.mock('next/navigation', async () => {
    const actual = await vi.importActual('next/navigation');
    return {
      ...actual,
      useRouter: () => {
        return {
          push: vi.fn(),
          replace: vi.fn(),
        };
      },
      usePathname: () => '/app',
      useSearchParams: () => ({
        get: vi.fn(),
      }),
    };
  });
});
afterAll(() => server.close());
beforeEach(() => {
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  window.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
  window.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

  initializeDb();
});
afterEach(() => {
  server.resetHandlers();
  resetDb();
});
