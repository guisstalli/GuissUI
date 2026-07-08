import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { DjangoPaginatedResponse } from '@/types/api';

import type { ConversationListItem } from '../types';

export type ConversationListParams = {
  limit?: number;
  offset?: number;
};

/** Conversations de l'assistant (owner-only côté backend), triées par activité. */
export const getConversations = (
  params: ConversationListParams = {},
): Promise<DjangoPaginatedResponse<ConversationListItem>> =>
  api.get('/ai-reports/conversations/', { params });

export const getConversationsQueryOptions = (
  params: ConversationListParams = {},
) =>
  queryOptions({
    queryKey: ['ai-conversations', params],
    queryFn: () => getConversations(params),
  });

export const useConversations = ({
  params,
  enabled = true,
}: {
  params?: ConversationListParams;
  enabled?: boolean;
} = {}) => useQuery({ ...getConversationsQueryOptions(params ?? {}), enabled });
