import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

type MarkReadResponse = {
  detail: string;
};

const markRead = (id: number): Promise<MarkReadResponse> =>
  api.post<MarkReadResponse>(`/api/v1/notifications/${id}/read/`);

export const useMarkRead = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: () => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
      mutationConfig?.onSuccess?.();
    },
  });
};
