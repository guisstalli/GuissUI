import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, test, vi } from 'vitest';

import { CreateExamDialog } from '@/app/create-exam-dialog';
import { rtlRender, screen } from '@/testing/test-utils';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/conducteurs',
  useSearchParams: () => new URLSearchParams(),
}));

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
