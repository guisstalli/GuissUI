import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type {
  PaginatedExamenAdultList,
  ExamenAdultDetailApi,
  ExamsQueryParams,
} from '../../types';

/**
 * Récupère la liste paginée des examens adulte
 */
export const getAdultExams = (
  params?: ExamsQueryParams,
): Promise<PaginatedExamenAdultList> => {
  return api.get<PaginatedExamenAdultList>(
    '/api/v1/depistage/examens/adultes/',
    {
      params,
    },
  );
};

/**
 * Query options pour la liste des examens adulte
 */
export const getAdultExamsQueryOptions = (params?: ExamsQueryParams) => {
  return queryOptions({
    queryKey: ['exams', 'adult', params],
    queryFn: () => getAdultExams(params),
  });
};

type UseAdultExamsOptions = {
  params?: ExamsQueryParams;
  enabled?: boolean;
};

/**
 * Hook React Query pour récupérer la liste des examens adulte
 */
export const useAdultExams = ({
  params,
  enabled = true,
}: UseAdultExamsOptions = {}) => {
  return useQuery({
    ...getAdultExamsQueryOptions(params),
    enabled,
  });
};

/**
 * Récupère un examen adulte par son ID
 */
export const getAdultExam = (id: number): Promise<ExamenAdultDetailApi> => {
  return api.get<ExamenAdultDetailApi>(
    `/api/v1/depistage/examens/adultes/${id}/`,
  );
};

/**
 * Query options pour un examen adulte
 */
export const getAdultExamQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ['exams', 'adult', id],
    queryFn: () => getAdultExam(id),
    enabled: !!id,
  });
};

type UseAdultExamOptions = {
  id: number;
  enabled?: boolean;
};

/**
 * Hook React Query pour récupérer un examen adulte
 */
export const useAdultExam = ({ id, enabled = true }: UseAdultExamOptions) => {
  return useQuery({
    ...getAdultExamQueryOptions(id),
    enabled: enabled && !!id,
  });
};

/**
 * Récupère les examens adulte d'un patient
 */
export const getAdultExamsByPatient = (
  patientId: number,
): Promise<PaginatedExamenAdultList> => {
  return api.get<PaginatedExamenAdultList>(
    `/api/v1/depistage/examens/adultes/by-patient/${patientId}/`,
  );
};

export const getAdultExamsByPatientQueryOptions = (patientId: number) => {
  return queryOptions({
    queryKey: ['exams', 'adult', 'by-patient', patientId],
    queryFn: () => getAdultExamsByPatient(patientId),
    enabled: !!patientId,
  });
};

export const useAdultExamsByPatient = (patientId: number, enabled = true) => {
  return useQuery({
    ...getAdultExamsByPatientQueryOptions(patientId),
    enabled: enabled && !!patientId,
  });
};

/**
 * Récupère les examens adulte incomplets
 */
export const getIncompleteAdultExams =
  (): Promise<PaginatedExamenAdultList> => {
    return api.get<PaginatedExamenAdultList>(
      '/api/v1/depistage/examens/adultes/incomplete/',
    );
  };

export const getIncompleteAdultExamsQueryOptions = () => {
  return queryOptions({
    queryKey: ['exams', 'adult', 'incomplete'],
    queryFn: () => getIncompleteAdultExams(),
  });
};

export const useIncompleteAdultExams = (enabled = true) => {
  return useQuery({
    ...getIncompleteAdultExamsQueryOptions(),
    enabled,
  });
};

/**
 * Récupère le statut de complétion d'un examen adulte
 */
export const getAdultExamStatus = (
  id: number,
): Promise<ExamenAdultDetailApi> => {
  return api.get<ExamenAdultDetailApi>(
    `/api/v1/depistage/examens/adultes/${id}/status/`,
  );
};

export const getAdultExamStatusQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ['exams', 'adult', id, 'status'],
    queryFn: () => getAdultExamStatus(id),
    enabled: !!id,
  });
};

export const useAdultExamStatus = (id: number, enabled = true) => {
  return useQuery({
    ...getAdultExamStatusQueryOptions(id),
    enabled: enabled && !!id,
  });
};
