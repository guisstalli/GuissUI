import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaginatedDrivers } from '../types/schemas';

const getDeletedDrivers = (): Promise<PaginatedDrivers> =>
  api.get('/conducteurs/deleted/');

export const getDeletedDriversQueryOptions = () =>
  queryOptions({
    queryKey: ['drivers', 'deleted'],
    queryFn: getDeletedDrivers,
  });

export const useDeletedDrivers = () =>
  useQuery(getDeletedDriversQueryOptions());
