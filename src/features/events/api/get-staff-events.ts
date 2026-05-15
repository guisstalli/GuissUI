import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

interface GetStaffEventsParams {
  statut?: string;
  pour_conducteurs?: boolean;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export const getStaffEvents = (params: GetStaffEventsParams = {}) =>
  api.get('/events/', {
    params: params as Record<
      string,
      string | number | boolean | undefined | null
    >,
  });

export const useStaffEvents = (params: GetStaffEventsParams = {}) =>
  useQuery({
    queryKey: ['events', 'staff', params],
    queryFn: () => getStaffEvents(params),
    staleTime: 30_000,
  });
