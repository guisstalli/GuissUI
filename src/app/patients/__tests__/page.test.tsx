import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { patientsHandlers } from '@/testing/mocks/handlers/patients';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import PatientsPage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/patients',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/app/_shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function afficher() {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <PatientsPage />
    </QueryClientProvider>,
  );
  return user;
}

/** Ouvre le menu Actions de la ligne portant ce nom. */
async function ouvrirActions(
  user: ReturnType<typeof userEvent.setup>,
  nom: string,
) {
  const ligne = (await screen.findByText(nom)).closest('tr');
  // Par le DOM de la ligne : « Actions » est aussi l'intitule de la colonne,
  // et les requetes par role a motif saturent le compilateur d'expressions
  // regulieres sur cette page.
  /* eslint-disable-next-line testing-library/no-node-access */
  await user.click(ligne!.querySelector('button')!);
}

beforeEach(() => server.use(...patientsHandlers));

/**
 * Un patient adulte deja enregistre peut devenir conducteur : seuls les champs
 * du permis manquent. L'action ne doit apparaitre que la ou elle a un sens —
 * proposee sur un patient qui a deja un dossier, elle creerait un DOUBLON.
 */
describe('Liste des patients — conversion en conducteur', () => {
  test('proposee pour un adulte sans dossier conducteur', async () => {
    const user = afficher();
    await ouvrirActions(user, 'Aminata Diallo');

    expect(await screen.findByText('Convertir en conducteur')).toBeVisible();
  });

  // PAS de test « adulte deja conducteur » : la liste interroge l'API avec
  // is_driver=false, donc un patient porteur d'un dossier conducteur n'y
  // figure jamais. Le garde `!patient.has_driver` est conserve par prudence —
  // le filtre serveur et la condition d'affichage pourraient diverger — mais
  // il n'est pas atteignable depuis cet ecran, et un test le pretendrait a
  // tort.

  test('absente pour un enfant', async () => {
    const user = afficher();
    await ouvrirActions(user, 'Fatou Sow');

    await screen.findByText('Modifier');
    expect(
      screen.queryByText('Convertir en conducteur'),
    ).not.toBeInTheDocument();
  });
});
