import { z } from 'zod';

export const ClinicSettingsSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email().or(z.literal('')),
  website: z.string().url().or(z.literal('')),
  logo: z.string().nullable(),
  numero_etablissement: z.string(),
  mentions_legales: z.string(),
  // Paramètres cliniques administrables (lot 4)
  logmar_zero_value: z.number(),
  adult_min_age: z.number(),
  driver_min_age: z.number(),
  rupture_window_exams: z.number(),
  rupture_threshold_points: z.number(),
});

export const ClinicalParametersSchema = z.object({
  logmar_zero_value: z.number().min(0).max(5),
  adult_min_age: z.number().int().min(1).max(30),
  driver_min_age: z.number().int().min(1).max(30),
  rupture_window_exams: z.number().int().min(1),
  rupture_threshold_points: z.number().min(0).max(100),
});

export type ClinicalParametersInput = z.infer<typeof ClinicalParametersSchema>;

export const ClinicSettingsUpdateSchema = z.object({
  name: z.string().min(1, 'Requis').max(255),
  address: z.string().optional().default(''),
  phone: z.string().max(30).optional().default(''),
  email: z.string().email('Email invalide').or(z.literal('')).optional(),
  website: z.string().url('URL invalide').or(z.literal('')).optional(),
  numero_etablissement: z.string().max(50).optional().default(''),
  mentions_legales: z.string().optional().default(''),
});

export type ClinicSettings = z.infer<typeof ClinicSettingsSchema>;
export type ClinicSettingsUpdateInput = z.infer<
  typeof ClinicSettingsUpdateSchema
>;
