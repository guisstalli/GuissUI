import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { CreateExamDialog } from '@/app/create-exam-dialog';
import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/conducteurs',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'jeton-test' }),
  signOut: vi.fn(),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// Le sélecteur de site interroge le référentiel : hors sujet ici.
vi.mock('@/features/sites/components/site-selector', () => ({
  SiteSelector: ({ onChange }: { onChange: (v: number) => void }) => (
    <button type="button" onClick={() => onChange(7)}>
      choisir-site-7
    </button>
  ),
}));

function afficherAvecRetour(onCreated: (exam: { id: number }) => void) {
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <CreateExamDialog
        open
        onOpenChange={() => {}}
        patientId={2}
        patientFullName="Oumar Ndiaye"
        isAdult
        onCreated={onCreated}
      />
    </QueryClientProvider>,
  );
}

function afficher() {
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <CreateExamDialog
        open
        onOpenChange={() => {}}
        patientId={2}
        patientFullName="Oumar Ndiaye"
        isAdult
      />
    </QueryClientProvider>,
  );
}

/**
 * Garde-fou de la regle « un examen a toujours un lieu ».
 *
 * La liste des conducteurs creait l'examen directement depuis son menu : il
 * naissait SANS site et la colonne « Site » restait vide a vie, alors que le
 * serveur accepte `site_id`. Elle passe desormais par ce dialogue, seul
 * endroit ou la regle est ecrite — d'ou ce test.
 */
describe('CreateExamDialog', () => {
  test('demande le site et refuse de creer tant qu il manque', () => {
    afficher();

    expect(screen.getByText('Créer un nouvel examen')).toBeVisible();
    expect(screen.getByText('Site de dépistage')).toBeVisible();

    const creer = screen
      .getAllByText('Créer')
      .map((n) => n.closest('button'))
      .find(Boolean);

    expect(creer).toBeDisabled();
  });
});

/**
 * Le garde-fou refuse un second examen le meme jour — c'est son absence qui a
 * produit 114 examens pour 82 patients le 23/08/2026. Mais un refus sans issue
 * pousse à contourner : l'écran doit proposer la bonne action.
 */
describe('Examen déjà ouvert le même jour', () => {
  test('propose de REPRENDRE au lieu d’afficher une erreur', async () => {
    server.use(
      http.post(`${env.API_URL}/depistage/examens/adultes/create/`, () =>
        HttpResponse.json(
          {
            detail: "Un examen existe déjà pour ce patient aujourd'hui.",
            examen_existant_id: 2596,
            numero_examen: 'EXA-2026-4CC6CAEA',
          },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    afficher();
    await user.click(screen.getByText('choisir-site-7'));
    await user.click(screen.getByText('Créer').closest('button')!);

    expect(
      await screen.findByText(/Un examen est déjà ouvert pour ce patient/),
    ).toBeVisible();
    expect(
      screen.getByText('EXA-2026-4CC6CAEA', { exact: false }),
    ).toBeVisible();
    expect(screen.getByText('Reprendre l’examen en cours')).toBeVisible();
  });

  test('reprendre ouvre l’examen existant', async () => {
    server.use(
      http.post(`${env.API_URL}/depistage/examens/adultes/create/`, () =>
        HttpResponse.json({ examen_existant_id: 2596 }, { status: 409 }),
      ),
    );
    const ouvrir = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    afficherAvecRetour(ouvrir);
    await user.click(screen.getByText('choisir-site-7'));
    await user.click(screen.getByText('Créer').closest('button')!);
    await user.click(await screen.findByText('Reprendre l’examen en cours'));

    await waitFor(() => expect(ouvrir).toHaveBeenCalledWith({ id: 2596 }));
  });

  test('une erreur NON-409 previent quand meme l utilisateur', async () => {
    server.use(
      http.post(`${env.API_URL}/depistage/examens/adultes/create/`, () =>
        HttpResponse.json({ detail: 'Panne serveur' }, { status: 500 }),
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    afficher();
    await user.click(screen.getByText('choisir-site-7'));
    await user.click(screen.getByText('Créer').closest('button')!);

    // Le composant <Notifications /> vit dans AppProvider, absent ici : on
    // interroge donc le magasin. Fournir `onError` ECRASE celui de la
    // mutation, qui portait la notification d'échec — sans rappel explicite,
    // une panne réseau ou un 500 ne disaient plus rien à l'utilisateur.
    await waitFor(() =>
      expect(
        useNotifications
          .getState()
          .notifications.some(
            (n) => n.message === "Impossible de créer l'examen.",
          ),
      ).toBe(true),
    );
  });
});
