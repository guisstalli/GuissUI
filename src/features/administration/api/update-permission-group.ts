import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PermissionGroup } from '../types/schemas';

import { PERMISSION_GROUPS_QUERY_KEY } from './get-permission-groups';

export type UpdatePermissionGroupInput = {
  name?: string;
  description?: string;
};

export const updatePermissionGroup = ({
  groupId,
  data,
}: {
  groupId: number;
  data: UpdatePermissionGroupInput;
}): Promise<PermissionGroup> =>
  api.patch(`/users/permission-groups/${groupId}/`, data);

export const useUpdatePermissionGroup = ({
  onSuccess,
}: { onSuccess?: (group: PermissionGroup) => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePermissionGroup,
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_GROUPS_QUERY_KEY });
      onSuccess?.(group);
    },
  });
};
