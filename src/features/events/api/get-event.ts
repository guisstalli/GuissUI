import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export const getEvent = (eventId: number) => api.get(`/events/${eventId}/`);

export const useEvent = (eventId: number) =>
  useQuery({
    queryKey: ['events', eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
    staleTime: 30_000,
  });
