import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ReportDetail } from '../types';

export type DeliverChannels = ('email' | 'whatsapp')[];

/** Diffuse un rapport APPROUVÉ (seul statut livrable côté backend). */
export const deliverReport = ({
  reportId,
  channels,
  recipients,
}: {
  reportId: number;
  channels: DeliverChannels;
  recipients?: { email?: string[]; whatsapp?: string[] };
}): Promise<ReportDetail> =>
  api.post(`/ai-reports/${reportId}/deliver/`, {
    channels,
    recipients: recipients ?? {},
  });

export const useDeliverReport = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (report: ReportDetail) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliverReport,
    onSuccess: (report, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['ai-reports', 'detail', variables.reportId],
      });
      queryClient.invalidateQueries({ queryKey: ['ai-reports'] });
      mutationConfig?.onSuccess?.(report);
    },
  });
};
