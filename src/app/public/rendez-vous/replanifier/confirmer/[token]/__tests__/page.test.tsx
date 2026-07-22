import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import ConfirmerReplanificationPage from '../page';

// La page lit le token via useParams — mock complet de next/navigation.
vi.mock('next/navigation', async () => {
  const actual =
    await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useParams: () => ({ token: 'reschedule-token-xyz' }),
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () =>
      '/rendez-vous/replanifier/confirmer/reschedule-token-xyz',
    useSearchParams: () => ({ get: vi.fn() }),
  };
});

const CONFIRM_URL = `${env.API_URL}/rendez-vous/replanifier/confirmer/reschedule-token-xyz/`;

const RDV = {
  id: 1,
  numero_rdv: 'RDV-2024-009',
  date: '2024-07-15',
  heure_debut: '11:00',
  heure_fin: '11:30',
  patient_nom: 'Diallo',
  patient_prenom: 'Aminata',
  statut: 'en_attente',
  reschedule_count: 1,
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function setupPage() {
  return rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <ConfirmerReplanificationPage />
    </QueryClientProvider>,
  );
}

describe('ConfirmerReplanificationPage — confirmation publique (H10)', () => {
  test('ne confirme RIEN au chargement — un POST est requis via le bouton', async () => {
    // Arrange — compte les POST reçus par le backend
    let postCount = 0;
    server.use(
      http.post(CONFIRM_URL, () => {
        postCount += 1;
        return HttpResponse.json(RDV);
      }),
    );

    // Act — le simple rendu (équivalent au chargement de la page)
    setupPage();

    // Assert — état initial, aucun appel mutant déclenché
    expect(
      await screen.findByRole('button', {
        name: /confirmer le nouveau créneau/i,
      }),
    ).toBeInTheDocument();
    expect(postCount).toBe(0);

    // Act — le patient confirme explicitement
    await userEvent.click(
      screen.getByRole('button', { name: /confirmer le nouveau créneau/i }),
    );

    // Assert — le POST part et le nouveau créneau s'affiche
    expect(
      await screen.findByText(/nouveau créneau confirmé/i),
    ).toBeInTheDocument();
    expect(screen.getByText('RDV-2024-009')).toBeInTheDocument();
    expect(postCount).toBe(1);
  });

  test('affiche une erreur claire quand le lien est invalide/expiré (400)', async () => {
    // Arrange
    server.use(
      http.post(CONFIRM_URL, () =>
        HttpResponse.json(
          { message: 'Ce lien de confirmation a déjà été utilisé.' },
          { status: 400 },
        ),
      ),
    );

    // Act
    setupPage();
    await userEvent.click(
      await screen.findByRole('button', {
        name: /confirmer le nouveau créneau/i,
      }),
    );

    // Assert
    expect(
      await screen.findByText(/lien invalide ou expiré/i),
    ).toBeInTheDocument();
  });
});
