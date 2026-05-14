import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

const hardDeleteDriver = (id: number): Promise<void> =>
  api.delete(`/conducteurs/${id}/hard-delete/`);

export const useHardDeleteDriver = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: () => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hardDeleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', 'deleted'] });
      mutationConfig?.onSuccess?.();
    },
  });
};
