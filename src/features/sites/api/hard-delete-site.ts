import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

/**
 * Suppression DÉFINITIVE d'un site (admin uniquement).
 *
 * Distincte de `deleteSite`, qui ne fait que désactiver. Le backend refuse
 * (409) dès qu'un examen, un événement ou une facture référence le site :
 * supprimer effacerait le lieu de réalisation d'examens déjà validés.
 * Cas d'usage réel : retirer un site créé par erreur pour libérer son code.
 */
export const hardDeleteSite = ({ siteId }: { siteId: number }): Promise<void> =>
  api.delete(`/depistage/sites/${siteId}/hard-delete/`);

type UseHardDeleteSiteOptions = {
  mutationConfig?: MutationConfig<typeof hardDeleteSite>;
};

export const useHardDeleteSite = ({
  mutationConfig,
}: UseHardDeleteSiteOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: hardDeleteSite,
  });
};
