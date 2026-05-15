import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

const deletePrestation = (id: number): Promise<void> =>
  api.delete(`/billing/prestations/${id}/delete/`);

export const useDeletePrestation = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePrestation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prestations'] });
      onSuccess?.();
    },
    onError,
  });
};
