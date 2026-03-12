import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { Site } from '../types';

export const updateSite = ({
  siteId,
  data,
}: {
  siteId: number;
  data: Partial<Site>;
}): Promise<Site> => {
  return api.patch(`/api/v1/depistage/sites/${siteId}/`, data);
};

type UseUpdateSiteOptions = {
  mutationConfig?: MutationConfig<typeof updateSite>;
};

export const useUpdateSite = ({
  mutationConfig,
}: UseUpdateSiteOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateSite,
  });
};
