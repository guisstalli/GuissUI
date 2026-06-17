import type { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';

import { BiomicroscopyAnteriorSchema, BiomicroscopyPosteriorSchema, ConclusionSchema, OcularTensionSchema, PachymetrySchema, PerimetrySchema, PlaintesSchema, RefractionSchema, VisualAcuitySchema } from '@/features/exams/types/schemas';

/**
 * Shared types for the adult exam page panels.
 *
 * Mirrors the local schema/types defined in
 * `src/app/exams/adult/[id]/page.tsx`. Kept here so extracted panel
 * components can be typed without `any` and without cross-importing the page.
 */

export const adultExamSchema = z.object({
  // Technical
  visualAcuity: VisualAcuitySchema,
  refraction: RefractionSchema,
  ocularTension: OcularTensionSchema,
  pachymetry: PachymetrySchema,
  // Clinical
  plaintes: PlaintesSchema,
  perimetry: PerimetrySchema,
  od: z.object({
    bp_sg_anterieur: BiomicroscopyAnteriorSchema,
    bp_sg_posterieur: BiomicroscopyPosteriorSchema,
  }),
  og: z.object({
    bp_sg_anterieur: BiomicroscopyAnteriorSchema,
    bp_sg_posterieur: BiomicroscopyPosteriorSchema,
  }),
  // Conclusion
  conclusion: ConclusionSchema,
});

export type AdultExamFormValues = z.infer<typeof adultExamSchema>;

export type Section =
  | 'technical'
  | 'clinical'
  | 'analytics'
  | 'conclusion'
  | 'experience';

export type TechnicalSubsection =
  | 'acuity'
  | 'refraction'
  | 'tension'
  | 'pachymetry';

export type ClinicalSubsection =
  | 'plaintes'
  | 'biomicroscopy'
  | 'perimetry'
  | 'attachments';

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
