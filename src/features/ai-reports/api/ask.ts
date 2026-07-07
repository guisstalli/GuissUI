import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AskResponse } from '../types';

/**
 * Question analytique libre (« chat »). Appel SYNCHRONE mais lent (10-40 s :
 * sélection d'outils + agrégats + vérification d'ancrage côté backend).
 *
 * - useMutation (jamais useQuery) : déclenché explicitement, pas de cache ni
 *   de refetch au focus — chaque question est un envoi volontaire.
 * - 429 (throttle 30/h) silencieux : l'erreur est affichée DANS le fil de
 *   conversation par l'appelant, pas en toast global.
 */
export const askQuestion = ({
  question,
  filters,
}: {
  question: string;
  filters?: Record<string, unknown>;
}): Promise<AskResponse> =>
  api.post(
    '/ai-reports/ask/',
    { question, filters: filters ?? {} },
    { silentStatusCodes: [429] },
  );

export const useAsk = ({
  mutationConfig,
}: {
  mutationConfig?: {
    onSuccess?: (response: AskResponse) => void;
    onError?: (error: Error) => void;
  };
} = {}) =>
  useMutation({
    mutationFn: askQuestion,
    onSuccess: (response) => {
      mutationConfig?.onSuccess?.(response);
    },
    onError: (error) => {
      mutationConfig?.onError?.(error);
    },
  });
