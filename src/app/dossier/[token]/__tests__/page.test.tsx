import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen } from '@/testing/test-utils';

import DossierPartagePage from '../page';

// La page lit le token via useParams — on fournit un mock complet de
// next/navigation (le mock global de setup-tests n'expose pas useParams).
vi.mock('next/navigation', async () => {
  const actual =
    await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useParams: () => ({ token: 'shared-token-123' }),
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/dossier/shared-token-123',
    useSearchParams: () => ({ get: vi.fn() }),
  };
});

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function setupPage() {
  return rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <DossierPartagePage />
    </QueryClientProvider>,
  );
}

const SHARE_URL = `${env.API_URL}/share/shared-token-123/`;

describe('DossierPartagePage — accès public au dossier', () => {
  beforeEach(() => {
    // jsdom n'implémente pas les URL objets.
    URL.createObjectURL = vi.fn(() => 'blob:mock-dossier');
    URL.revokeObjectURL = vi.fn();
  });

  test('affiche le dossier et un lien de téléchargement quand le token est valide', async () => {
    // Arrange
    server.use(
      http.get(SHARE_URL, () => {
        const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
        return new HttpResponse(pdf.buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="dossier-EX-1.pdf"',
          },
        });
      }),
    );

    // Act
    setupPage();

    // Assert
    const link = await screen.findByRole('link', {
      name: /télécharger le pdf/i,
    });
    expect(link).toHaveAttribute('href', 'blob:mock-dossier');
    expect(link).toHaveAttribute('download', 'dossier-EX-1.pdf');
    expect(screen.getByText('dossier-EX-1.pdf')).toBeInTheDocument();
  });

  test('affiche un message clair quand le lien a expiré (410)', async () => {
    // Arrange
    server.use(
      http.get(SHARE_URL, () =>
        HttpResponse.json(
          { detail: "Ce lien de partage a expiré ou n'est plus valide." },
          { status: 410 },
        ),
      ),
    );

    // Act
    setupPage();

    // Assert
    expect(await screen.findByText('Dossier indisponible')).toBeInTheDocument();
    expect(
      screen.getByText(/ce lien de partage a expiré/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /télécharger le pdf/i }),
    ).not.toBeInTheDocument();
  });
});
