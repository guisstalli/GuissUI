import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

type MarkAllReadResponse = {
  detail: string;
  count: number;
};

const markAllRead = (): Promise<MarkAllReadResponse> =>
  api.post<MarkAllReadResponse>('/api/v1/notifications/read-all/');

export const useMarkAllRead = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: () => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
      mutationConfig?.onSuccess?.();
    },
  });
};
