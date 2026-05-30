import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

interface GetInscriptionsParams {
  statut?: string;
  limit?: number;
  offset?: number;
}

export const getInscriptions = (
  eventId: number,
  params: GetInscriptionsParams = {},
) =>
  api.get(`/events/${eventId}/inscriptions/`, {
    params: params as Record<string, string | number | undefined>,
  });

export const useInscriptions = (
  eventId: number,
  params: GetInscriptionsParams = {},
) =>
  useQuery({
    queryKey: ['events', eventId, 'inscriptions', params],
    queryFn: () => getInscriptions(eventId, params),
    enabled: !!eventId,
    staleTime: 15_000,
  });

export const getEventStats = (eventId: number) =>
  api.get(`/events/${eventId}/statistiques/`);

export const useEventStats = (eventId: number) =>
  useQuery({
    queryKey: ['events', eventId, 'stats'],
    queryFn: () => getEventStats(eventId),
    enabled: !!eventId,
    staleTime: 15_000,
  });
