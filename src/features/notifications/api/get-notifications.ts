import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaginatedNotifications } from '../types/schemas';

type GetNotificationsParams = {
  is_read?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
};

const getNotifications = (
  params: GetNotificationsParams = {},
): Promise<PaginatedNotifications> => {
  const searchParams = new URLSearchParams();

  if (params.is_read !== undefined) {
    searchParams.set('is_read', String(params.is_read));
  }
  if (params.category) {
    searchParams.set('category', params.category);
  }
  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    searchParams.set('offset', String(params.offset));
  }

  const qs = searchParams.toString();
  const url = qs ? `/api/v1/notifications/?${qs}` : '/api/v1/notifications/';

  return api.get<PaginatedNotifications>(url);
};

export const getNotificationsQueryOptions = (
  params: GetNotificationsParams = {},
) =>
  queryOptions({
    queryKey: ['notifications', params],
    queryFn: () => getNotifications(params),
  });

type UseNotificationsOptions = {
  params?: GetNotificationsParams;
  enabled?: boolean;
};

export const useNotifications = ({
  params = { is_read: false, limit: 20 },
  enabled = true,
}: UseNotificationsOptions = {}) =>
  useQuery({
    ...getNotificationsQueryOptions(params),
    enabled,
  });
