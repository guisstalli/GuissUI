import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaginatedDrivers } from '../types/schemas';

export type DriversQueryParams = {
  limit?: number;
  offset?: number;
  at_risk?: boolean;
  service?: string;
  zone_de_residence?: string;
  type_permis?: string;
  transporteur_professionnel?: boolean;
};

const getDrivers = (params?: DriversQueryParams): Promise<PaginatedDrivers> =>
  api.get('/conducteurs/', { params });

export const getDriversQueryOptions = (params?: DriversQueryParams) =>
  queryOptions({
    queryKey: ['drivers', params],
    queryFn: () => getDrivers(params),
  });

export const useDrivers = ({ params }: { params?: DriversQueryParams } = {}) =>
  useQuery(getDriversQueryOptions(params));
