import * as z from 'zod';

import {
  BiomicroscopyAnteriorSchema,
  BiomicroscopyPosteriorSchema,
  ClinicalCheckChildSchema,
  ConclusionSchema,
  OcularTensionSchema,
  PerimetrySchema,
  PlaintesSchema,
  RefractionSchema,
  VisionBinoculaireSchema,
  VisualAcuitySchema,
} from '@/features/exams/types/schemas';

/**
 * Zod schema and form-value type for the child exam page.
 *
 * Lives in the feature types layer so the page (app layer) can import the
 * schema without defining it inline.
 */

export const childExamSchema = z.object({
  visualAcuity: VisualAcuitySchema,
  refraction: RefractionSchema,
  ocularTension: OcularTensionSchema,
  visionBinoculaire: VisionBinoculaireSchema,
  clinicalCheck: ClinicalCheckChildSchema,
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
  conclusion: ConclusionSchema,
});

export type ChildExamFormValues = z.infer<typeof childExamSchema>;
