import { z } from 'zod';

export const FormeGalenique = z.enum([
  'COLLYRE',
  'POMMADE',
  'COMPRIMES',
  'INJECTION',
  'GEL',
  'SOLUTION',
  'AUTRE',
]);
export type FormeGalenique = z.infer<typeof FormeGalenique>;

export const FORME_LABELS: Record<FormeGalenique, string> = {
  COLLYRE: 'Collyre',
  POMMADE: 'Pommade ophtalmique',
  COMPRIMES: 'Comprimés',
  INJECTION: 'Injection',
  GEL: 'Gel ophtalmique',
  SOLUTION: 'Solution ophtalmique',
  AUTRE: 'Autre',
};

export const MedicamentAdminSchema = z.object({
  id: z.number(),
  dci: z.string(),
  atc_code: z.string(),
  atc_libelle: z.string(),
  nom_commercial: z.string(),
  forme_galenique: FormeGalenique,
  forme_galenique_label: z.string(),
  dosage_defaut: z.string(),
  posologie_defaut: z.string(),
  duree_defaut_jours: z.number().nullable(),
  actif: z.boolean(),
  created: z.string(),
  modified: z.string(),
});
export type MedicamentAdmin = z.infer<typeof MedicamentAdminSchema>;

export const PaginatedMedicamentsSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  limit: z.number(),
  offset: z.number(),
  results: z.array(MedicamentAdminSchema),
});
export type PaginatedMedicaments = z.infer<typeof PaginatedMedicamentsSchema>;

export const MedicamentInputSchema = z.object({
  dci: z.string().min(1, 'DCI requis').max(255),
  atc_code: z.string().max(10).optional().default(''),
  atc_libelle: z.string().max(255).optional().default(''),
  nom_commercial: z.string().max(255).optional().default(''),
  forme_galenique: FormeGalenique,
  dosage_defaut: z.string().max(50).optional().default(''),
  posologie_defaut: z.string().max(255).optional().default(''),
  duree_defaut_jours: z.coerce
    .number()
    .int()
    .min(1)
    .max(365)
    .nullable()
    .optional(),
  actif: z.boolean().optional().default(true),
});
export type MedicamentInput = z.infer<typeof MedicamentInputSchema>;
