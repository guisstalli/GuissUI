import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export const deleteSender = (senderId: number): Promise<void> =>
  api.delete(`/agent-channels/senders/${senderId}/`);

export const useDeleteSender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-channel-senders'] });
    },
  });
};
