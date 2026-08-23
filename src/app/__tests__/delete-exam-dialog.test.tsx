import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { BoutonSupprimerExamen } from '@/app/delete-exam-dialog';
import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

const role = vi.fn(() => 'DOCTEUR');

vi.mock('next-auth/react', () => ({
  // `api.delete` lit le jeton via getSession : sans lui, la mutation echoue
  // avant meme d'atteindre le reseau.
  getSession: async () => ({ accessToken: 'jeton-test' }),
  signOut: vi.fn(),
  useSession: () => ({
    data: { user: { id: 1, email: 'x@y.sn', name: 'X', role: role() } },
    status: 'authenticated',
  }),
}));

function afficher(estAdulte = true) {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <BoutonSupprimerExamen
        examenId={42}
        numeroExamen="EXA-2026-TEST"
        patientNom="Niang Adaja"
        estAdulte={estAdulte}
      />
    </QueryClientProvider>,
  );
  return user;
}

/**
 * La suppression d'un examen est DEFINITIVE : contrairement aux patients et
 * aux conducteurs, les examens n'ont pas de corbeille cote serveur. Ces tests
 * gardent les deux protections qui en decoulent — la permission et
 * l'avertissement explicite.
 */
describe("Suppression d'un examen", () => {
  test('le bouton est absent sans la permission', () => {
    role.mockReturnValue('TECHNICIEN');
    afficher();

    expect(
      screen.queryByLabelText(/Supprimer l'examen/),
    ).not.toBeInTheDocument();
  });

  test('avertit que la suppression est irreversible', async () => {
    role.mockReturnValue('DOCTEUR');
    const user = afficher();

    await user.click(screen.getByLabelText(/Supprimer l'examen/));

    expect(
      await screen.findByText('Supprimer définitivement cet examen ?'),
    ).toBeVisible();
    // Sans cette phrase, le dialogue laisserait croire a un envoi en corbeille.
    expect(screen.getByText(/ne pourront pas être restaurés/)).toBeVisible();
  });

  test("appelle l'endpoint enfant pour un examen enfant", async () => {
    role.mockReturnValue('DOCTEUR');
    let appele = '';
    server.use(
      http.delete(
        `${env.API_URL}/depistage/examens/enfants/:id/delete/`,
        ({ params }) => {
          appele = `enfant:${params.id}`;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const user = afficher(false);
    await user.click(screen.getByLabelText(/Supprimer l'examen/));
    const confirmer = await screen.findByText('Supprimer définitivement');
    // Le libelle est un noeud texte DANS le bouton : cliquer le texte seul ne
    // declenche pas toujours le handler.
    /* eslint-disable-next-line testing-library/no-node-access */
    await user.click(confirmer.closest('button') ?? confirmer);

    // Un examen enfant supprime via l'endpoint adulte renverrait 404 et
    // laisserait le dossier en place, sans que l'ecran le signale.
    await waitFor(() => expect(appele).toBe('enfant:42'));
  });
});
