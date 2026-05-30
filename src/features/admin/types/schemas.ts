import { z } from 'zod';

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

export const CreateUserSchema = z.object({
  email: z.string().email('Email invalide'),
  phone_number: z.string().min(8, 'Minimum 8 chiffres'),
  role: z.enum(
    ['ADMIN', 'STAFF', 'DOCTEUR', 'TECHNICIEN', 'DATA_ENTRY', 'SUPERUSER'],
    {
      errorMap: () => ({ message: 'Rôle requis' }),
    },
  ),
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
