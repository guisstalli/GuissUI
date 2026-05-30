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
});

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
