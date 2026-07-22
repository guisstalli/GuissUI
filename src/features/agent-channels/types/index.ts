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
