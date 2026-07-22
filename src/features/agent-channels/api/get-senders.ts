import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AllowedSender } from '../types';

export const getSendersQueryOptions = () =>
  queryOptions<AllowedSender[]>({
    queryKey: ['agent-channel-senders'],
    queryFn: () => api.get('/agent-channels/senders/'),
  });

export const useSenders = () => useQuery(getSendersQueryOptions());
