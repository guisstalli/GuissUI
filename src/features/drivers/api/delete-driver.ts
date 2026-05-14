import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

const deleteDriver = (id: number): Promise<void> =>
  api.delete(`/conducteurs/${id}/delete/`);

export const useDeleteDriver = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: () => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      mutationConfig?.onSuccess?.();
    },
  });
};
