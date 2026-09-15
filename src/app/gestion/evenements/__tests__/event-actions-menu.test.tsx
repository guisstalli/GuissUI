import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { EventActions } from '@/app/gestion/evenements/event-actions-menu';
import { env } from '@/config/env';
import type { EventStaff } from '@/features/events/types/schemas';
import type { MyCapabilities } from '@/lib/capabilities';
import { mockStaffEvents } from '@/testing/mocks/handlers/events';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

const evenement = (statut: EventStaff['statut']): EventStaff => ({
  ...mockStaffEvents[0],
  statut,
});

/**
 * Le cache des capacités est prérempli : sans ça, l'absence du bouton pourrait
 * venir d'une requête pas encore revenue, et le test passerait pour une
 * mauvaise raison.
 */
function rendre(
  event: EventStaff,
  { capabilities = [], is_superuser = false }: Partial<MyCapabilities> = {},
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  client.setQueryData<MyCapabilities>(['my-capabilities'], {
    capabilities,
    is_superuser,
  });
  rtlRender(
    <QueryClientProvider client={client}>
      <EventActions event={event} />
    </QueryClientProvider>,
  );
}

async function ouvrirLeMenu() {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  await user.click(screen.getByRole('button', { name: /Autres actions/ }));
  // Le menu est bien ouvert : l'absence d'une entrée ne vient pas d'un menu fermé.
  await screen.findByText('Page publique');
  return user;
}

/**
 * Le 14/09/2026, l'événement « Mairie Thiès Nord » a été annulé par erreur, et
 * rien dans l'interface ne permettait de revenir en arrière : il a fallu
 * corriger en base de production.
 */
describe('Rétablir un événement annulé', () => {
  test('un administrateur rétablit un événement annulé', async () => {
    let retabli: string | undefined;
    server.use(
      http.patch(`${env.API_URL}/events/:id/retablir/`, ({ params }) => {
        retabli = String(params.id);
        return HttpResponse.json({ ...evenement('planifie') });
      }),
    );
    rendre(evenement('annule'), { capabilities: ['config.manage'] });

    const user = await ouvrirLeMenu();
    await user.click(screen.getByText(/Rétablir l.événement/));

    await waitFor(() => expect(retabli).toBe(String(mockStaffEvents[0].id)));
  });

  test('le staff ne voit pas le bouton — le serveur le refuserait', async () => {
    rendre(evenement('annule'), { capabilities: ['events.manage'] });

    await ouvrirLeMenu();

    expect(screen.queryByText(/Rétablir l.événement/)).not.toBeInTheDocument();
  });

  test('un super-utilisateur voit le bouton sans capacité explicite', async () => {
    rendre(evenement('annule'), { is_superuser: true });

    await ouvrirLeMenu();

    expect(screen.getByText(/Rétablir l.événement/)).toBeInTheDocument();
  });

  test('un événement planifié ne propose pas le rétablissement, mais l’annulation', async () => {
    rendre(evenement('planifie'), { capabilities: ['config.manage'] });

    await ouvrirLeMenu();

    expect(screen.queryByText(/Rétablir l.événement/)).not.toBeInTheDocument();
    expect(screen.getByText(/Annuler l.événement/)).toBeInTheDocument();
  });

  test('un événement annulé ne propose plus de l’annuler', async () => {
    rendre(evenement('annule'), { capabilities: ['config.manage'] });

    await ouvrirLeMenu();

    expect(screen.queryByText(/Annuler l.événement/)).not.toBeInTheDocument();
  });
});
