import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AdminDashboard, DashboardWindow } from '../types/schemas';

export const getAdminDashboard = (
  days: DashboardWindow,
): Promise<AdminDashboard> =>
  api.get('/analytics/admin-dashboard/', { params: { days } });

export const getAdminDashboardQueryOptions = (days: DashboardWindow) =>
  queryOptions({
    queryKey: ['admin-dashboard', days],
    queryFn: () => getAdminDashboard(days),
  });

export const useAdminDashboard = (days: DashboardWindow) =>
  useQuery(getAdminDashboardQueryOptions(days));
