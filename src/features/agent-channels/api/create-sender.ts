import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AllowedSender, CreateSenderFormValues } from '../types';

export const createSender = (
  data: CreateSenderFormValues,
): Promise<AllowedSender> => api.post('/agent-channels/senders/', data);

export const useCreateSender = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-channel-senders'] });
      onSuccess?.();
    },
  });
};
