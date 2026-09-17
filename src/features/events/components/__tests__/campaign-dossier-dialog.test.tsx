import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import type { EventStaff } from '@/features/events/types/schemas';
import { mockStaffEvents } from '@/testing/mocks/handlers/events';
import { server } from '@/testing/mocks/server';
import {
  rtlRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@/testing/test-utils';

import { CampaignDossierDialog } from '../campaign-dossier-dialog';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return { ...actual, getSession: vi.fn().mockResolvedValue(null) };
});

/**
 * Sans ce dossier, le rapport d'activité d'une campagne reste générique : la
 * justification, les objectifs, la méthodologie et l'équipe ne se déduisent
 * d'aucun examen, et le module IA a interdiction d'inventer.
 */
const evenement = (overrides: Partial<EventStaff> = {}): EventStaff => ({
  ...mockStaffEvents[0],
  ...overrides,
});

function rendre(event: EventStaff) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  rtlRender(
    <QueryClientProvider client={client}>
      <CampaignDossierDialog event={event} ouvert onOuvertChange={() => {}} />
    </QueryClientProvider>,
  );
}

describe('Dossier de campagne', () => {
  test('le dossier saisi est envoyé au serveur', async () => {
    let envoye: Record<string, unknown> | undefined;
    server.use(
      http.patch(`${env.API_URL}/events/:id/dossier/`, async ({ request }) => {
        envoye = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(evenement());
      }),
    );
    rendre(evenement());
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText('Projet de recherche'),
      'Champ visuel et sécurité routière',
    );
    await user.click(
      screen.getByRole('button', { name: /Enregistrer le dossier/ }),
    );

    await waitFor(() =>
      expect(envoye?.projet).toBe('Champ visuel et sécurité routière'),
    );
  });

  test('un objectif spécifique peut être ajouté puis retiré', async () => {
    rendre(evenement());
    const user = userEvent.setup();

    const groupe = screen.getByRole('group', { name: /Objectifs spécifiques/ });
    await user.click(within(groupe).getByRole('button', { name: /Ajouter/ }));
    expect(
      screen.getByLabelText('Objectifs spécifiques 1'),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Retirer objectifs spécifiques 1/i }),
    );
    expect(
      screen.queryByLabelText('Objectifs spécifiques 1'),
    ).not.toBeInTheDocument();
  });

  test('un membre d’équipe sans nom n’est pas envoyé — le serveur le refuserait', async () => {
    let envoye: Record<string, unknown> | undefined;
    server.use(
      http.patch(`${env.API_URL}/events/:id/dossier/`, async ({ request }) => {
        envoye = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(evenement());
      }),
    );
    rendre(evenement());
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Ajouter un membre/ }));
    await user.type(
      screen.getByLabelText('Rôle du membre 1'),
      'ophtalmologiste',
    );
    await user.click(
      screen.getByRole('button', { name: /Enregistrer le dossier/ }),
    );

    await waitFor(() => expect(envoye).toBeDefined());
    expect(envoye?.equipe).toEqual([]);
  });

  test('le dossier existant pré-remplit le formulaire', () => {
    rendre(
      evenement({
        projet: 'Projet en cours',
        equipe: [{ nom: 'Pr Wane', role: 'chercheuse principale' }],
      } as Partial<EventStaff>),
    );

    expect(screen.getByLabelText('Projet de recherche')).toHaveValue(
      'Projet en cours',
    );
    expect(screen.getByLabelText('Nom du membre 1')).toHaveValue('Pr Wane');
  });
});
