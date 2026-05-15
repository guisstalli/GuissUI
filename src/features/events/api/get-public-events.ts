import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaginatedEvents } from '../types/schemas';

interface GetPublicEventsParams {
  include_past?: boolean;
  type_examen?: string;
  limit?: number;
  offset?: number;
}

export const getPublicEvents = (
  params: GetPublicEventsParams = {},
): Promise<PaginatedEvents> =>
  api.get('/events/public/', {
    params: params as Record<
      string,
      string | number | boolean | undefined | null
    >,
  });

export const usePublicEvents = (params: GetPublicEventsParams = {}) =>
  useQuery({
    queryKey: ['events', 'public', params],
    queryFn: () => getPublicEvents(params),
    staleTime: 60_000,
  });
