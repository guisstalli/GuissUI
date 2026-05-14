import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Driver, DriverCreate } from '../types/schemas';

const createDriver = (data: DriverCreate): Promise<Driver> =>
  api.post('/conducteurs/create/', data);

export const useCreateDriver = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (driver: Driver) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDriver,
    onSuccess: (driver) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      mutationConfig?.onSuccess?.(driver);
    },
  });
};
