import type { UseFormReturn } from 'react-hook-form';

import type { AdultExamFormValues } from '@/features/exams/types/adult-exam';

/**
 * UI-only helper types for the adult exam page panels.
 *
 * The Zod schema, the inferred `AdultExamFormValues`, and the
 * `Section` / `TechnicalSubsection` / `ClinicalSubsection` unions now live in
 * `@/features/exams/types/adult-exam`. Kept here are the presentation-layer
 * shapes used to type the extracted panel components without `any`.
 */

export interface SectionStatus {
  technical: {
    acuity: boolean;
    refraction: boolean;
    tension: boolean;
    pachymetry: boolean;
  };
  clinical: {
    plaintes: boolean;
    biomicroscopy: boolean;
    perimetry: boolean;
    attachments: boolean;
  };
  conclusion: boolean;
}

export interface AdultExamPatient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  medicalRecordNumber: string;
  hasDriver: boolean;
  driverId: number | null;
}

export interface AdultExamAttachment {
  id: number;
  original_filename: string;
  file_url?: string | null;
  file_size: number;
  description?: string | null;
  is_image: boolean;
  is_pdf: boolean;
  created: string;
}

export type AdultExamForm = UseFormReturn<AdultExamFormValues>;
