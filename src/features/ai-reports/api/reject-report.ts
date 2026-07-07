import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ReportDetail } from '../types';

export const rejectReport = ({
  reportId,
  reason,
}: {
  reportId: number;
  reason: string;
}): Promise<ReportDetail> =>
  api.post(`/ai-reports/${reportId}/reject/`, { reason });

export const useRejectReport = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (report: ReportDetail) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectReport,
    onSuccess: (report, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['ai-reports', 'detail', variables.reportId],
      });
      queryClient.invalidateQueries({ queryKey: ['ai-reports'] });
      mutationConfig?.onSuccess?.(report);
    },
  });
};
