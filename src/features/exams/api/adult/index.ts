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
  deleteAdultExam,
  useDeleteAdultExam,
} from './mutations';
