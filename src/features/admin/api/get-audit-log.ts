import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AuditLog } from '../types/schemas';

export const getAuditLogQueryOptions = (userId: number) =>
  queryOptions<AuditLog[]>({
    queryKey: ['users', userId, 'audit-log'],
    queryFn: () => api.get(`/users/${userId}/audit-log/`),
    enabled: userId > 0,
  });

export const useAuditLog = (userId: number) =>
  useQuery(getAuditLogQueryOptions(userId));
