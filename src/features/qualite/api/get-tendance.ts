import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PointTendance } from '../types/types';

type Periode = { dateDebut: string; dateFin: string };

export const getTendance = (periode: Periode): Promise<PointTendance[]> =>
  api.get<PointTendance[]>(
    `/analytics/qualite/tendance/?date_debut=${periode.dateDebut}&date_fin=${periode.dateFin}`,
  );

export const getTendanceQueryOptions = (periode: Periode) =>
  queryOptions({
    queryKey: ['qualite', 'tendance', periode],
    queryFn: () => getTendance(periode),
  });

export const useTendance = (periode: Periode, enabled = true) =>
  useQuery({ ...getTendanceQueryOptions(periode), enabled });
