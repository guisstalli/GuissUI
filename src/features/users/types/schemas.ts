import { z } from 'zod';

export const UserProfileSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  title: z.enum(['MR', 'MME', 'MLLE', '']),
  avatar: z.string().nullable(),
  birthdate: z.string().nullable(),
  mobile: z.string(),
});

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  phone_number: z.string(),
  role: z.enum(['ADMIN', 'STAFF', 'DOCTEUR', 'TECHNICIEN']),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  is_admin: z.boolean(),
  is_staff: z.boolean(),
  profile: UserProfileSchema.nullable(),
});

export const UpdateMeSchema = z.object({
  first_name: z.string().min(1, 'Requis').optional(),
  last_name: z.string().min(1, 'Requis').optional(),
  title: z.enum(['MR', 'MME', 'MLLE', '']).optional(),
});

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Requis'),
    new_password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.new_password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const ChangeEmailRequestSchema = z.object({
  new_email: z.string().email('Email invalide'),
});

export const ChangeEmailConfirmSchema = z.object({
  otp: z.string().regex(/^\d{3} \d{3}$/, 'Format requis : 123 456'),
});

export type User = z.infer<typeof UserSchema>;
export type UpdateMeInput = z.infer<typeof UpdateMeSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ChangeEmailRequestInput = z.infer<typeof ChangeEmailRequestSchema>;
export type ChangeEmailConfirmInput = z.infer<typeof ChangeEmailConfirmSchema>;
