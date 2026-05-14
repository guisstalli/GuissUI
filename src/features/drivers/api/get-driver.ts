import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Driver } from '../types/schemas';

const getDriver = (driverId: number): Promise<Driver> =>
  api.get(`/conducteurs/${driverId}/`);

export const getDriverQueryOptions = (driverId: number) =>
  queryOptions({
    queryKey: ['drivers', driverId],
    queryFn: () => getDriver(driverId),
    enabled: !!driverId,
  });

export const useDriver = (driverId: number) =>
  useQuery(getDriverQueryOptions(driverId));
