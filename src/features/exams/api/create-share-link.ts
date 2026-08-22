import { useMutation } from '@tanstack/react-query';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { z } from 'zod';

import { api } from '@/lib/api-client';

/**
 * Type d'examen partagé — valeurs acceptées par l'API
 * (`ShareCreateInputSerializer.choices = ["adulte", "enfant"]`).
 */
export const SHARE_EXAM_TYPES = ['adulte', 'enfant'] as const;
export type ShareExamType = (typeof SHARE_EXAM_TYPES)[number];

/**
 * Schéma d'entrée du dialog de partage. `exam_type` / `exam_id` sont fournis
 * par le contexte de l'examen (non éditables dans le formulaire) ; l'utilisateur
 * ne renseigne que le TTL, le nombre max d'accès et le destinataire.
 */
export const shareCreateInputSchema = z.object({
  exam_type: z.enum(SHARE_EXAM_TYPES),
  exam_id: z.number().int().positive(),
  /** Dossier complet (défaut côté serveur) ou conclusion seule. */
  document: z.enum(['dossier', 'conclusion']).optional(),
  ttl_hours: z.number().int().min(1).max(8760).optional(),
  max_access: z.number().int().min(1).nullable().optional(),
  /**
   * Destinataire WhatsApp au format E.164 (ex: `+221771234567`).
   *
   * Un numéro sans indicatif était accepté puis « complété » côté serveur en
   * `+775726004` — un numéro kazakh valide : les envois partaient dans le vide.
   * L'indicatif est donc exigé ici, à la saisie.
   */
  to_phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || isValidPhoneNumber(value), {
      message: "Numéro invalide — indiquez l'indicatif pays (ex : +221…)",
    }),
  to_email: z
    .string()
    .email('Adresse email invalide')
    .optional()
    .or(z.literal('')),
  notify: z.boolean().optional(),
});

export type ShareCreateInput = z.infer<typeof shareCreateInputSchema>;

export interface ShareLink {
  token: string;
  url: string;
  kind: string;
  expires_at: string;
  revoked: boolean;
  access_count: number;
  max_access: number | null;
  created_at: string;
}

/**
 * Nettoie le payload avant envoi : les chaînes vides optionnelles sont omises
 * (l'API traite `to_phone`/`to_email` absents = pas de notification ciblée).
 */
function buildPayload(input: ShareCreateInput): ShareCreateInput {
  const payload: ShareCreateInput = {
    exam_type: input.exam_type,
    exam_id: input.exam_id,
  };

  if (input.document) payload.document = input.document;
  if (input.ttl_hours != null) payload.ttl_hours = input.ttl_hours;
  if (input.max_access != null) payload.max_access = input.max_access;
  if (input.to_phone) payload.to_phone = input.to_phone;
  if (input.to_email) payload.to_email = input.to_email;
  if (input.notify != null) payload.notify = input.notify;

  return payload;
}

// `silentErrors: true` : l'erreur est affichée inline dans le dialog, pas via le
// toast global de l'api-client.
export const createShareLink = (input: ShareCreateInput): Promise<ShareLink> =>
  api.post('/share/create/', buildPayload(input), { silentErrors: true });

export const useCreateShareLink = ({
  onSuccess,
}: {
  onSuccess?: (data: ShareLink) => void;
} = {}) =>
  useMutation({
    mutationFn: createShareLink,
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });
