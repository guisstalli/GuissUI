import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ReminderConfig } from '../types/schemas';

const getReminderConfig = (): Promise<ReminderConfig> =>
  api.get('/rendez-vous/config/rappels/');

export const getReminderConfigQueryOptions = () =>
  queryOptions({ queryKey: ['reminder-config'], queryFn: getReminderConfig });

export const useReminderConfig = () =>
  useQuery(getReminderConfigQueryOptions());
