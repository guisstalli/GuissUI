// Get child exams
export {
  getChildExams,
  getChildExamsQueryOptions,
  useChildExams,
  getChildExam,
  getChildExamQueryOptions,
  useChildExam,
  getChildExamsByPatient,
  getChildExamsByPatientQueryOptions,
  useChildExamsByPatient,
  getIncompleteChildExams,
  getIncompleteChildExamsQueryOptions,
  useIncompleteChildExams,
  getChildExamStatus,
  getChildExamStatusQueryOptions,
  useChildExamStatus,
} from './get-child-exams';

// Mutations
export {
  createChildExam,
  useCreateChildExam,
  createMinimalChildExam,
  useCreateMinimalChildExam,
  updateTechnicalData,
  patchTechnicalData,
  useUpdateTechnicalData,
  updateClinicalData,
  patchClinicalData,
  useUpdateClinicalData,
  deleteChildExam,
  useDeleteChildExam,
  completeChildExam,
  useCompleteChildExam,
  uncompleteChildExam,
  useUncompleteChildExam,
} from './mutations';

// Ordonnance
export {
  getChildOrdonnanceStatusQueryOptions,
  useChildOrdonnanceStatus,
  useGenerateChildOrdonnance,
  useDownloadChildOrdonnance,
} from './ordonnance';
export type { OrdonnanceStatus as ChildOrdonnanceStatus } from './ordonnance';
