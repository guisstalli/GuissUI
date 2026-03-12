import { z } from 'zod';

export const SiteSchema = z.object({
  id: z.number().optional(),
  libelle: z.string().min(2, 'Le libellé doit contenir au moins 2 caractères'),
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères'),
  adresse: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  created: z.string().optional(),
  modified: z.string().optional(),
});

export type Site = z.infer<typeof SiteSchema>;

export type SiteListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Site[];
};
