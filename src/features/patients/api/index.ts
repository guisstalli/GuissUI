// =============================================================================
// PATIENTS API EXPORTS
// =============================================================================

// Get patients
export {
  getPatients,
  getPatientsQueryOptions,
  usePatients,
  getAdultPatients,
  getAdultPatientsQueryOptions,
  useAdultPatients,
  getChildPatients,
  getChildPatientsQueryOptions,
  useChildPatients,
  getDeletedPatients,
  getDeletedPatientsQueryOptions,
  useDeletedPatients,
} from './get-patients';

// Get single patient
export { getPatient, getPatientQueryOptions, usePatient } from './get-patient';

// Get patient exams
export {
  getPatientExams,
  usePatientExams,
  type PatientExamAdult,
  type PatientExamChild,
  type PatientExamsResponse,
} from './get-patient-exams';

// Create patient
export { createPatient, useCreatePatient } from './create-patient';

// Update patient
export {
  updatePatient,
  patchPatient,
  useUpdatePatient,
  usePatchPatient,
} from './update-patient';

// Delete/Restore patient
export {
  deletePatient,
  hardDeletePatient,
  restorePatient,
  useDeletePatient,
  useHardDeletePatient,
  useRestorePatient,
} from './delete-patient';

// Antecedents
export {
  getAntecedent,
  getAntecedentQueryOptions,
  useAntecedent,
  createOrUpdateAntecedent,
  updateAntecedent,
  useUpdateAntecedent,
} from './antecedent';

// Bulk import
export {
  bulkImportPatients,
  getTaskStatus,
  getTaskStatusQueryOptions,
  useTaskStatus,
  useBulkImportPatients,
} from './bulk-import';
