import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const deleteSite = ({ siteId }: { siteId: number }): Promise<void> => {
  return api.delete(`/api/v1/depistage/sites/${siteId}/`);
};

type UseDeleteSiteOptions = {
  mutationConfig?: MutationConfig<typeof deleteSite>;
};

export const useDeleteSite = ({
  mutationConfig,
}: UseDeleteSiteOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteSite,
  });
};
