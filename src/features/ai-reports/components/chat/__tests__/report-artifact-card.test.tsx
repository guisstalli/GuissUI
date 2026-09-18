/**
 * Tests d'intégration — carte de rapport ancrée dans le fil (MSW)
 *
 * C'est la pièce qui supprime la rupture de contexte : elle doit rendre l'état
 * du rapport et OUVRIR l'aperçu sans navigation.
 *
 * Couvre :
 * - Rendu du titre + statut à jour (le statut serveur prime sur l'indice du tour)
 * - Clic → le rapport devient le document ouvert
 * - Sans droit de lecture : l'état reste visible, l'ouverture n'est pas promise
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ReportArtifact } from '@/features/ai-reports/types';
import { useDocumentPanelStore } from '@/stores/document-panel-store';
import { aiReportsHandlers } from '@/testing/mocks/handlers/ai-reports';
import { server } from '@/testing/mocks/server';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

/** Autorisation pilotée par test : `Can` rend `children` ou son `fallback`. */
const autorise = { lecture: true };
vi.mock('@/components/ui/can', () => ({
  Can: ({
    children,
    fallback,
  }: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) => <>{autorise.lecture ? children : fallback}</>,
  Cannot: () => null,
}));

import { ReportArtifactCard } from '../report-artifact-card';

const artifact: ReportArtifact = {
  type: 'report',
  report_id: 1,
  // Indice du tour : au moment où l'agent déclenche le rapport, il est en file.
  status: 'PENDING',
  report_type: 'comparative_sites',
};

function renderCard(props: ReportArtifact = artifact) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportArtifactCard artifact={props} />
    </QueryClientProvider>,
  );
}

describe('ReportArtifactCard', () => {
  beforeEach(() => {
    autorise.lecture = true;
    server.use(...aiReportsHandlers);
    useDocumentPanelStore.setState({ document: null, tab: 'apercu' });
  });

  test('affiche le titre du rapport et son statut à jour', async () => {
    renderCard();

    expect(
      screen.getByText(/rapport comparatif entre sites/i),
    ).toBeInTheDocument();
    // Le statut SERVEUR (DRAFT dans la fixture) remplace l'indice PENDING du
    // tour : c'est tout l'intérêt du suivi en direct.
    expect(await screen.findByText(/brouillon/i)).toBeInTheDocument();
  });

  test("le clic ouvre l'aperçu du rapport sans navigation", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(useDocumentPanelStore.getState().document).toEqual({
        type: 'report',
        reportId: 1,
      }),
    );
  });

  test('sans droit de lecture, aucune ouverture n’est proposée', async () => {
    autorise.lecture = false;
    renderCard();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.getByText(/réservée au demandeur et aux approbateurs/i),
    ).toBeInTheDocument();
  });
});
