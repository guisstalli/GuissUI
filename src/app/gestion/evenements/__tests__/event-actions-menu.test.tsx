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

/**
 * Le 16/09/2026, « Mairie Thiès Nord », prévu le lendemain, a été clôturé : ses
 * 29 inscrits ont été marqués absents, et la clôture était irréversible depuis
 * l'interface.
 */
describe('Rouvrir un événement terminé', () => {
  test('un administrateur rouvre un événement terminé', async () => {
    let rouvert: string | undefined;
    server.use(
      http.patch(`${env.API_URL}/events/:id/rouvrir/`, ({ params }) => {
        rouvert = String(params.id);
        return HttpResponse.json({
          ...evenement('planifie'),
          inscriptions_remises: 29,
        });
      }),
    );
    rendre(evenement('termine'), { capabilities: ['config.manage'] });

    const user = await ouvrirLeMenu();
    await user.click(screen.getByText(/Rouvrir l.événement/));

    await waitFor(() => expect(rouvert).toBe(String(mockStaffEvents[0].id)));
  });

  test('le staff ne voit pas la réouverture — le serveur la refuserait', async () => {
    rendre(evenement('termine'), { capabilities: ['events.manage'] });

    await ouvrirLeMenu();

    expect(screen.queryByText(/Rouvrir l.événement/)).not.toBeInTheDocument();
  });

  test('un événement en cours ne propose pas la réouverture', async () => {
    rendre(evenement('en_cours'), { capabilities: ['config.manage'] });

    await ouvrirLeMenu();

    expect(screen.queryByText(/Rouvrir l.événement/)).not.toBeInTheDocument();
  });
});

describe('Clôturer un événement', () => {
  test('demande confirmation avant de marquer les inscrits absents', async () => {
    let cloture = false;
    server.use(
      http.patch(`${env.API_URL}/events/:id/terminer/`, () => {
        cloture = true;
        return HttpResponse.json({ ...evenement('termine') });
      }),
    );
    rendre(evenement('en_cours'));
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    await user.click(screen.getByRole('button', { name: /^Clôturer$/ }));

    expect(await screen.findByText(/marqués absents/)).toBeInTheDocument();
    expect(cloture).toBe(false);

    await user.click(
      screen.getByRole('button', { name: /Clôturer l.événement/ }),
    );

    await waitFor(() => expect(cloture).toBe(true));
  });
});

describe('Annuler un événement', () => {
  test('demande confirmation : le 14/09/2026, un clic dans le menu en a annulé un par erreur', async () => {
    let annule = false;
    server.use(
      http.patch(`${env.API_URL}/events/:id/annuler/`, () => {
        annule = true;
        return HttpResponse.json({ ...evenement('annule') });
      }),
    );
    rendre(evenement('planifie'));
    const user = await ouvrirLeMenu();

    await user.click(screen.getByText(/Annuler l.événement/));

    expect(
      await screen.findByText(/Les inscrits seront prévenus/),
    ).toBeInTheDocument();
    expect(annule).toBe(false);

    await user.click(
      screen.getByRole('button', { name: /Oui, annuler l.événement/ }),
    );

    await waitFor(() => expect(annule).toBe(true));
  });

  test("renoncer ne touche pas à l'événement", async () => {
    let annule = false;
    server.use(
      http.patch(`${env.API_URL}/events/:id/annuler/`, () => {
        annule = true;
        return HttpResponse.json({ ...evenement('annule') });
      }),
    );
    rendre(evenement('planifie'));
    const user = await ouvrirLeMenu();

    await user.click(screen.getByText(/Annuler l.événement/));
    await user.click(
      await screen.findByRole('button', { name: /Garder l.événement/ }),
    );

    await waitFor(() =>
      expect(
        screen.queryByText(/Les inscrits seront prévenus/),
      ).not.toBeInTheDocument(),
    );
    expect(annule).toBe(false);
  });
});
