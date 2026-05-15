'use client';

import { useMutation } from '@tanstack/react-query';

import { clientEnv } from '@/config/env';

interface ConfirmPasswordResetInput {
  token: string;
  new_password: string;
}

interface ConfirmPasswordResetResponse {
  detail: string;
}

const confirmPasswordReset = async (
  data: ConfirmPasswordResetInput,
): Promise<ConfirmPasswordResetResponse> => {
  const response = await fetch(
    `${clientEnv.API_URL}/users/password/reset/confirm/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    let message = 'Le lien de réinitialisation est invalide ou expiré.';
    try {
      const body = await response.json();
      if (typeof body?.detail === 'string') message = body.detail;
      else if (Array.isArray(body?.new_password))
        message = body.new_password.join(' ');
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
};

export const useConfirmPasswordReset = (options?: {
  onSuccess?: (data: ConfirmPasswordResetResponse) => void;
}) =>
  useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: options?.onSuccess,
  });
