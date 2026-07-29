import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { Site } from '../types';

/**
 * Réactive un site précédemment désactivé.
 *
 * L'endpoint existait côté backend mais n'était exposé nulle part dans
 * l'interface : un site désactivé restait donc inactif définitivement, et son
 * `code` — unique — restait pris. On en recréait un autre.
 */
export const reactivateSite = ({ siteId }: { siteId: number }): Promise<Site> =>
  api.post(`/depistage/sites/${siteId}/reactivate/`);

type UseReactivateSiteOptions = {
  mutationConfig?: MutationConfig<typeof reactivateSite>;
};

export const useReactivateSite = ({
  mutationConfig,
}: UseReactivateSiteOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: reactivateSite,
  });
};
