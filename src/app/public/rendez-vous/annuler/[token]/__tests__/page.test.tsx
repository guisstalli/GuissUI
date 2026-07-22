import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import AnnulerRendezVousPage from '../page';

vi.mock('next/navigation', async () => {
  const actual =
    await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useParams: () => ({ token: 'cancel-token-abc' }),
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/rendez-vous/annuler/cancel-token-abc',
    useSearchParams: () => ({ get: vi.fn() }),
  };
});

const CANCEL_URL = `${env.API_URL}/rendez-vous/annuler/cancel-token-abc/`;

function setupPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return rtlRender(
    <QueryClientProvider client={client}>
      <AnnulerRendezVousPage />
    </QueryClientProvider>,
  );
}

describe('AnnulerRendezVousPage — annulation publique', () => {
  test('ne supprime RIEN au chargement — un DELETE est requis via le bouton', async () => {
    // Arrange — compte les DELETE reçus
    let deleteCount = 0;
    server.use(
      http.delete(CANCEL_URL, () => {
        deleteCount += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    // Act
    setupPage();

    // Assert — état initial, aucune mutation
    const btn = await screen.findByRole('button', {
      name: /confirmer l'annulation/i,
    });
    expect(deleteCount).toBe(0);

    // Act — confirmation explicite
    await userEvent.click(btn);

    // Assert
    expect(await screen.findByText(/rendez-vous annulé/i)).toBeInTheDocument();
    expect(deleteCount).toBe(1);
  });

  test('affiche une erreur quand le lien est invalide (400)', async () => {
    server.use(
      http.delete(CANCEL_URL, () =>
        HttpResponse.json(
          { detail: "Ce lien d'annulation n'est plus valide." },
          { status: 400 },
        ),
      ),
    );

    setupPage();
    await userEvent.click(
      await screen.findByRole('button', { name: /confirmer l'annulation/i }),
    );

    // L'annulation n'a PAS abouti : pas de succès, message d'erreur visible.
    expect(await screen.findByText(/n'est plus valide/i)).toBeInTheDocument();
    expect(screen.queryByText(/rendez-vous annulé/i)).not.toBeInTheDocument();
  });
});
