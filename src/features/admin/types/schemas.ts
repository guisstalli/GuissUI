import { z } from 'zod';

import { optionalPhoneSchema } from '@/utils/phone';

export const UserListItemSchema = z.object({
  id: z.number(),
  email: z.string(),
  phone_number: z.string(),
  role: z.enum([
    'ADMIN',
    'STAFF',
    'DOCTEUR',
    'TECHNICIEN',
    'DATA_ENTRY',
    'SUPERUSER',
  ]),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  is_admin: z.boolean(),
  date_joined: z.string(),
  user_profile: z
    .object({
      first_name: z.string(),
      last_name: z.string(),
      title: z.string(),
      avatar: z.string().nullable(),
    })
    .nullable(),
});

export const PaginatedUsersSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(UserListItemSchema),
});

/**
 * Rôles réellement créables via l'API.
 *
 * Le backend (`user_create_by_admin`) refuse tout autre rôle : « ne peut créer
 * que des comptes staff, admin, docteur ou technicien ». SUPERUSER en est exclu
 * pour empêcher une escalade de privilèges depuis l'interface — il se crée en
 * ligne de commande. Le schéma acceptait les six rôles, soit deux valeurs qui
 * produisaient un 400 côté serveur.
 */
export const CREATABLE_ROLES = [
  'STAFF',
  'DOCTEUR',
  'TECHNICIEN',
  'ADMIN',
] as const;

export const CreateUserSchema = z.object({
  email: z.string().email('Email invalide'),
  phone_number: optionalPhoneSchema,
  role: z.enum(CREATABLE_ROLES, {
    errorMap: () => ({ message: 'Rôle requis' }),
  }),
  first_name: z.string().min(1, 'Requis'),
  last_name: z.string().min(1, 'Requis'),
  title: z.enum(['MR', 'MRS', '']).optional(),
});

export const AuditLogSchema = z.object({
  event: z.string(),
  ip_address: z.string().nullable(),
  metadata: z.record(z.unknown()),
  created_at: z.string(),
});

export type UserListItem = z.infer<typeof UserListItemSchema>;
export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
