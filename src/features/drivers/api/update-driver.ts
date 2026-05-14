import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Driver, DriverUpdate } from '../types/schemas';

const updateDriver = ({
  id,
  data,
}: {
  id: number;
  data: DriverUpdate;
}): Promise<Driver> => api.put(`/conducteurs/${id}/edit/`, data);

export const useUpdateDriver = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (driver: Driver) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDriver,
    onSuccess: (driver) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      mutationConfig?.onSuccess?.(driver);
    },
  });
};
