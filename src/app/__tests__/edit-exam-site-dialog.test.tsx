import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { BoutonModifierSite } from '@/app/edit-exam-site-dialog';
import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'jeton-test' }),
  signOut: vi.fn(),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// Le selecteur de site interroge le referentiel : hors sujet ici.
vi.mock('@/features/sites/components/site-selector', () => ({
  SiteSelector: ({ onChange }: { onChange: (v: number) => void }) => (
    <button type="button" onClick={() => onChange(7)}>
      choisir-site-7
    </button>
  ),
}));

function afficher(estAdulte = true, siteActuelId: number | null = null) {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <BoutonModifierSite
        examenId={99}
        numeroExamen="EXA-2026-TEST"
        estAdulte={estAdulte}
        siteActuelId={siteActuelId}
        siteActuelLibelle={siteActuelId ? 'Ancien site' : null}
      />
    </QueryClientProvider>,
  );
  return user;
}

/**
 * Le site est omissible a la creation : un examen saisi sans lieu le restait
 * DEFINITIVEMENT, la colonne « Site » affichant « — » et l'examen manquant
 * dans tout agregat par site. « Voir » et « Supprimer » existaient ; se
 * rattraper, non.
 */
describe("Correction du site d'un examen", () => {
  test('signale un examen sans site et refuse un envoi vide', async () => {
    const user = afficher();

    await user.click(screen.getByLabelText(/Modifier le site/));

    expect(await screen.findByText(/n'a aucun site renseigné/)).toBeVisible();
    // Rien de choisi : l'enregistrement n'a rien a envoyer.
    expect(screen.getByText('Enregistrer').closest('button')).toBeDisabled();
  });

  test("envoie la correction sur l'endpoint adulte", async () => {
    let recu: unknown = null;
    server.use(
      http.patch(
        `${env.API_URL}/depistage/examens/adultes/:id/site/`,
        async ({ request, params }) => {
          recu = { id: params.id, corps: await request.json() };
          return HttpResponse.json({ id: 99 });
        },
      ),
    );

    const user = afficher();
    await user.click(screen.getByLabelText(/Modifier le site/));
    await user.click(await screen.findByText('choisir-site-7'));
    await user.click(screen.getByText('Enregistrer').closest('button')!);

    await waitFor(() =>
      expect(recu).toEqual({ id: '99', corps: { site_id: 7 } }),
    );
  });

  test("utilise l'endpoint enfant pour un examen enfant", async () => {
    let appele = '';
    server.use(
      http.patch(`${env.API_URL}/depistage/examens/enfants/:id/site/`, () => {
        appele = 'enfant';
        return HttpResponse.json({ id: 99 });
      }),
    );

    const user = afficher(false);
    await user.click(screen.getByLabelText(/Modifier le site/));
    await user.click(await screen.findByText('choisir-site-7'));
    await user.click(screen.getByText('Enregistrer').closest('button')!);

    // Un examen enfant corrige via l'endpoint adulte renverrait 404 et
    // laisserait le site inchange, sans que l'ecran le signale.
    await waitFor(() => expect(appele).toBe('enfant'));
  });
});
