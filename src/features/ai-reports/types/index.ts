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

/**
 * Statuts TERMINAUX — le polling s'arrête dès qu'on en atteint un. On raisonne
 * en « terminal » (liste fermée, stable) plutôt qu'en « en cours » : si le
 * backend ajoute un statut intermédiaire (GENERATING, QUEUED…), le polling
 * continue au lieu de s'arrêter en silence sur un « En attente » figé.
 */
export const REPORT_STATUS_TERMINAL: ReportStatus[] = [
  REPORT_STATUS.DRAFT,
  REPORT_STATUS.APPROVED,
  REPORT_STATUS.REJECTED,
  REPORT_STATUS.DELIVERED,
  REPORT_STATUS.FAILED,
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

/**
 * Carte « source » lisible construite côté backend (services/sources.py) :
 * libellé FR de l'outil, filtres traduits, effectif du périmètre.
 */
export const sourceDisplaySchema = z.object({
  tool: z.string(),
  label: z.string(),
  filters: z.array(z.object({ label: z.string(), value: z.string() })),
  cell_count: z.number().nullable(),
});

export const askResponseSchema = z.object({
  answer_markdown: z.string(),
  sources: z.unknown(),
  sources_display: z.array(sourceDisplaySchema),
  verification: z.unknown(),
  tools_used: z.array(z.string()),
  /** Conversation créée (1re question) ou continuée — sert à router vers /assistant-ia/[id] */
  conversation_id: z.number(),
  message_id: z.number(),
});

// =============================================================================
// Conversations — fil persistant de l'assistant (miroir des serializers backend)
// =============================================================================

export const conversationListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  message_count: z.number(),
});

export const conversationMessageSchema = z.object({
  id: z.number(),
  role: z.enum(['USER', 'ASSISTANT']),
  content: z.string(),
  status: z.enum(['SUCCESS', 'FAILED']),
  error_message: z.string(),
  sources: z.unknown(),
  sources_display: z.array(sourceDisplaySchema).nullable(),
  verification: z.unknown(),
  tools_used: z.array(z.string()),
  created_at: z.string(),
});

export const conversationDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  messages: z.array(conversationMessageSchema),
});

export const capabilitySchema = z.object({
  key: z.string(),
  display_name: z.string(),
  risk_tier: z.string(),
  healthy: z.boolean(),
});

export type ReportListItem = z.infer<typeof reportListItemSchema>;
export type ReportDetail = z.infer<typeof reportDetailSchema>;
export type SourceDisplay = z.infer<typeof sourceDisplaySchema>;
export type AskResponse = z.infer<typeof askResponseSchema>;
export type ConversationListItem = z.infer<typeof conversationListItemSchema>;
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type ConversationDetail = z.infer<typeof conversationDetailSchema>;
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

export const DELIVER_CHANNELS = ['email', 'whatsapp'] as const;
export type DeliverChannel = (typeof DELIVER_CHANNELS)[number];

export const DELIVER_CHANNEL_LABELS: Record<DeliverChannel, string> = {
  email: 'Email (PDF en pièce jointe)',
  whatsapp: 'WhatsApp (lien de téléchargement)',
};

/** Découpe une saisie libre (virgules, points-virgules, retours ligne) en liste. */
export const splitRecipients = (raw?: string): string[] =>
  (raw ?? '')
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s.-]{6,20}$/;

export const deliverReportFormSchema = z
  .object({
    channels: z
      .array(z.enum(DELIVER_CHANNELS))
      .min(1, 'Sélectionner au moins un canal de diffusion'),
    /** Adresses séparées par virgule / point-virgule / retour ligne */
    emails: z.string().optional(),
    /** Numéros au format international, séparés par virgule / retour ligne */
    phones: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.channels.includes('email')) {
      const emails = splitRecipients(data.emails);
      if (emails.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['emails'],
          message: 'Au moins une adresse email est requise pour ce canal',
        });
      } else {
        const invalid = emails.find((e) => !EMAIL_PATTERN.test(e));
        if (invalid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['emails'],
            message: `Adresse invalide : « ${invalid} »`,
          });
        }
      }
    }
    if (data.channels.includes('whatsapp')) {
      const phones = splitRecipients(data.phones);
      if (phones.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phones'],
          message: 'Au moins un numéro WhatsApp est requis pour ce canal',
        });
      } else {
        const invalid = phones.find((p) => !PHONE_PATTERN.test(p));
        if (invalid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['phones'],
            message: `Numéro invalide : « ${invalid} » (format international attendu, ex. +221771234567)`,
          });
        }
      }
    }
  });
export type DeliverReportFormValues = z.infer<typeof deliverReportFormSchema>;

// =============================================================================
// Chat — modèle de VUE du fil (dérivé du cache TanStack + bulles en vol)
// =============================================================================

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  /** Question (user) ou answer_markdown (assistant) */
  content: string;
  sources?: unknown;
  sources_display?: SourceDisplay[];
  verification?: unknown;
  tools_used?: string[];
  timestamp: number;
  /** Message d'erreur affiché dans le fil (429, indisponibilité…) */
  isError?: boolean;
};

/** Projette un message persisté (API) vers le modèle de vue du fil. */
export const toChatMessage = (message: ConversationMessage): ChatMessage => {
  const isFailed = message.status === 'FAILED';
  return {
    id: String(message.id),
    role: message.role === 'USER' ? 'user' : 'assistant',
    content: isFailed
      ? "L'assistant n'a pas pu répondre à cette question."
      : message.content,
    sources: message.sources ?? undefined,
    sources_display: message.sources_display ?? undefined,
    verification: message.verification ?? undefined,
    tools_used: message.tools_used,
    timestamp: Date.parse(message.created_at),
    isError: isFailed,
  };
};
