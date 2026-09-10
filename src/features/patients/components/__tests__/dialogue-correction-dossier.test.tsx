import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';
import {
  BoutonCorrigerNaissance,
  BoutonRetirerStatutConducteur,
} from '@/features/patients/components/dialogue-correction-dossier';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

const rendre = (ui: React.ReactElement) =>
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
      {ui}
    </QueryClientProvider>,
  );

/**
 * L'import du 26/06/2026 a repris six conducteurs dont la date de naissance
 * en fait des enfants de 0 à 7 ans, avec permis et examens adultes. Aucun
 * écran ne permettait de les réparer : c'est ce que ces dialogues ajoutent.
 */
describe('Correction de la date de naissance', () => {
  test('envoie la nouvelle date et le motif', async () => {
    let recu: unknown = null;
    server.use(
      http.post(
        `${env.API_URL}/depistage/patients/1627/corriger-naissance/`,
        async ({ request }) => {
          recu = await request.json();
          return HttpResponse.json({
            id: 1627,
            date_de_naissance: '1979-03-13',
            is_adult: true,
          });
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre(
      <BoutonCorrigerNaissance patientId={1627} dateActuelle="2019-03-13" />,
    );

    await user.click(
      screen.getByRole('button', { name: /Corriger la date de naissance/ }),
    );
    const champ = await screen.findByLabelText(/Nouvelle date/);
    await user.clear(champ);
    await user.type(champ, '1979-03-13');
    await user.type(screen.getByLabelText(/Motif/), 'Date lue sur le permis');
    await user.click(screen.getByRole('button', { name: 'Corriger' }));

    await waitFor(() =>
      expect(recu).toEqual({
        date_de_naissance: '1979-03-13',
        motif: 'Date lue sur le permis',
      }),
    );
  });

  test('le serveur refuse et le motif du refus est affiché', async () => {
    server.use(
      http.post(
        `${env.API_URL}/depistage/patients/1627/corriger-naissance/`,
        () =>
          HttpResponse.json(
            {
              detail:
                'Cette date ferait de ce patient un mineur de 7 ans, alors ' +
                'qu’il détient le permis 10132936.',
            },
            { status: 409 },
          ),
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre(
      <BoutonCorrigerNaissance patientId={1627} dateActuelle="1979-03-13" />,
    );

    await user.click(
      screen.getByRole('button', { name: /Corriger la date de naissance/ }),
    );
    const champ = await screen.findByLabelText(/Nouvelle date/);
    await user.clear(champ);
    await user.type(champ, '2019-03-13');
    await user.click(screen.getByRole('button', { name: 'Corriger' }));

    // Un « erreur » générique ferait recommencer l'opérateur sans qu'il
    // comprenne ce que le serveur lui reproche. Le message est porté par la
    // pile de notifications globale, montée hors de ce composant.
    await waitFor(() =>
      expect(
        useNotifications
          .getState()
          .notifications.some((n) =>
            n.message?.includes('détient le permis 10132936'),
          ),
      ).toBe(true),
    );
  });
});

describe('Retrait du statut conducteur', () => {
  test('annonce que le patient et ses examens sont conservés', async () => {
    server.use(
      http.post(
        `${env.API_URL}/depistage/patients/42/retirer-statut-conducteur/`,
        () =>
          HttpResponse.json({
            id: 42,
            date_de_naissance: '1985-05-05',
            is_adult: true,
          }),
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre(<BoutonRetirerStatutConducteur patientId={42} />);

    await user.click(
      screen.getByRole('button', { name: /Retirer le statut conducteur/ }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Retirer le statut' }),
    );

    await waitFor(() =>
      expect(
        useNotifications
          .getState()
          .notifications.some((n) =>
            n.message?.includes('Le patient et ses examens sont conservés'),
          ),
      ).toBe(true),
    );
  });
});
