import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { RdvConfig } from '../types/schemas';

const updateConfig = (data: Partial<RdvConfig>): Promise<RdvConfig> =>
  api.put('/rendez-vous/config/update/', data);

export const useUpdateRdvConfig = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rdv-config'] });
      onSuccess?.();
    },
    onError,
  });
};
