import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, test, vi, beforeEach } from 'vitest';

import { driversHandlers } from '@/testing/mocks/handlers/drivers';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import ConducteursPage from '../page';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/conducteurs',
  useSearchParams: () => new URLSearchParams(),
}));

// La coquille applicative tire session, navigation et notifications : hors
// sujet ici, on ne teste que le contenu de la page.
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
      <ConducteursPage />
    </QueryClientProvider>,
  );
  return user;
}

beforeEach(() => {
  push.mockClear();
  // Les gestionnaires conducteurs ne sont pas enregistres globalement :
  // chaque test qui en a besoin les ajoute, comme drivers-hooks.test.tsx.
  server.use(...driversHandlers);
});

describe('Liste des conducteurs', () => {
  test('la recherche est visible sans ouvrir les filtres', async () => {
    afficher();

    // Elle etait enfouie derriere « Filtres » : il fallait un clic avant de
    // pouvoir taper, sur l'action la plus frequente de cette liste.
    expect(
      await screen.findByPlaceholderText(/Rechercher un conducteur/i),
    ).toBeVisible();
  });

  test('cliquer la ligne mene a la fiche du conducteur', async () => {
    const user = afficher();
    const nom = await screen.findByText('Oumar Ndiaye');

    await user.click(nom.closest('tr')!);

    // Un seul clic, la ou il en fallait trois : Actions -> Voir -> lecture.
    await waitFor(() => expect(push).toHaveBeenCalledWith('/conducteurs/1'));
  });

  // NON COUVERT ICI : l'enchainement « menu Actions -> dialogue de site ».
  // Cliquer l'entree de menu fait tomber le processus de test en memoire
  // (« RegExpCompiler Allocation failed ») — la fermeture du menu Radix et
  // l'ouverture du dialogue, combinees dans jsdom. Le dialogue seul se rend
  // sans probleme (voir create-exam-dialog.test.tsx), et l'entree de menu ne
  // fait plus qu'appeler setDriverPourExamen. Ce raccord n'est verifie que
  // par lecture du code : a controler a l'oeil.
});
