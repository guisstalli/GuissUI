import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ChatResponse } from '../types';

type ChatInput = {
  question: string;
  filters?: Record<string, unknown>;
  conversation_id?: number;
  /** Pièces jointes (images → vision, documents → texte extrait) — max 5 × 8 Mo */
  attachments?: File[];
};

/**
 * Assistant analytique AGENTIQUE (`POST /ai-reports/chat/`) — remplace /ask :
 * l'agent choisit et ENCHAÎNE les outils (boucle ReAct) et retourne sa
 * trajectoire (pas → outils → erreurs auto-corrigées).
 *
 * - Appel synchrone mais lent (jusqu'à ~60 s : plusieurs tours d'outils).
 * - Multipart uniquement si pièces jointes ; `filters` sérialisé en JSON
 *   (le serializer backend re-parse la chaîne).
 * - 429 (throttle) silencieux : l'erreur est affichée DANS le fil.
 */
export const postChat = ({
  question,
  filters,
  conversation_id,
  attachments,
}: ChatInput): Promise<ChatResponse> => {
  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('filters', JSON.stringify(filters ?? {}));
    if (conversation_id !== undefined) {
      formData.append('conversation_id', String(conversation_id));
    }
    for (const file of attachments) {
      formData.append('attachments', file);
    }
    return api.upload('/ai-reports/chat/', formData, {
      silentStatusCodes: [429],
    });
  }

  return api.post(
    '/ai-reports/chat/',
    {
      question,
      filters: filters ?? {},
      ...(conversation_id !== undefined ? { conversation_id } : {}),
    },
    { silentStatusCodes: [429] },
  );
};

export const useChat = ({
  mutationConfig,
}: {
  mutationConfig?: {
    onSuccess?: (response: ChatResponse) => void;
    onError?: (error: Error) => void;
  };
} = {}) =>
  useMutation({
    mutationFn: postChat,
    onSuccess: (response) => {
      mutationConfig?.onSuccess?.(response);
    },
    onError: (error) => {
      mutationConfig?.onError?.(error);
    },
  });
