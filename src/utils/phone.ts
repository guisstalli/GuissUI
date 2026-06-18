import { isValidPhoneNumber } from 'react-phone-number-input';
import { z } from 'zod';

/**
 * Schéma Zod pour un numéro de téléphone **optionnel** au format E.164.
 *
 * Règle métier : `phone_number` est toujours optionnel.
 * - Vide / absent (`''`, `null`, `undefined`) → accepté, normalisé en `undefined`.
 * - Renseigné → doit être un numéro valide (format E.164, ex: `+221771234567`).
 *
 * @example
 * const schema = z.object({ phone_number: optionalPhoneSchema });
 */
export const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || isValidPhoneNumber(value), {
    message: 'Numéro de téléphone invalide',
  });
