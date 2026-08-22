import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

// =============================================================================
// Données de test
// =============================================================================

export const mockProposalPending = {
  id: 101,
  operation: 'add',
  status: 'pending',
  proposed_text: 'Toujours demander la lateralite oculaire lors de examen.',
  rationale: 'Agent a echoue 3 fois faute de cette donnee.',
  source_experience_ids: [41, 42],
  target_id: null,
  target_text: null,
  target_stale: false,
  reviewed_at: null,
  reviewed_by_email: null,
  review_reason: '',
  applied_insight_id: null,
  retracted_at: null,
  retracted_by_email: null,
  is_retracted: false,
  created_at: '2026-08-01T09:00:00Z',
  updated_at: '2026-08-01T09:00:00Z',
};

export const mockProposalStale = {
  ...mockProposalPending,
  id: 102,
  operation: 'edit',
  status: 'pending',
  proposed_text: 'Corriger la formulation de la regle sur la tonometrie.',
  target_id: 5,
  target_text: 'Ancienne formulation de la regle tonometrie.',
  /** true = la cible a changé, l'application échouera en 409 */
  target_stale: true,
};

export const mockProposalApplied = {
  ...mockProposalPending,
  id: 103,
  status: 'applied',
  applied_insight_id: 7,
  reviewed_at: '2026-08-02T10:00:00Z',
  reviewed_by_email: 'admin@guiss.sn',
  is_retracted: false,
};

export const mockProposalAppliedRetracted = {
  ...mockProposalApplied,
  id: 104,
  /** Status reste "applied" même après retrait — c'est la vérité historique */
  status: 'applied',
  is_retracted: true,
  retracted_at: '2026-08-10T14:00:00Z',
  retracted_by_email: 'admin@guiss.sn',
};

export const mockInsightActive = {
  id: 7,
  text: 'Toujours demander la lateralite oculaire lors de examen.',
  fingerprint: 'abc123',
  active: true,
  applied_at: '2026-08-02T10:00:00Z',
  applied_by_email: 'admin@guiss.sn',
  retracted_at: null,
  retracted_by_email: null,
  retraction_reason: null,
  reaffirmed_at: null,
  reaffirm_count: 0,
  created_at: '2026-08-02T10:00:00Z',
  updated_at: '2026-08-02T10:00:00Z',
};

export const mockInsightRetracted = {
  ...mockInsightActive,
  id: 8,
  text: 'Ancienne regle maintenant retiree.',
  active: false,
  retracted_at: '2026-08-10T14:00:00Z',
  retracted_by_email: 'admin@guiss.sn',
  retraction_reason: 'Protocole mis à jour.',
};

// =============================================================================
// Handlers MSW
// =============================================================================

export const aiInsightsHandlers = [
  // Liste des propositions
  http.get(
    `${env.API_URL}/ai-reports/insights/proposals/`,
    async ({ request }) => {
      await networkDelay();
      const url = new URL(request.url);
      const status = url.searchParams.get('status');

      let results;
      if (status === 'applied') {
        results = [mockProposalApplied, mockProposalAppliedRetracted];
      } else if (status === 'pending') {
        results = [mockProposalPending, mockProposalStale];
      } else {
        results = [
          mockProposalPending,
          mockProposalStale,
          mockProposalApplied,
          mockProposalAppliedRetracted,
        ];
      }

      return HttpResponse.json({
        count: results.length,
        next: null,
        previous: null,
        results,
      });
    },
  ),

  // Détail d'une proposition
  http.get(
    `${env.API_URL}/ai-reports/insights/proposals/:id/`,
    async ({ params }) => {
      await networkDelay();
      const allProposals = [
        mockProposalPending,
        mockProposalStale,
        mockProposalApplied,
        mockProposalAppliedRetracted,
      ];
      const proposal = allProposals.find(
        (p) => String(p.id) === String(params.id),
      );
      if (!proposal) {
        return HttpResponse.json(
          { message: 'Proposition introuvable.' },
          { status: 404 },
        );
      }
      return HttpResponse.json(proposal);
    },
  ),

  // Apply
  http.post(
    `${env.API_URL}/ai-reports/insights/proposals/:id/apply/`,
    async ({ params }) => {
      await networkDelay();
      if (String(params.id) === '102') {
        // Proposition périmée → 409
        return HttpResponse.json(
          {
            message: 'La regle cible a ete modifiee depuis la proposition.',
          },
          { status: 409 },
        );
      }
      return HttpResponse.json({
        ...mockProposalPending,
        id: Number(params.id),
        status: 'applied',
        applied_insight_id: 7,
      });
    },
  ),

  // Reject
  http.post(
    `${env.API_URL}/ai-reports/insights/proposals/:id/reject/`,
    async ({ params }) => {
      await networkDelay();
      return HttpResponse.json({
        ...mockProposalPending,
        id: Number(params.id),
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by_email: 'admin@guiss.sn',
      });
    },
  ),

  // Quarantine
  http.post(
    `${env.API_URL}/ai-reports/insights/proposals/:id/quarantine/`,
    async ({ params }) => {
      await networkDelay();
      return HttpResponse.json({
        ...mockProposalPending,
        id: Number(params.id),
        status: 'quarantined',
      });
    },
  ),

  // Retract
  http.post(
    `${env.API_URL}/ai-reports/insights/proposals/:id/retract/`,
    async ({ params }) => {
      await networkDelay();
      return HttpResponse.json({
        ...mockProposalApplied,
        id: Number(params.id),
        is_retracted: true,
        retracted_at: new Date().toISOString(),
        retracted_by_email: 'admin@guiss.sn',
      });
    },
  ),

  // Liste des règles vivantes
  http.get(`${env.API_URL}/ai-reports/insights/`, async ({ request }) => {
    await networkDelay();
    const url = new URL(request.url);
    const active = url.searchParams.get('active');

    let results;
    if (active === 'true') {
      results = [mockInsightActive];
    } else if (active === 'false') {
      results = [mockInsightRetracted];
    } else {
      results = [mockInsightActive, mockInsightRetracted];
    }

    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results,
    });
  }),
];
