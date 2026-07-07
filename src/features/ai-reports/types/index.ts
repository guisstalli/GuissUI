import { z } from 'zod';

// =============================================================================
// Statuts — doivent refléter apps/ai_reports/enums.py (ReportStatus) exactement
// =============================================================================

export const REPORT_STATUS = {
  PENDING: 'PENDING',
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const;

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

/** Statuts « en cours » — le polling reste actif tant qu'on est dedans */
export const REPORT_STATUS_IN_PROGRESS: ReportStatus[] = [
  REPORT_STATUS.PENDING,
];

/** Libellés FR (miroir des labels backend) */
export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'En file de génération',
  DRAFT: 'Brouillon (à relire)',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  DELIVERED: 'Diffusé',
  FAILED: 'Échec de génération',
};

// =============================================================================
// Schémas Zod — réponses API
// =============================================================================

export const reportListItemSchema = z.object({
  id: z.number(),
  status: z.string(),
  report_type: z.string().nullable(),
  requester_email: z.string().nullable(),
  verification_passed: z.boolean().nullable(),
  // DecimalField DRF → sérialisé en chaîne ("0.0423")
  cost_usd: z.string(),
  created_at: z.string(),
});

export const reportDetailSchema = reportListItemSchema.extend({
  risk_tier: z.string().nullable(),
  filters: z.record(z.unknown()),
  prompt: z.string().nullable(),
  pdf_url: z.string().nullable(),
  docx_url: z.string().nullable(),
  llm_backend: z.string(),
  model_used: z.string(),
  prompt_version: z.string().optional(),
  tokens_in: z.number(),
  tokens_out: z.number(),
  verification_report: z.unknown(),
  approved_by_email: z.string().nullable(),
  approved_at: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  delivered_at: z.string().nullable(),
  error_message: z.string().nullable(),
  updated_at: z.string(),
});

export const askResponseSchema = z.object({
  answer_markdown: z.string(),
  sources: z.unknown(),
  verification: z.unknown(),
  tools_used: z.array(z.string()),
});

export const capabilitySchema = z.object({
  key: z.string(),
  display_name: z.string(),
  risk_tier: z.string(),
  healthy: z.boolean(),
});

export type ReportListItem = z.infer<typeof reportListItemSchema>;
export type ReportDetail = z.infer<typeof reportDetailSchema>;
export type AskResponse = z.infer<typeof askResponseSchema>;
export type Capability = z.infer<typeof capabilitySchema>;

/** Réponse du POST generate (202 Accepted — génération asynchrone Celery) */
export type GenerateReportResponse = {
  report_id: number;
};

// =============================================================================
// Schémas Zod — formulaires
// =============================================================================

export const askFormSchema = z.object({
  question: z
    .string()
    .min(1, 'La question est requise')
    .max(2000, 'Maximum 2000 caractères'),
});
export type AskFormValues = z.infer<typeof askFormSchema>;

export const generateReportFormSchema = z
  .object({
    report_type: z.string().optional(),
    prompt: z.string().max(5000, 'Maximum 5000 caractères').optional(),
    upload: z.instanceof(File).optional(),
  })
  .refine(
    (data) =>
      (data.report_type?.trim() ?? '') !== '' ||
      (data.prompt?.trim() ?? '') !== '',
    {
      message: 'Fournir un type de rapport et/ou une description libre',
      path: ['prompt'],
    },
  );
export type GenerateReportFormValues = z.infer<typeof generateReportFormSchema>;

export const rejectReportFormSchema = z.object({
  reason: z
    .string()
    .min(10, 'Le motif doit faire au moins 10 caractères')
    .max(2000, 'Maximum 2000 caractères'),
});
export type RejectReportFormValues = z.infer<typeof rejectReportFormSchema>;

// =============================================================================
// Chat — état local de session (jamais persisté côté serveur)
// =============================================================================

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  /** Question (user) ou answer_markdown (assistant) */
  content: string;
  sources?: unknown;
  verification?: unknown;
  tools_used?: string[];
  timestamp: number;
  /** Message d'erreur affiché dans le fil (429, indisponibilité…) */
  isError?: boolean;
};
