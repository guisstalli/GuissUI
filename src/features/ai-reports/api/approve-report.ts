import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ReportDetail } from '../types';

/** Approuve un rapport DRAFT — un DOCX relu/édité peut remplacer le généré. */
export const approveReport = ({
  reportId,
  editedDocx,
}: {
  reportId: number;
  editedDocx?: File;
}): Promise<ReportDetail> => {
  if (editedDocx) {
    const formData = new FormData();
    formData.append('edited_docx', editedDocx);
    return api.upload(`/ai-reports/${reportId}/approve/`, formData);
  }
  return api.post(`/ai-reports/${reportId}/approve/`, {});
};

export const useApproveReport = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (report: ReportDetail) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveReport,
    onSuccess: (report, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['ai-reports', 'detail', variables.reportId],
      });
      queryClient.invalidateQueries({ queryKey: ['ai-reports'] });
      mutationConfig?.onSuccess?.(report);
    },
  });
};
