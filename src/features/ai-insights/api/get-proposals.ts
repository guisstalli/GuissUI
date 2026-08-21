import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { DjangoPaginatedResponse } from '@/types/api';

import type { Proposal, ProposalStatus } from '../types';

export type ProposalListParams = {
  limit?: number;
  offset?: number;
  status?: ProposalStatus | '';
};

export const getProposals = (
  params: ProposalListParams = {},
): Promise<DjangoPaginatedResponse<Proposal>> =>
  api.get('/ai-reports/insights/proposals/', { params });

export const getProposalsQueryOptions = (params: ProposalListParams = {}) =>
  queryOptions({
    queryKey: ['ai-insights', 'proposals', params],
    queryFn: () => getProposals(params),
  });

export const useProposals = (params: ProposalListParams = {}) =>
  useQuery(getProposalsQueryOptions(params));
