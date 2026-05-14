import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { EventCreateInput } from '../types/schemas';

export const createEvent = (data: EventCreateInput) =>
  api.post('/events/creer/', data);

export const useCreateEvent = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onSuccess?.();
    },
  });
};
