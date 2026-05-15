import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { BillingPreferences } from '../types/schemas';

const getBillingPreferences = (): Promise<BillingPreferences> =>
  api.get('/billing/preferences/');

export const getBillingPreferencesQueryOptions = () =>
  queryOptions({
    queryKey: ['billing-preferences'],
    queryFn: getBillingPreferences,
  });

export const useBillingPreferences = () =>
  useQuery(getBillingPreferencesQueryOptions());
