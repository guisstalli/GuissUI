import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaginatedPatientsResponse, PatientsQueryParams } from '../types';

/**
 * Récupère la liste paginée des patients
 */
export const getPatients = (
  params?: PatientsQueryParams,
): Promise<PaginatedPatientsResponse> => {
  return api.get<PaginatedPatientsResponse>('/api/v1/depistage/patients/', {
    params,
  });
};

/**
 * Query options pour la liste des patients
 */
export const getPatientsQueryOptions = (params?: PatientsQueryParams) => {
  return queryOptions({
    queryKey: ['patients', params],
    queryFn: () => getPatients(params),
  });
};

type UsePatientsOptions = {
  params?: PatientsQueryParams;
  enabled?: boolean;
};

/**
 * Hook React Query pour récupérer la liste des patients
 */
export const usePatients = ({
  params,
  enabled = true,
}: UsePatientsOptions = {}) => {
  return useQuery({
    ...getPatientsQueryOptions(params),
    enabled,
  });
};

/**
 * Récupère les patients adultes uniquement
 */
export const getAdultPatients = (): Promise<PaginatedPatientsResponse> => {
  return api.get<PaginatedPatientsResponse>(
    '/api/v1/depistage/patients/adults/',
  );
};

export const getAdultPatientsQueryOptions = () => {
  return queryOptions({
    queryKey: ['patients', 'adults'],
    queryFn: () => getAdultPatients(),
  });
};

export const useAdultPatients = (enabled = true) => {
  return useQuery({
    ...getAdultPatientsQueryOptions(),
    enabled,
  });
};

/**
 * Récupère les patients enfants uniquement
 */
export const getChildPatients = (): Promise<PaginatedPatientsResponse> => {
  return api.get<PaginatedPatientsResponse>(
    '/api/v1/depistage/patients/children/',
  );
};

export const getChildPatientsQueryOptions = () => {
  return queryOptions({
    queryKey: ['patients', 'children'],
    queryFn: () => getChildPatients(),
  });
};

export const useChildPatients = (enabled = true) => {
  return useQuery({
    ...getChildPatientsQueryOptions(),
    enabled,
  });
};

/**
 * Récupère les patients supprimés (soft-deleted)
 */
export const getDeletedPatients = (): Promise<PaginatedPatientsResponse> => {
  return api.get<PaginatedPatientsResponse>(
    '/api/v1/depistage/patients/deleted/',
  );
};

export const getDeletedPatientsQueryOptions = () => {
  return queryOptions({
    queryKey: ['patients', 'deleted'],
    queryFn: () => getDeletedPatients(),
  });
};

export const useDeletedPatients = (enabled = true) => {
  return useQuery({
    ...getDeletedPatientsQueryOptions(),
    enabled,
  });
};
