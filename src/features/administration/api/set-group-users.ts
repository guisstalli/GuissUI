import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PermissionGroup } from '../types/schemas';

import { PERMISSION_GROUPS_QUERY_KEY } from './get-permission-groups';

/**
 * REMPLACE l'ensemble des membres du groupe (PUT).
 * Le backend renvoie le groupe mis à jour.
 */
export const setGroupUsers = ({
  groupId,
  userIds,
}: {
  groupId: number;
  userIds: number[];
}): Promise<PermissionGroup> =>
  api.put(`/users/permission-groups/${groupId}/users/`, {
    user_ids: userIds,
  });

export const useSetGroupUsers = ({
  onSuccess,
}: { onSuccess?: (group: PermissionGroup) => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setGroupUsers,
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_GROUPS_QUERY_KEY });
      onSuccess?.(group);
    },
  });
};
