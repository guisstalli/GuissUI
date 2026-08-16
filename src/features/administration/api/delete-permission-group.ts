import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import { PERMISSION_GROUPS_QUERY_KEY } from './get-permission-groups';

/**
 * Supprime un groupe. Le backend renvoie 400 si le groupe est système
 * (is_system) — l'erreur est remontée telle quelle à l'appelant.
 */
export const deletePermissionGroup = (groupId: number): Promise<void> =>
  api.delete(`/users/permission-groups/${groupId}/`);

export const useDeletePermissionGroup = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePermissionGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_GROUPS_QUERY_KEY });
      onSuccess?.();
    },
  });
};
