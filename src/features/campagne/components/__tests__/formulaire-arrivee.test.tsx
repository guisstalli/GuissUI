import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { FormulaireArrivee } from '@/features/campagne/components/formulaire-arrivee';
import type { Campagne } from '@/features/campagne/types/types';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

const CAMPAGNE: Campagne = {
  siteId: 7,
  eventId: null,
  libelle: 'Gare Routière de Thiès',
};

const rendre = (campagne: Campagne = CAMPAGNE) =>
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <FormulaireArrivee campagne={campagne} />
    </QueryClientProvider>,
  );

const saisirUnePersonne = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Nom'), 'Diallo');
  await user.type(screen.getByLabelText('Prénom'), 'Fatou');
  await user.type(screen.getByLabelText('Date de naissance'), '1990-04-12');
};

/**
 * Le formulaire de terrain. Deux garde-fous s'y jouent : le lieu n'est jamais
 * saisi (il vient de la campagne), et une personne déjà passée le jour même
 * ne repart pas avec un second examen — c'est ce qui a dispersé les mesures du
 * 23/08/2026.
 */
describe('Formulaire d’arrivée', () => {
  test('le lieu de la campagne part avec l’enregistrement, sans être saisi', async () => {
    let recu: Record<string, unknown> | null = null;
    server.use(
      http.get(`${env.API_URL}/depistage/campagne/deja-vu/`, () =>
        HttpResponse.json([]),
      ),
      http.post(
        `${env.API_URL}/depistage/campagne/enregistrer/`,
        async ({ request }) => {
          recu = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            {
              patient_id: 1,
              examen_id: 2,
              numero_examen: 'EXA-0002',
              type_examen: 'adulte',
              site_id: 7,
            },
            { status: 201 },
          );
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await saisirUnePersonne(user);
    await user.click(screen.getByText('Enregistrer et ouvrir l’examen'));

    await waitFor(() => expect(recu?.site_id).toBe(7));
    // Aucun champ « site » ni « type d'examen » : ce sont précisément les deux
    // qui se remplissaient mal.
    expect(screen.queryByLabelText(/site/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/type d’examen/i)).not.toBeInTheDocument();
  });

  test('une personne déjà vue aujourd’hui renvoie vers son examen ouvert', async () => {
    server.use(
      http.get(`${env.API_URL}/depistage/campagne/deja-vu/`, () =>
        HttpResponse.json([]),
      ),
      http.post(`${env.API_URL}/depistage/campagne/enregistrer/`, () =>
        HttpResponse.json(
          {
            detail: 'Un examen existe déjà pour ce patient aujourd’hui.',
            examen_existant_id: 42,
            numero_examen: 'EXC-0042',
            type_examen: 'enfant',
          },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await saisirUnePersonne(user);
    await user.click(screen.getByText('Enregistrer et ouvrir l’examen'));

    const lien = await screen.findByText('Ouvrir l’examen en cours');
    // Le formulaire enfant, pas l'adulte : ses mesures ne se saisissent pas
    // au même endroit.
    expect(lien.closest('a')).toHaveAttribute('href', '/exams/child/42');
  });

  test('sans campagne ouverte, on ne peut pas enregistrer', () => {
    server.use(
      http.get(`${env.API_URL}/depistage/campagne/deja-vu/`, () =>
        HttpResponse.json([]),
      ),
    );

    rendre({ siteId: null, eventId: null, libelle: '' });

    expect(
      screen.getByText('Enregistrer et ouvrir l’examen').closest('button'),
    ).toBeDisabled();
  });
});
