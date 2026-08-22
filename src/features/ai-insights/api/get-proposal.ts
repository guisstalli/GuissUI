import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Proposal } from '../types';

export const getProposal = (id: number): Promise<Proposal> =>
  api.get(`/ai-reports/insights/proposals/${id}/`);

export const getProposalQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['ai-insights', 'proposals', id],
    queryFn: () => getProposal(id),
  });

export const useProposal = (id: number) =>
  useQuery(getProposalQueryOptions(id));
