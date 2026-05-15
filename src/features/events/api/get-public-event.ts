import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { EventPublic } from '../types/schemas';

export const getPublicEvent = (slug: string): Promise<EventPublic> =>
  api.get(`/events/public/${slug}/`);

export const usePublicEvent = (slug: string) =>
  useQuery({
    queryKey: ['events', 'public', slug],
    queryFn: () => getPublicEvent(slug),
    staleTime: 30_000,
    enabled: !!slug,
  });
