import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ConversationDetail } from '../types';

/** Fil complet d'une conversation (messages ordonnés). Étrangère → 404. */
export const getConversation = (
  conversationId: number,
): Promise<ConversationDetail> =>
  api.get(`/ai-reports/conversations/${conversationId}/`);

export const getConversationQueryOptions = (conversationId: number) =>
  queryOptions({
    queryKey: ['ai-conversations', 'detail', conversationId],
    queryFn: () => getConversation(conversationId),
  });

export const useConversation = (
  conversationId: number,
  { enabled = true }: { enabled?: boolean } = {},
) => useQuery({ ...getConversationQueryOptions(conversationId), enabled });
