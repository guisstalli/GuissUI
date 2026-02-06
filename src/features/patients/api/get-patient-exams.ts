import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

// =============================================================================
// TYPES
// =============================================================================

export interface PatientExamAdult {
  id: number;
  numero_examen: string;
  patient: number;
  patient_name: string;
  is_completed: boolean;
  created: string;
  modified: string;
}

export interface PatientExamChild {
  id: number;
  numero_examen: string;
  patient: number;
  patient_name: string;
  reflet_pupillaire: string | null;
  fo: string | null;
  created: string;
  modified: string;
}

export interface PatientExamsResponse {
  adult: PatientExamAdult[];
  child: PatientExamChild[];
}

// =============================================================================
// API FUNCTION
// =============================================================================

export const getPatientExams = async (
  patientId: number,
): Promise<PatientExamsResponse> => {
  return api.get(`/api/v1/depistage/patients/${patientId}/examens/`);
};

// =============================================================================
// QUERY HOOK
// =============================================================================

export const usePatientExams = ({
  patientId,
  enabled = true,
}: {
  patientId: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['patient-exams', patientId],
    queryFn: () => getPatientExams(patientId),
    enabled: enabled && !!patientId,
  });
};
