import { z } from 'zod';

export const REGIONS = [
  'Dakar',
  'Thies',
  'Diourbel',
  'Fatick',
  'Kaolack',
  'Kaffrine',
  'Louga',
  'Saint-Louis',
  'Matam',
  'Tambacounda',
  'Kedougou',
  'Kolda',
  'Sedhiou',
  'Ziguinchor',
] as const;

export const TYPE_PERMIS_VALUES = ['Leger', 'Lourd', 'Autres'] as const;
export const SERVICE_VALUES = ['Public', 'Prive', 'Particulier'] as const;
export const VEHICULE_VALUES = ['Leger', 'Lourd', 'Autres'] as const;
export const INSTRUCTION_VALUES = ['Française', 'Arabe'] as const;
export const NIVEAU_INSTRUCTION_VALUES = [
  'Primaire',
  'Secondaire',
  'Superieure',
  'Autres',
  'Aucune',
] as const;
export const PRISE_EN_CHARGE_VALUES = [
  'GRATUIT',
  'PAF',
  'Assurance',
  'IB',
  'Sociéte',
  'IMP',
  'CMU',
] as const;

export const DriverPatientSchema = z.object({
  id: z.number(),
  numero_identifiant: z.string(),
  full_name: z.string(),
  date_de_naissance: z.string(),
  sex: z.enum(['H', 'F', 'A']),
  phone_number: z.string().nullable().optional(),
  at_risk: z.boolean(),
  is_adult: z.boolean(),
});

export const DriverSchema = z.object({
  id: z.number(),
  patient: DriverPatientSchema,
  numero_permis: z.string(),
  type_permis: z.enum(TYPE_PERMIS_VALUES),
  autre_type_permis: z.string().nullable().optional(),
  date_delivrance_permis: z.string(),
  date_peremption_permis: z.string(),
  transporteur_professionnel: z.boolean(),
  service: z.enum(SERVICE_VALUES),
  annees_experience: z.number(),
  type_vehicule_conduit: z.enum(VEHICULE_VALUES),
  type_instruction_suivie: z.enum(INSTRUCTION_VALUES),
  niveau_instruction: z.enum(NIVEAU_INSTRUCTION_VALUES),
  prise_en_charge: z.string().nullable().optional(),
  zone_de_residence: z.enum(REGIONS),
  image: z.string().nullable().optional(),
  created: z.string(),
  modified: z.string(),
  is_deleted: z.boolean().optional(),
  deleted_at: z.string().nullable().optional(),
});

export const PaginatedDriversSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(DriverSchema),
});

const PatientCreateSchema = z.object({
  name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  date_de_naissance: z.string().min(1, 'La date de naissance est requise'),
  sex: z.enum(['H', 'F', 'A']),
  phone_number: z
    .string()
    .min(8, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
});

export const DriverCreateSchema = z
  .object({
    patient: PatientCreateSchema,
    numero_permis: z.string().min(1, 'Le numéro de permis est requis'),
    type_permis: z.enum(TYPE_PERMIS_VALUES),
    autre_type_permis: z.string().optional(),
    date_delivrance_permis: z.string().min(1, 'Date de délivrance requise'),
    date_peremption_permis: z.string().min(1, 'Date de péremption requise'),
    transporteur_professionnel: z.boolean(),
    service: z.enum(SERVICE_VALUES),
    annees_experience: z.coerce.number().min(0),
    type_vehicule_conduit: z.enum(VEHICULE_VALUES),
    type_instruction_suivie: z.enum(INSTRUCTION_VALUES),
    niveau_instruction: z.enum(NIVEAU_INSTRUCTION_VALUES),
    prise_en_charge: z.string().optional().nullable(),
    zone_de_residence: z.enum(REGIONS),
  })
  .superRefine((data, ctx) => {
    if (data.type_permis === 'Autres' && !data.autre_type_permis?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez préciser le type de permis',
        path: ['autre_type_permis'],
      });
    }
    if (data.date_delivrance_permis && data.date_peremption_permis) {
      if (data.date_peremption_permis <= data.date_delivrance_permis) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'La date de péremption doit être postérieure à la date de délivrance',
          path: ['date_peremption_permis'],
        });
      }
    }
  });

const DriverUpdateBaseSchema = z.object({
  numero_permis: z.string().min(1).optional(),
  type_permis: z.enum(TYPE_PERMIS_VALUES).optional(),
  autre_type_permis: z.string().optional(),
  date_delivrance_permis: z.string().optional(),
  date_peremption_permis: z.string().optional(),
  transporteur_professionnel: z.boolean().optional(),
  service: z.enum(SERVICE_VALUES).optional(),
  annees_experience: z.coerce.number().min(0).optional(),
  type_vehicule_conduit: z.enum(VEHICULE_VALUES).optional(),
  type_instruction_suivie: z.enum(INSTRUCTION_VALUES).optional(),
  niveau_instruction: z.enum(NIVEAU_INSTRUCTION_VALUES).optional(),
  prise_en_charge: z.string().optional().nullable(),
  zone_de_residence: z.enum(REGIONS).optional(),
});

export const DriverUpdateSchema = DriverUpdateBaseSchema.superRefine(
  (data, ctx) => {
    if (data.type_permis === 'Autres' && !data.autre_type_permis?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez préciser le type de permis',
        path: ['autre_type_permis'],
      });
    }
    if (data.date_delivrance_permis && data.date_peremption_permis) {
      if (data.date_peremption_permis <= data.date_delivrance_permis) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'La date de péremption doit être postérieure à la date de délivrance',
          path: ['date_peremption_permis'],
        });
      }
    }
  },
);

export type Driver = z.infer<typeof DriverSchema>;
export type DriverPatient = z.infer<typeof DriverPatientSchema>;
export type DriverCreate = z.infer<typeof DriverCreateSchema>;
export type DriverUpdate = z.infer<typeof DriverUpdateSchema>;
export type PaginatedDrivers = z.infer<typeof PaginatedDriversSchema>;
