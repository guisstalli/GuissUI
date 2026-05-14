import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export const useChangePassword = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) =>
  useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.post('/users/password/change/', data),
    onSuccess,
  });
