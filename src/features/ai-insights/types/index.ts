import { z } from 'zod';

// =============================================================================
// Opérations — miroir de InsightOperation backend
// =============================================================================

export const PROPOSAL_OPERATION = {
  ADD: 'add',
  EDIT: 'edit',
  REMOVE: 'remove',
  AGREE: 'agree',
} as const;

export type ProposalOperation =
  (typeof PROPOSAL_OPERATION)[keyof typeof PROPOSAL_OPERATION];

export const PROPOSAL_OPERATION_LABELS: Record<ProposalOperation, string> = {
  add: 'Ajout',
  edit: 'Modification',
  remove: 'Suppression',
  agree: 'Confirmation',
};

// =============================================================================
// Statuts — miroir de ProposalStatus backend
// =============================================================================

export const PROPOSAL_STATUS = {
  PENDING: 'pending',
  APPLIED: 'applied',
  REJECTED: 'rejected',
  QUARANTINED: 'quarantined',
  STALE: 'stale',
} as const;

export type ProposalStatus =
  (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  pending: 'En attente',
  applied: 'Appliquée',
  rejected: 'Rejetée',
  quarantined: 'Mise en quarantaine',
  stale: 'Périmée',
};

// =============================================================================
// Schémas Zod — réponses API
// =============================================================================

export const proposalSchema = z.object({
  id: z.number(),
  operation: z.string(),
  status: z.string(),
  proposed_text: z.string(),
  rationale: z.string(),
  source_experience_ids: z.array(z.number()),
  target_id: z.number().nullable(),
  target_text: z.string().nullable(),
  /** true = la cible a changé depuis la proposition ; POST apply → 409 garanti */
  target_stale: z.boolean(),
  reviewed_at: z.string().nullable(),
  reviewed_by_email: z.string().nullable(),
  review_reason: z.string(),
  applied_insight_id: z.number().nullable(),
  retracted_at: z.string().nullable(),
  retracted_by_email: z.string().nullable(),
  /** true = la règle appliquée a été retirée. Status reste "applied". */
  is_retracted: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Proposal = z.infer<typeof proposalSchema>;

export const insightSchema = z.object({
  id: z.number(),
  text: z.string(),
  fingerprint: z.string(),
  active: z.boolean(),
  applied_at: z.string().nullable(),
  applied_by_email: z.string().nullable(),
  retracted_at: z.string().nullable(),
  retracted_by_email: z.string().nullable(),
  retraction_reason: z.string().nullable(),
  reaffirmed_at: z.string().nullable(),
  reaffirm_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Insight = z.infer<typeof insightSchema>;

// =============================================================================
// Schémas Zod — formulaires
// =============================================================================

export const reasonFormSchema = z.object({
  reason: z
    .string()
    .min(5, 'Le motif doit faire au moins 5 caractères')
    .max(1000, 'Maximum 1000 caractères'),
});

export type ReasonFormValues = z.infer<typeof reasonFormSchema>;

export const retractFormSchema = z.object({
  reason: z.string().max(1000, 'Maximum 1000 caractères').optional(),
});

export type RetractFormValues = z.infer<typeof retractFormSchema>;
