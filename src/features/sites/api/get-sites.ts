import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import { SiteListResponse } from '../types';

export const getSites = ({
  params,
}: {
  params?: {
    search?: string;
    limit?: number;
    offset?: number;
  };
} = {}): Promise<SiteListResponse> => {
  return api.get('/api/v1/depistage/sites/', { params });
};

export const getSitesQueryOptions = (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  return queryOptions({
    queryKey: ['sites', params],
    queryFn: () => getSites({ params }),
  });
};

type UseSitesOptions = {
  params?: {
    search?: string;
    limit?: number;
    offset?: number;
  };
};

export const useSites = ({ params }: UseSitesOptions = {}) => {
  return useQuery(getSitesQueryOptions(params));
};
