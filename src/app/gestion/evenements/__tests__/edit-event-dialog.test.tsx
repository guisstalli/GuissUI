import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { EditEventDialog } from '@/app/gestion/evenements/edit-event-dialog';
import { EventActions } from '@/app/gestion/evenements/event-actions-menu';
import { env } from '@/config/env';
import type { EventStaff } from '@/features/events/types/schemas';
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

const SITES = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 7, libelle: 'Mairie Thiès Nord', code: 'MTN', is_active: true },
    { id: 8, libelle: 'CLAIRE AMITIÉ', code: 'CA', is_active: true },
  ],
};

const evenement = (partiel: Partial<EventStaff> = {}): EventStaff => ({
  ...mockStaffEvents[0],
  statut: 'planifie',
  titre: 'Dépistage Thiès',
  date_event: '2030-06-03',
  date_fin: null,
  heure_debut: '08:00:00',
  heure_fin: '17:00:00',
  lieu: 'Mairie',
  type_examen: 'adulte',
  site_id: 7,
  site_nom: 'Mairie Thiès Nord',
  ...partiel,
});

const client = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

/**
 * Le service de modification existait côté serveur, mais aucun écran ne
 * l'appelait : une erreur de date ou de site ne se corrigeait qu'en supprimant
 * l'événement, avec ses inscrits.
 */
describe('Modifier un événement', () => {
  test('la fenêtre reprend l’événement tel qu’il est', async () => {
    server.use(
      http.get(`${env.API_URL}/depistage/sites/`, () =>
        HttpResponse.json(SITES),
      ),
    );

    rtlRender(
      <QueryClientProvider client={client()}>
        <EditEventDialog
          event={evenement()}
          ouvert
          onOuvertChange={() => undefined}
        />
      </QueryClientProvider>,
    );

    expect(await screen.findByDisplayValue('Dépistage Thiès')).toBeVisible();
    // HH:MM:SS servi par l'API, HH:MM attendu par le champ `time`.
    expect(screen.getByDisplayValue('08:00')).toBeVisible();
    expect(screen.getByDisplayValue('Mairie')).toBeVisible();
  });

  test('enregistrer envoie la modification, site compris', async () => {
    let recu: Record<string, unknown> | null = null;
    server.use(
      http.get(`${env.API_URL}/depistage/sites/`, () =>
        HttpResponse.json(SITES),
      ),
      http.put(
        `${env.API_URL}/events/${evenement().id}/modifier/`,
        async ({ request }) => {
          recu = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...evenement(), titre: 'Nouveau titre' });
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rtlRender(
      <QueryClientProvider client={client()}>
        <EditEventDialog
          event={evenement()}
          ouvert
          onOuvertChange={() => undefined}
        />
      </QueryClientProvider>,
    );

    const titre = await screen.findByDisplayValue('Dépistage Thiès');
    await user.clear(titre);
    await user.type(titre, 'Nouveau titre');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(recu).not.toBeNull());
    expect(recu).toMatchObject({
      titre: 'Nouveau titre',
      site_id: 7,
      heure_debut: '08:00',
      date_fin: null,
    });
  });

  test('un événement créé sans site oblige à en choisir un', async () => {
    let envoye = false;
    server.use(
      http.get(`${env.API_URL}/depistage/sites/`, () =>
        HttpResponse.json(SITES),
      ),
      http.put(`${env.API_URL}/events/${evenement().id}/modifier/`, () => {
        envoye = true;
        return HttpResponse.json(evenement());
      }),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rtlRender(
      <QueryClientProvider client={client()}>
        <EditEventDialog
          event={evenement({ site_id: null, site_nom: null })}
          ouvert
          onOuvertChange={() => undefined}
        />
      </QueryClientProvider>,
    );

    await screen.findByDisplayValue('Dépistage Thiès');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(
      await screen.findByText('Choisissez le site où se déroule l’événement.'),
    ).toBeVisible();
    expect(envoye).toBe(false);
  });
});

describe('Entrée « Modifier » du menu', () => {
  const ouvrirLeMenu = async (event: EventStaff) => {
    const queryClient = client();
    queryClient.setQueryData(['my-capabilities'], {
      capabilities: [],
      is_superuser: false,
    });
    rtlRender(
      <QueryClientProvider client={queryClient}>
        <EventActions event={event} />
      </QueryClientProvider>,
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await user.click(screen.getByRole('button', { name: /Autres actions/ }));
    await screen.findByText('Page publique');
  };

  test('proposée pour un événement planifié', async () => {
    await ouvrirLeMenu(evenement({ statut: 'planifie' }));

    expect(screen.getByText('Modifier')).toBeVisible();
  });

  test('absente une fois le dépistage commencé', async () => {
    await ouvrirLeMenu(evenement({ statut: 'en_cours' }));

    expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
  });
});
