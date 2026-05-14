'use client';

import { useMutation } from '@tanstack/react-query';

import { clientEnv } from '@/config/env';

interface RequestPasswordResetInput {
  email: string;
}

interface RequestPasswordResetResponse {
  detail: string;
}

const requestPasswordReset = async (
  data: RequestPasswordResetInput,
): Promise<RequestPasswordResetResponse> => {
  const response = await fetch(
    `${clientEnv.API_URL}/users/password/reset/request/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    let message = 'Une erreur est survenue. Veuillez réessayer.';
    try {
      const body = await response.json();
      if (typeof body?.detail === 'string') message = body.detail;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
};

export const useRequestPasswordReset = (options?: {
  onSuccess?: (data: RequestPasswordResetResponse) => void;
}) =>
  useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: options?.onSuccess,
  });
