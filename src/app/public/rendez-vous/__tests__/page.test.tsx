import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import {
  fireEvent,
  rtlRender,
  screen,
  userEvent,
  waitFor,
} from '@/testing/test-utils';

import RendezVousPage from '../page';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function setupPage() {
  // Radix Select pose pointer-events sur l'overlay ; on désactive le check
  // pointer-events de user-event pour fiabiliser les clics sur les options.
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <RendezVousPage />
    </QueryClientProvider>,
  );
  return user;
}

const CONFIRMATION = {
  numero_rdv: 'RDV-2024-099',
  date: '2026-06-25',
  heure_debut: '09:00',
  heure_fin: '09:30',
  patient_nom: 'Diallo',
  patient_prenom: 'Fatou',
  patient_phone: '+221770000000',
  token_annulation: 'tok-new-999',
};

/** Avance le wizard jusqu'à l'étape « Informations » (date → créneau → infos). */
async function goToInfoStep(user: ReturnType<typeof userEvent.setup>) {
  fireEvent.change(screen.getByLabelText('Date souhaitée'), {
    target: { value: '2026-06-25' },
  });
  await user.click(screen.getByRole('button', { name: /continuer/i }));

  await user.click(await screen.findByRole('button', { name: '09:00' }));
  await user.click(screen.getByRole('button', { name: /continuer/i }));

  await screen.findByText('Vos informations');
}

async function fillIdentity(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Prénom *'), 'Fatou');
  await user.type(screen.getByLabelText('Nom *'), 'Diallo');
  await user.type(screen.getByLabelText('Téléphone *'), '+221770000000');
}

async function selectMotif(
  user: ReturnType<typeof userEvent.setup>,
  optionName: string,
) {
  await user.click(screen.getByRole('combobox'));
  await user.click(await screen.findByRole('option', { name: optionName }));
}

/* ─── tests ───────────────────────────────────────────────────────────────── */

describe('RendezVousPage — parcours de réservation', () => {
  // Parcours wizard complet (3 étapes, nombreuses interactions userEvent) :
  // dépasse parfois les 5s par défaut sur machine chargée.
  test("parcours complet jusqu'à la confirmation", async () => {
    // Arrange
    const user = setupPage();

    // Act
    await goToInfoStep(user);
    await fillIdentity(user);
    await selectMotif(user, 'OCT');
    await user.click(
      screen.getByRole('button', { name: /confirmer le rendez-vous/i }),
    );

    // Assert
    await screen.findByText('Rendez-vous confirmé !');
    expect(screen.getByText('RDV-2024-099')).toBeInTheDocument();
  }, 15000);

  test('le choix « Autre » révèle le champ libre', async () => {
    // Arrange
    const user = setupPage();
    await goToInfoStep(user);

    // Act — avant sélection, pas de champ libre
    expect(
      screen.queryByLabelText('Précisez le motif *'),
    ).not.toBeInTheDocument();
    await selectMotif(user, 'Autre');

    // Assert
    expect(
      await screen.findByLabelText('Précisez le motif *'),
    ).toBeInTheDocument();
  });

  test('« Autre » envoie le texte saisi dans `motif`, sans `motif_autre`', async () => {
    // Arrange
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post(`${env.API_URL}/rendez-vous/reserver/`, async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(CONFIRMATION, { status: 201 });
      }),
    );
    const user = setupPage();

    // Act
    await goToInfoStep(user);
    await fillIdentity(user);
    await selectMotif(user, 'Autre');
    await user.type(
      await screen.findByLabelText('Précisez le motif *'),
      'Douleur oculaire persistante',
    );
    await user.click(
      screen.getByRole('button', { name: /confirmer le rendez-vous/i }),
    );

    // Assert
    await waitFor(() => expect(captured).not.toBeNull());
    expect(captured!.motif).toBe('Douleur oculaire persistante');
    expect(captured!).not.toHaveProperty('motif_autre');
  });

  test('« Autre » sans précision bloque la soumission', async () => {
    // Arrange
    const user = setupPage();
    await goToInfoStep(user);
    await fillIdentity(user);

    // Act
    await selectMotif(user, 'Autre');
    await user.click(
      screen.getByRole('button', { name: /confirmer le rendez-vous/i }),
    );

    // Assert
    await screen.findByText('Veuillez préciser le motif');
    expect(
      screen.queryByText('Rendez-vous confirmé !'),
    ).not.toBeInTheDocument();
  });

  test("affiche le message d'erreur du backend en cas d'échec", async () => {
    // Arrange
    server.use(
      http.post(`${env.API_URL}/rendez-vous/reserver/`, () =>
        HttpResponse.json(
          { detail: 'Ce créneau est déjà réservé.' },
          {
            status: 400,
          },
        ),
      ),
    );
    const user = setupPage();

    // Act
    await goToInfoStep(user);
    await fillIdentity(user);
    await selectMotif(user, 'OCT');
    await user.click(
      screen.getByRole('button', { name: /confirmer le rendez-vous/i }),
    );

    // Assert
    expect(
      await screen.findByText('Ce créneau est déjà réservé.'),
    ).toBeInTheDocument();
  });
});
