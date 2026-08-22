import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Proposal } from '../types';

export const retractProposal = ({
  id,
  reason,
}: {
  id: number;
  reason?: string;
}): Promise<Proposal> =>
  api.post(
    `/ai-reports/insights/proposals/${id}/retract/`,
    reason ? { reason } : {},
    { silentStatusCodes: [409] },
  );

export const useRetractProposal = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (proposal: Proposal) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retractProposal,
    onSuccess: (proposal) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      onSuccess?.(proposal);
    },
    onError,
  });
};
