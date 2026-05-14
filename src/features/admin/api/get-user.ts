import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { UserListItem } from '../types/schemas';

export const getUserQueryOptions = (id: number) =>
  queryOptions<UserListItem>({
    queryKey: ['users', id],
    queryFn: () => api.get(`/users/${id}/`),
  });

export const useUser = (id: number) => useQuery(getUserQueryOptions(id));
