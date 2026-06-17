'use client';

import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import {
  type ConfirmPasswordResetInput,
  type PasswordResetResponse,
} from '../types/schemas';

// Endpoint public (réinitialisation de mot de passe) : aucun token requis.
// Le client `api` n'impose pas l'auth — l'en-tête Authorization est simplement
// omis en l'absence de session.
const confirmPasswordReset = (
  data: ConfirmPasswordResetInput,
): Promise<PasswordResetResponse> =>
  api.post<PasswordResetResponse>('/users/password/reset/confirm/', data, {
    silentErrors: true,
  });

export const useConfirmPasswordReset = (options?: {
  onSuccess?: (data: PasswordResetResponse) => void;
}) =>
  useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: options?.onSuccess,
  });
