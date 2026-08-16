import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PermissionGroup } from '../types/schemas';

import { PERMISSION_GROUPS_QUERY_KEY } from './get-permission-groups';

/**
 * REMPLACE l'ensemble des capacités du groupe (PUT).
 * Le backend renvoie le groupe mis à jour.
 */
export const setGroupCapabilities = ({
  groupId,
  capabilityCodes,
}: {
  groupId: number;
  capabilityCodes: string[];
}): Promise<PermissionGroup> =>
  api.put(`/users/permission-groups/${groupId}/capabilities/`, {
    capability_codes: capabilityCodes,
  });

export const useSetGroupCapabilities = ({
  onSuccess,
}: { onSuccess?: (group: PermissionGroup) => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setGroupCapabilities,
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_GROUPS_QUERY_KEY });
      onSuccess?.(group);
    },
  });
};
