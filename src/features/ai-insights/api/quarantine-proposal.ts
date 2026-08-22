import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Proposal } from '../types';

export const quarantineProposal = ({
  id,
  reason,
}: {
  id: number;
  reason: string;
}): Promise<Proposal> =>
  api.post(`/ai-reports/insights/proposals/${id}/quarantine/`, { reason });

export const useQuarantineProposal = ({
  onSuccess,
}: {
  onSuccess?: (proposal: Proposal) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quarantineProposal,
    onSuccess: (proposal) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      onSuccess?.(proposal);
    },
  });
};
