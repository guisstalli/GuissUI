import { z } from 'zod';

// Miroir de apps/agent_channels (backend) — enums.py + serializers.py

export const CHANNELS = ['whatsapp', 'email'] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
};

export const allowedSenderSchema = z.object({
  id: z.number(),
  channel: z.enum(CHANNELS),
  identifier: z.string(),
  user_id: z.number(),
  user_email: z.string(),
  can_chat: z.boolean(),
  can_trigger_actions: z.boolean(),
  conversation_id: z.number().nullable(),
  approved_by_email: z.string().nullable(),
  created_at: z.string(),
});
export type AllowedSender = z.infer<typeof allowedSenderSchema>;

export const channelMessageSchema = z.object({
  id: z.number(),
  direction: z.enum(['in', 'out']),
  channel: z.enum(CHANNELS),
  peer: z.string(),
  body: z.string(),
  status: z.string(),
  error_message: z.string(),
  created_at: z.string(),
});
export type ChannelMessage = z.infer<typeof channelMessageSchema>;

// --- Statuts ---------------------------------------------------------------

export const OUTBOUND_STATUSES = [
  'pending',
  'queued',
  'sent',
  'delivered',
  'failed',
] as const;
export type OutboundStatus = (typeof OUTBOUND_STATUSES)[number];

export const INBOUND_STATUSES = [
  'received',
  'queued',
  'processed',
  'rejected',
  'failed',
] as const;
export type InboundStatus = (typeof INBOUND_STATUSES)[number];

/**
 * Libellés des statuts sortants.
 *
 * `queued` est délibérément libellé « Accepté (non remis) », JAMAIS
 * « Envoyé ». C'est exactement la confusion qui a coûté un incident : le
 * fournisseur avait accepté la requête, l'interface affichait « Envoyé », et
 * le message n'est jamais arrivé (erreur 63112, compte WhatsApp désactivé par
 * Meta). Un statut ne doit pas promettre plus que ce que l'on sait.
 */
export const OUTBOUND_STATUS_LABELS: Record<OutboundStatus, string> = {
  pending: 'En attente',
  queued: 'Accepté (non remis)',
  sent: 'Envoyé',
  delivered: 'Remis',
  failed: 'Échec',
};

export const INBOUND_STATUS_LABELS: Record<InboundStatus, string> = {
  received: 'Reçu',
  queued: 'En file',
  processed: 'Traité',
  rejected: 'Rejeté',
  failed: 'Échec',
};

/** Statuts proposés dans le filtre du journal, les plus utiles d'abord. */
export const FILTERABLE_STATUSES = [
  { value: 'failed', label: 'Échec' },
  { value: 'queued', label: 'Accepté (non remis)' },
  { value: 'sent', label: 'Envoyé' },
  { value: 'delivered', label: 'Remis' },
  { value: 'processed', label: 'Traité' },
  { value: 'rejected', label: 'Rejeté' },
  { value: 'received', label: 'Reçu' },
  { value: 'pending', label: 'En attente' },
] as const;

// --- Journal paginé --------------------------------------------------------

export const channelMessagesPageSchema = z.object({
  count: z.number(),
  results: z.array(channelMessageSchema),
});
export type ChannelMessagesPage = z.infer<typeof channelMessagesPageSchema>;

export interface MessagesParams {
  limit?: number;
  offset?: number;
  channel?: Channel;
  direction?: 'in' | 'out';
  status?: string;
  /** Recherche partielle sur l'interlocuteur ET le corps du message. */
  search?: string;
  /** AAAA-MM-JJ */
  date_from?: string;
  /** AAAA-MM-JJ */
  date_to?: string;
}

// --- Indicateurs d'en-tête -------------------------------------------------

export const channelStatsSchema = z.object({
  active_senders: z.number(),
  configured_channels: z.number(),
  failed_messages_24h: z.number(),
});
export type ChannelStats = z.infer<typeof channelStatsSchema>;

export const createSenderFormSchema = z
  .object({
    channel: z.enum(CHANNELS),
    identifier: z.string().min(3, 'Identifiant requis'),
    user_id: z.coerce.number().int().positive('Sélectionner un utilisateur'),
    can_chat: z.boolean().default(true),
    can_trigger_actions: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.channel === 'whatsapp' && !/^\+\d{8,15}$/.test(data.identifier)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identifier'],
        message: 'Format international attendu, ex. +221771234567',
      });
    }
    if (
      data.channel === 'email' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.identifier)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identifier'],
        message: 'Adresse email invalide',
      });
    }
  });
export type CreateSenderFormValues = z.infer<typeof createSenderFormSchema>;
