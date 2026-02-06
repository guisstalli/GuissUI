import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type {
  PaginatedExamenChildList,
  ExamenChildDetailApi,
  ExamsQueryParams,
} from '../../types';

/**
 * Récupère la liste paginée des examens enfant
 */
export const getChildExams = (
  params?: ExamsQueryParams,
): Promise<PaginatedExamenChildList> => {
  return api.get<PaginatedExamenChildList>(
    '/api/v1/depistage/examens/enfants/',
    {
      params,
    },
  );
};

/**
 * Query options pour la liste des examens enfant
 */
export const getChildExamsQueryOptions = (params?: ExamsQueryParams) => {
  return queryOptions({
    queryKey: ['exams', 'child', params],
    queryFn: () => getChildExams(params),
  });
};

type UseChildExamsOptions = {
  params?: ExamsQueryParams;
  enabled?: boolean;
};

/**
 * Hook React Query pour récupérer la liste des examens enfant
 */
export const useChildExams = ({
  params,
  enabled = true,
}: UseChildExamsOptions = {}) => {
  return useQuery({
    ...getChildExamsQueryOptions(params),
    enabled,
  });
};

/**
 * Récupère un examen enfant par son ID
 */
export const getChildExam = (id: number): Promise<ExamenChildDetailApi> => {
  return api.get<ExamenChildDetailApi>(
    `/api/v1/depistage/examens/enfants/${id}/`,
  );
};

/**
 * Query options pour un examen enfant
 */
export const getChildExamQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ['exams', 'child', id],
    queryFn: () => getChildExam(id),
    enabled: !!id,
  });
};

type UseChildExamOptions = {
  id: number;
  enabled?: boolean;
};

/**
 * Hook React Query pour récupérer un examen enfant
 */
export const useChildExam = ({ id, enabled = true }: UseChildExamOptions) => {
  return useQuery({
    ...getChildExamQueryOptions(id),
    enabled: enabled && !!id,
  });
};

/**
 * Récupère les examens enfant d'un patient
 */
export const getChildExamsByPatient = (
  patientId: number,
): Promise<PaginatedExamenChildList> => {
  return api.get<PaginatedExamenChildList>(
    `/api/v1/depistage/examens/enfants/by-patient/${patientId}/`,
  );
};

export const getChildExamsByPatientQueryOptions = (patientId: number) => {
  return queryOptions({
    queryKey: ['exams', 'child', 'by-patient', patientId],
    queryFn: () => getChildExamsByPatient(patientId),
    enabled: !!patientId,
  });
};

export const useChildExamsByPatient = (patientId: number, enabled = true) => {
  return useQuery({
    ...getChildExamsByPatientQueryOptions(patientId),
    enabled: enabled && !!patientId,
  });
};

/**
 * Récupère les examens enfant incomplets
 */
export const getIncompleteChildExams =
  (): Promise<PaginatedExamenChildList> => {
    return api.get<PaginatedExamenChildList>(
      '/api/v1/depistage/examens/enfants/incomplete/',
    );
  };

export const getIncompleteChildExamsQueryOptions = () => {
  return queryOptions({
    queryKey: ['exams', 'child', 'incomplete'],
    queryFn: () => getIncompleteChildExams(),
  });
};

export const useIncompleteChildExams = (enabled = true) => {
  return useQuery({
    ...getIncompleteChildExamsQueryOptions(),
    enabled,
  });
};

/**
 * Récupère le statut de complétion d'un examen enfant
 */
export const getChildExamStatus = (
  id: number,
): Promise<ExamenChildDetailApi> => {
  return api.get<ExamenChildDetailApi>(
    `/api/v1/depistage/examens/enfants/${id}/status/`,
  );
};

export const getChildExamStatusQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ['exams', 'child', id, 'status'],
    queryFn: () => getChildExamStatus(id),
    enabled: !!id,
  });
};

export const useChildExamStatus = (id: number, enabled = true) => {
  return useQuery({
    ...getChildExamStatusQueryOptions(id),
    enabled: enabled && !!id,
  });
};
