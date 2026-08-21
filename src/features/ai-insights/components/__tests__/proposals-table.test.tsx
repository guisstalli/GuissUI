import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { SessionProvider } from 'next-auth/react';
import { describe, expect, it } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import { ProposalsTable } from '../proposals-table';

// =============================================================================
// Helpers
// =============================================================================

const SESSION_ADMIN = {
  user: {
    id: '1',
    name: 'admin@guiss.sn',
    email: 'admin@guiss.sn',
    role: 'ADMIN',
  },
  expires: '2999-01-01T00:00:00.000Z',
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderProposalsTable() {
  return rtlRender(
    <SessionProvider session={SESSION_ADMIN}>
      <QueryClientProvider client={createQueryClient()}>
        <ProposalsTable />
      </QueryClientProvider>
    </SessionProvider>,
  );
}

// =============================================================================
// Tests des quatre subtilites du contrat
// =============================================================================

describe('ProposalsTable', () => {
  /**
   * Subtilite 1 : target_stale -> avertissement AVANT les boutons d'action.
   * L'administrateur ne doit PAS attendre un 409 pour savoir que l'application
   * echouera — l'ecran le lui dit avant le clic.
   */
  it('affiche un avertissement visible si target_stale est true', async () => {
    renderProposalsTable();

    // La liste charge les propositions pending par defaut (MSW renvoie
    // mockProposalStale avec target_stale: true dans le lot pending).
    await screen.findByText(
      'Corriger la formulation de la regle sur la tonometrie.',
      {},
      { timeout: 4000 },
    );

    const warnings = screen.getAllByRole('alert', {
      name: /cible modifiée/i,
    });
    expect(warnings.length).toBeGreaterThan(0);
  });

  /**
   * Subtilite 1 suite : quand target_stale est true, le bouton "Appliquer"
   * doit etre masque.
   */
  it('masque le bouton Appliquer quand target_stale est true', async () => {
    renderProposalsTable();

    await screen.findByText(
      'Corriger la formulation de la regle sur la tonometrie.',
      {},
      { timeout: 4000 },
    );

    // La proposition NON perimee a un bouton Appliquer, la perimee non
    const applyButtons = screen.getAllByRole('button', { name: /appliquer/i });
    expect(applyButtons).toHaveLength(1);
  });

  /**
   * Subtilite 4 : un 409 affiche le message du serveur (pas une erreur generique)
   */
  it('affiche le message serveur en cas de 409 sur apply', async () => {
    server.use(
      http.post(`${env.API_URL}/ai-reports/insights/proposals/101/apply/`, () =>
        HttpResponse.json(
          { message: 'Un doublon existe dans les regles actives.' },
          { status: 409 },
        ),
      ),
    );

    renderProposalsTable();

    await screen.findByText(
      'Toujours demander la lateralite oculaire lors de examen.',
      {},
      { timeout: 4000 },
    );

    const applyBtn = screen.getByRole('button', { name: /appliquer/i });
    await userEvent.click(applyBtn);

    await screen.findByText(
      'Un doublon existe dans les regles actives.',
      {},
      { timeout: 4000 },
    );
  });

  /**
   * Subtilite 3 : pour operation "edit", la ligne expansible montre
   * le texte actuel (target_text) barre et le texte propose.
   */
  it('affiche le diff avant/apres pour une operation edit', async () => {
    renderProposalsTable();

    await screen.findByText(
      'Corriger la formulation de la regle sur la tonometrie.',
      {},
      { timeout: 4000 },
    );

    // Ouvrir les details de la ligne perimee (2eme toggle)
    const toggleButtons = screen.getAllByRole('button', {
      name: /voir les d/i,
    });
    await userEvent.click(toggleButtons[1]);

    // Le texte actuel (target_text) doit apparaitre
    await screen.findByText(
      'Ancienne formulation de la regle tonometrie.',
      {},
      { timeout: 4000 },
    );
  });

  /**
   * Subtilite 2 : status="applied" + is_retracted=true -> badge "Retiree",
   * PAS "Appliquee". Regressions sur ce point afficheraient une regle retiree
   * comme encore active.
   */
  it('affiche Retiree pour applied + is_retracted, Appliquee pour applied + not retracted', async () => {
    server.use(
      http.get(`${env.API_URL}/ai-reports/insights/proposals/`, () =>
        HttpResponse.json({
          count: 2,
          next: null,
          previous: null,
          results: [
            {
              id: 103,
              operation: 'add',
              status: 'applied',
              proposed_text: 'Regle encore en vigueur.',
              rationale: '',
              source_experience_ids: [],
              target_id: null,
              target_text: null,
              target_stale: false,
              reviewed_at: null,
              reviewed_by_email: null,
              review_reason: '',
              applied_insight_id: 7,
              retracted_at: null,
              retracted_by_email: null,
              is_retracted: false,
              created_at: '2026-08-01T09:00:00Z',
              updated_at: '2026-08-01T09:00:00Z',
            },
            {
              id: 104,
              operation: 'add',
              status: 'applied',
              proposed_text: 'Regle retiree.',
              rationale: '',
              source_experience_ids: [],
              target_id: null,
              target_text: null,
              target_stale: false,
              reviewed_at: null,
              reviewed_by_email: null,
              review_reason: '',
              applied_insight_id: 8,
              retracted_at: '2026-08-10T14:00:00Z',
              retracted_by_email: 'admin@guiss.sn',
              is_retracted: true,
              created_at: '2026-08-01T09:00:00Z',
              updated_at: '2026-08-10T14:00:00Z',
            },
          ],
        }),
      ),
    );

    renderProposalsTable();

    await screen.findByText('Regle encore en vigueur.', {}, { timeout: 4000 });
    await screen.findByText('Regle retiree.', {}, { timeout: 4000 });

    const appliedBadges = screen.getAllByText('Appliquée');
    const retiredBadges = screen.getAllByText('Retirée');

    expect(appliedBadges).toHaveLength(1);
    expect(retiredBadges).toHaveLength(1);
  });

  /**
   * Un rejet sans motif doit etre bloque cote client par le formulaire.
   */
  it('bloque la soumission du rejet si le motif est vide', async () => {
    renderProposalsTable();

    await screen.findByText(
      'Toujours demander la lateralite oculaire lors de examen.',
      {},
      { timeout: 4000 },
    );

    const rejectBtn = screen.getAllByRole('button', { name: /rejeter/i })[0];
    await userEvent.click(rejectBtn);

    await screen.findByRole('dialog', {}, { timeout: 4000 });

    // Cliquer "Rejeter" dans le dialog sans saisir de motif
    const submitBtn = screen
      .getAllByRole('button', { name: /^rejeter$/i })
      .find((b) => b.closest('[role="dialog"]'));
    if (submitBtn) {
      await userEvent.click(submitBtn);
    }

    await screen.findByText(/au moins 5 caractères/i);
  });
});
