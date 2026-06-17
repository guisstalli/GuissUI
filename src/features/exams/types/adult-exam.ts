import * as z from 'zod';

import {
  BiomicroscopyAnteriorSchema,
  BiomicroscopyPosteriorSchema,
  ConclusionSchema,
  OcularTensionSchema,
  PachymetrySchema,
  PerimetrySchema,
  PlaintesSchema,
  RefractionSchema,
  VisualAcuitySchema,
} from '@/features/exams/types/schemas';

/**
 * Zod schema and form-value/union types for the adult exam page.
 *
 * Lives in the feature types layer so the page (app layer) and the panel
 * components (feature layer) can share the schema without the schema living
 * in a component file.
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
