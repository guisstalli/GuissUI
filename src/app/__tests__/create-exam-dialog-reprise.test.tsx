import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { CreateExamDialog } from '@/app/create-exam-dialog';
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

vi.mock('@/features/sites/components/site-selector', () => ({
  SiteSelector: ({ onChange }: { onChange: (v: number) => void }) => (
    <button type="button" onClick={() => onChange(7)}>
      choisir-site-7
    </button>
  ),
}));

/** Refuse tant qu'aucun motif n'accompagne la demande, accepte ensuite. */
function serveurExigeantUnMotif(recu: { corps?: Record<string, unknown> }) {
  server.use(
    http.post(
      `${env.API_URL}/depistage/examens/adultes/create/`,
      async ({ request }) => {
        const corps = (await request.json()) as Record<string, unknown>;
        if (!corps.motif_reprise) {
          return HttpResponse.json(
            {
              detail: "Un examen existe déjà pour ce patient aujourd'hui.",
              examen_existant_id: 2596,
              numero_examen: 'EXA-2026-4CC6CAEA',
            },
            { status: 409 },
          );
        }
        recu.corps = corps;
        return HttpResponse.json({ id: 3000 }, { status: 201 });
      },
    ),
  );
}

function afficher(onCreated?: (exam: { id: number }) => void) {
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

/** Amène l'écran jusqu'au refus du serveur. */
async function jusquAuRefus(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText('choisir-site-7'));
  await user.click(screen.getByText('Créer').closest('button')!);
  await screen.findByText(/Un examen est déjà ouvert pour ce patient/);
}

/**
 * Le centre tient des dossiers physiques : un même patient peut recevoir deux
 * examens dans la journée — reprise après dilatation, contrôle de fin de
 * séance. Jusqu'ici l'écran n'offrait qu'une issue, « reprendre », et un
 * garde-fou sans issue pousse à contourner : c'est ainsi qu'on a obtenu douze
 * examens pour un seul patient le 23/08/2026.
 */
describe('Déclarer un second examen le même jour', () => {
  test('le refus offre les DEUX issues', async () => {
    serveurExigeantUnMotif({});
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    afficher();
    await jusquAuRefus(user);

    expect(screen.getByText('Reprendre l’examen en cours')).toBeVisible();
    expect(screen.getByText('C’est un second examen')).toBeVisible();
  });

  test('le motif est exigé avant de pouvoir créer', async () => {
    serveurExigeantUnMotif({});
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    afficher();
    await jusquAuRefus(user);
    await user.click(screen.getByText('C’est un second examen'));

    // Sans raison, le second examen serait indistinguable d'un doublon : c'est
    // exactement ce que la déclaration doit empêcher.
    expect(
      screen.getByText('Créer le second examen').closest('button'),
    ).toBeDisabled();
  });

  test('un motif suggéré débloque la création et part au serveur', async () => {
    const recu: { corps?: Record<string, unknown> } = {};
    serveurExigeantUnMotif(recu);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    afficher();
    await jusquAuRefus(user);
    await user.click(screen.getByText('C’est un second examen'));
    await user.click(screen.getByText('Reprise après dilatation'));
    await user.click(screen.getByText('Créer le second examen'));

    await waitFor(() =>
      expect(recu.corps?.motif_reprise).toBe('Reprise après dilatation'),
    );
  });

  test('une raison libre est acceptée', async () => {
    const recu: { corps?: Record<string, unknown> } = {};
    serveurExigeantUnMotif(recu);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    afficher();
    await jusquAuRefus(user);
    await user.click(screen.getByText('C’est un second examen'));
    await user.type(
      screen.getByLabelText('Motif du second examen'),
      'Deuxième passage, dossier papier 118',
    );
    await user.click(screen.getByText('Créer le second examen'));

    await waitFor(() =>
      expect(recu.corps?.motif_reprise).toBe(
        'Deuxième passage, dossier papier 118',
      ),
    );
  });

  test('l’examen créé est ouvert', async () => {
    serveurExigeantUnMotif({});
    const ouvrir = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    afficher(ouvrir);
    await jusquAuRefus(user);
    await user.click(screen.getByText('C’est un second examen'));
    await user.click(screen.getByText('Nouvelle mesure'));
    await user.click(screen.getByText('Créer le second examen'));

    await waitFor(() => expect(ouvrir).toHaveBeenCalledWith({ id: 3000 }));
  });
});
