import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { Site } from '../types';

export const createSite = ({
  data,
}: {
  data: Omit<Site, 'id'>;
}): Promise<Site> => {
  return api.post('/api/v1/depistage/sites/', data);
};

type UseCreateSiteOptions = {
  mutationConfig?: MutationConfig<typeof createSite>;
};

export const useCreateSite = ({
  mutationConfig,
}: UseCreateSiteOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createSite,
  });
};
