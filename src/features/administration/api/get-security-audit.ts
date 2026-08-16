import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { DjangoPaginatedResponse } from '@/types/api';

import type { SecurityAuditEvent } from '../types/schemas';

export type SecurityAuditParams = {
  limit?: number;
  offset?: number;
  event?: string;
  user_id?: number;
  ip?: string;
  /** AAAA-MM-JJ */
  date_from?: string;
  /** AAAA-MM-JJ */
  date_to?: string;
};

export const getSecurityAudit = (
  params: SecurityAuditParams = {},
): Promise<DjangoPaginatedResponse<SecurityAuditEvent>> =>
  api.get('/users/security-audit/', { params });

export const getSecurityAuditQueryOptions = (
  params: SecurityAuditParams = {},
) =>
  queryOptions({
    queryKey: ['security-audit', params],
    queryFn: () => getSecurityAudit(params),
  });

export const useSecurityAudit = (params: SecurityAuditParams = {}) =>
  useQuery(getSecurityAuditQueryOptions(params));
