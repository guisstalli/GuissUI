import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { CreateUserInput } from '../types/schemas';

export const useCreateUser = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      api.post('/users/admin/create/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess?.();
    },
  });
};
