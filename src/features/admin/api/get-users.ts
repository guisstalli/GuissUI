import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaginatedUsers } from '../types/schemas';

export type UsersQueryParams = {
  limit?: number;
  offset?: number;
  email?: string;
  role?: string;
  is_active?: boolean;
};

export const getUsersQueryOptions = (params?: UsersQueryParams) =>
  queryOptions<PaginatedUsers>({
    queryKey: ['users', params],
    queryFn: () => api.get('/users/', { params }),
  });

export const useUsers = (params?: UsersQueryParams) =>
  useQuery(getUsersQueryOptions(params));
