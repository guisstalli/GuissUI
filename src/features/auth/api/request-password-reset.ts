'use client';

import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import {
  type PasswordResetResponse,
  type RequestPasswordResetInput,
} from '../types/schemas';

// Endpoint public (demande de réinitialisation de mot de passe) : aucun token
// requis. Le client `api` n'impose pas l'auth — l'en-tête Authorization est
// simplement omis en l'absence de session.
const requestPasswordReset = (
  data: RequestPasswordResetInput,
): Promise<PasswordResetResponse> =>
  api.post<PasswordResetResponse>('/users/password/reset/request/', data, {
    silentErrors: true,
  });

export const useRequestPasswordReset = (options?: {
  onSuccess?: (data: PasswordResetResponse) => void;
}) =>
  useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: options?.onSuccess,
  });
