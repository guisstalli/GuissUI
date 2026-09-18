import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { BanniereAntecedents } from '@/features/patients/components/banniere-antecedents';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

const rendre = () =>
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
      <BanniereAntecedents patientId={12} />
    </QueryClientProvider>,
  );

const antecedentsAbsents = () =>
  http.get(`${env.API_URL}/depistage/patients/12/antecedent/`, () =>
    HttpResponse.json({ detail: 'Non trouvé.' }, { status: 404 }),
  );

/**
 * La Pre a tranché : on ne bloque pas un dépistage de masse sur un champ
 * déclaratif. Ces tests protègent l'autre moitié de la décision — que le manque
 * reste visible, et qu'« aucun antécédent » compte comme une réponse.
 */
describe('Bannière antécédents', () => {
  test('signale un dossier dont les antécédents n’ont jamais été demandés', async () => {
    server.use(antecedentsAbsents());

    rendre();

    expect(
      await screen.findByText(
        'Les antécédents de ce patient n’ont pas été demandés.',
      ),
    ).toBeVisible();
  });

  test('disparaît dès que la question a été posée', async () => {
    server.use(
      http.get(`${env.API_URL}/depistage/patients/12/antecedent/`, () =>
        HttpResponse.json({
          id: 1,
          patient: 12,
          has_antecedents_medico_chirurgicaux: false,
          created: '2026-09-18T10:00:00Z',
          modified: '2026-09-18T10:00:00Z',
        }),
      ),
    );

    rendre();

    await waitFor(() =>
      expect(
        screen.queryByText(
          'Les antécédents de ce patient n’ont pas été demandés.',
        ),
      ).not.toBeInTheDocument(),
    );
  });

  test('« aucun antécédent » est une réponse : elle crée la ligne', async () => {
    let envoye: Record<string, unknown> | null = null;
    server.use(
      antecedentsAbsents(),
      http.post(
        `${env.API_URL}/depistage/patients/12/antecedent/edit/`,
        async ({ request }) => {
          envoye = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            id: 1,
            patient: 12,
            created: '2026-09-18T10:00:00Z',
            modified: '2026-09-18T10:00:00Z',
          });
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(await screen.findByText('Poser la question maintenant'));
    await user.click(screen.getByText('Aucun antécédent signalé'));

    await waitFor(() => expect(envoye).not.toBeNull());
    expect(envoye).toMatchObject({
      patient: 12,
      has_antecedents_medico_chirurgicaux: false,
      has_pathologie_ophtalmologique: false,
    });
  });
});
