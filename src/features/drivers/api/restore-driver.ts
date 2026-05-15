import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Driver } from '../types/schemas';

const restoreDriver = (id: number): Promise<Driver> =>
  api.post(`/conducteurs/${id}/restore/`);

export const useRestoreDriver = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: () => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      mutationConfig?.onSuccess?.();
    },
  });
};
