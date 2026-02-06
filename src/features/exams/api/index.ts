// =============================================================================
// EXAMS API - MAIN EXPORTS
// =============================================================================

// Adult Exams
export {
  // Queries
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
  // Mutations
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
} from './adult';

// Child Exams
export {
  // Queries
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
  // Mutations
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
} from './child';

// Attachments
export {
  getAttachments,
  getAttachmentsQueryOptions,
  useAttachments,
  getAttachment,
  getAttachmentQueryOptions,
  useAttachment,
  uploadAttachment,
  useUploadAttachment,
  deleteAttachment,
  useDeleteAttachment,
} from './attachments';
