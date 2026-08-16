import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AllowedSender } from '../types';

type UpdateSenderInput = {
  senderId: number;
  can_chat?: boolean;
  can_trigger_actions?: boolean;
};

export const updateSender = ({
  senderId,
  ...data
}: UpdateSenderInput): Promise<AllowedSender> =>
  api.patch(`/agent-channels/senders/${senderId}/`, data);

export const useUpdateSender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-channel-senders'] });
    },
  });
};
