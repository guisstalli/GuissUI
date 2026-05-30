import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ClinicSettings } from '../types/schemas';

const getClinicSettings = (): Promise<ClinicSettings> =>
  api.get('/clinic/settings/');

export const getClinicSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ['clinic', 'settings'],
    queryFn: getClinicSettings,
  });

export const useClinicSettings = () =>
  useQuery(getClinicSettingsQueryOptions());
