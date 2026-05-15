import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ReminderConfig } from '../types/schemas';

const updateReminderConfig = (
  data: Partial<ReminderConfig>,
): Promise<ReminderConfig> => api.put('/rendez-vous/config/rappels/', data);

export const useUpdateReminderConfig = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateReminderConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminder-config'] });
      onSuccess?.();
    },
    onError,
  });
};
