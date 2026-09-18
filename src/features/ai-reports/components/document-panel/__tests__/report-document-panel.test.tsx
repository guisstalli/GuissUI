/**
 * Tests d'intégration — panneau d'aperçu du document (MSW)
 *
 * Couvre :
 * - Aperçu : le markdown du rapport est rendu dans le fil, sans navigation
 * - Onglets : Sources et Vérification exposent le périmètre et le verdict
 * - Fermeture : le panneau se retire de l'état partagé
 * - Rapport introuvable / non autorisé : message lisible, pas d'écran blanc
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useDocumentPanelStore } from '@/stores/document-panel-store';
import { aiReportsHandlers } from '@/testing/mocks/handlers/ai-reports';
import { server } from '@/testing/mocks/server';

// Évite les appels next-auth asynchrones (getSession) dans jsdom.
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

// L'autorisation a ses propres tests ; ici on veut voir les actions rendues.
vi.mock('@/components/ui/can', () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Cannot: () => null,
}));

import { ReportDocumentPanel } from '../report-document-panel';

function renderPanel(reportId = 1) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportDocumentPanel reportId={reportId} />
    </QueryClientProvider>,
  );
}

describe('ReportDocumentPanel', () => {
  beforeEach(() => {
    server.use(...aiReportsHandlers);
    useDocumentPanelStore.setState({
      document: { type: 'report', reportId: 1 },
      tab: 'apercu',
    });
  });

  test('rend le contenu du rapport sans quitter la conversation', async () => {
    renderPanel();

    // Le markdown est rendu en éléments React (titre de section du rapport).
    expect(
      await screen.findByRole('heading', { name: /synthèse/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/412 conducteurs examinés en août 2026/i),
    ).toBeInTheDocument();
  });

  test("l'onglet Sources expose le périmètre appliqué et le coût", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByRole('heading', { name: /synthèse/i });

    await user.click(screen.getByRole('tab', { name: 'Sources' }));

    expect(screen.getByText(/périmètre appliqué/i)).toBeInTheDocument();
    // Aucun filtre dans la fixture → message explicite, pas une zone vide.
    expect(screen.getByText(/aucun filtre/i)).toBeInTheDocument();
    expect(screen.getByText(/coût estimé/i)).toBeInTheDocument();
  });

  test("l'onglet Vérification affiche le verdict d'ancrage", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByRole('heading', { name: /synthèse/i });

    await user.click(screen.getByRole('tab', { name: 'Vérification' }));

    expect(screen.getByText(/chiffres vérifiés/i)).toBeInTheDocument();
  });

  test('la fermeture retire le document de l’état partagé', async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByRole('heading', { name: /synthèse/i });

    await user.click(
      screen.getByRole('button', { name: /fermer l'aperçu du document/i }),
    );

    await waitFor(() =>
      expect(useDocumentPanelStore.getState().document).toBeNull(),
    );
  });

  test('un rapport hors périmètre affiche un message lisible', async () => {
    // L'API renvoie le MÊME 404 pour « inexistant » et « pas votre rapport » :
    // le message ne doit donc rien révéler de plus.
    renderPanel(999);

    expect(
      await screen.findByText(/introuvable ou accès non autorisé/i),
    ).toBeInTheDocument();
  });
});
