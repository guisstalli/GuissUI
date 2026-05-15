import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { UnreadCount } from '../types/schemas';

const getUnreadCount = (): Promise<UnreadCount> =>
  api.get<UnreadCount>('/notifications/unread-count/');

export const getUnreadCountQueryOptions = () =>
  queryOptions({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });

export const useUnreadCount = () => useQuery(getUnreadCountQueryOptions());
