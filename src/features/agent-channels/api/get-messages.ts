import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ChannelMessage } from '../types';

export const getChannelMessagesQueryOptions = () =>
  queryOptions<ChannelMessage[]>({
    queryKey: ['agent-channel-messages'],
    queryFn: () =>
      api.get('/agent-channels/messages/', { params: { limit: 50 } }),
    refetchInterval: 15_000, // journal quasi temps réel pendant les tests
  });

export const useChannelMessages = () =>
  useQuery(getChannelMessagesQueryOptions());
