import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PermissionGroup } from '../types/schemas';

import { PERMISSION_GROUPS_QUERY_KEY } from './get-permission-groups';

export type CreatePermissionGroupInput = {
  name: string;
  description?: string;
  capability_codes?: string[];
  user_ids?: number[];
};

export const createPermissionGroup = (
  data: CreatePermissionGroupInput,
): Promise<PermissionGroup> => api.post('/users/permission-groups/', data);

export const useCreatePermissionGroup = ({
  onSuccess,
}: { onSuccess?: (group: PermissionGroup) => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPermissionGroup,
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_GROUPS_QUERY_KEY });
      onSuccess?.(group);
    },
  });
};
