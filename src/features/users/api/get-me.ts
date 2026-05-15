import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { User } from '../types/schemas';

export const getMeQueryOptions = () =>
  queryOptions<User>({
    queryKey: ['user-profile'],
    queryFn: () => api.get('/users/me/'),
  });

export const useGetMe = () => useQuery(getMeQueryOptions());
