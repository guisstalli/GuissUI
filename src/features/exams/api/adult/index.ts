// Get adult exams
export {
  getAdultExams,
  getAdultExamsQueryOptions,
  useAdultExams,
  getAdultExam,
  getAdultExamQueryOptions,
  useAdultExam,
  getAdultExamsByPatient,
  getAdultExamsByPatientQueryOptions,
  useAdultExamsByPatient,
  getIncompleteAdultExams,
  getIncompleteAdultExamsQueryOptions,
  useIncompleteAdultExams,
  getAdultExamStatus,
  getAdultExamStatusQueryOptions,
  useAdultExamStatus,
} from './get-adult-exams';

// Driver Experience
export {
  DriverExperienceSchema,
  getDriverExperience,
  getDriverExperienceQueryOptions,
  useDriverExperience,
  upsertDriverExperience,
  useUpsertDriverExperience,
} from './driver-experience';
export type {
  DriverExperience,
  DriverExperienceInput,
} from './driver-experience';

// Mutations
export {
  createAdultExam,
  useCreateAdultExam,
  addTechnicalData,
  useAddTechnicalData,
  addClinicalData,
  useAddClinicalData,
  updateSection,
  useUpdateSection,
  completeAdultExam,
  useCompleteAdultExam,
  uncompleteAdultExam,
  useUncompleteAdultExam,
  deleteAdultExam,
  useDeleteAdultExam,
} from './mutations';

// Ordonnance
export {
  getAdultOrdonnanceStatusQueryOptions,
  useAdultOrdonnanceStatus,
  useGenerateAdultOrdonnance,
  useDownloadAdultOrdonnance,
} from './ordonnance';
export type { OrdonnanceStatus } from './ordonnance';
