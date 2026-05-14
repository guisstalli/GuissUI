import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export const useChangeEmailRequest = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) =>
  useMutation({
    mutationFn: (data: { new_email: string }) =>
      api.post('/users/email/change/request/', data),
    onSuccess,
  });
