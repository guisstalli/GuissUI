import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Dashboard } from '../types/schemas';

const getDashboard = (): Promise<Dashboard> => api.get('/api/v1/dashboard/');

export const getDashboardQueryOptions = () =>
  queryOptions({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 60_000,
  });

export const useDashboard = () => useQuery(getDashboardQueryOptions());
