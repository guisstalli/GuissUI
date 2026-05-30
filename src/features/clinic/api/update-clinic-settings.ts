import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ClinicSettings } from '../types/schemas';

const updateClinicSettings = (data: FormData): Promise<ClinicSettings> =>
  api.patch('/clinic/settings/update/', data, { isFormData: true });

export const useUpdateClinicSettings = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateClinicSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clinic', 'settings'] });
      onSuccess?.();
    },
    onError,
  });
};
