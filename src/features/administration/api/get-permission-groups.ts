import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PermissionGroup } from '../types/schemas';

/** Clé de cache partagée — invalidée après chaque mutation de groupe. */
export const PERMISSION_GROUPS_QUERY_KEY = ['permission-groups'] as const;

export const getPermissionGroups = (): Promise<PermissionGroup[]> =>
  api.get('/users/permission-groups/');

export const getPermissionGroupsQueryOptions = () =>
  queryOptions({
    queryKey: PERMISSION_GROUPS_QUERY_KEY,
    queryFn: getPermissionGroups,
  });

export const usePermissionGroups = () =>
  useQuery(getPermissionGroupsQueryOptions());
