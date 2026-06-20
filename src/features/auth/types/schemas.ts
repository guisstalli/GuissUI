import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token manquant'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const RequestPasswordResetInputSchema = z.object({
  email: z.string().email(),
});

export type RequestPasswordResetInput = z.infer<
  typeof RequestPasswordResetInputSchema
>;

export const ConfirmPasswordResetInputSchema = z.object({
  token: z.string().min(1),
  new_password: z.string().min(8),
});

export type ConfirmPasswordResetInput = z.infer<
  typeof ConfirmPasswordResetInputSchema
>;

export const PasswordResetResponseSchema = z.object({
  detail: z.string(),
});

export type PasswordResetResponse = z.infer<typeof PasswordResetResponseSchema>;
