import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';

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

export const MedicamentSource = z.enum(['bdpm', 'bdpm_fallback', 'local']);
export type MedicamentSource = z.infer<typeof MedicamentSource>;

export const MedicamentSchema = z.object({
  source: MedicamentSource.default('local'),
  id: z.number().nullable(),
  cis: z.union([z.string(), z.number()]).nullable().optional(),
  dci: z.string(),
  nom_affiche: z.string().optional().default(''),
  atc_code: z.string().nullable().default(''),
  atc_libelle: z.string().nullable().default(''),
  nom_commercial: z.string().nullable().default(''),
  titulaire: z.string().nullable().optional().default(''),
  forme_galenique: FormeGalenique,
  forme_galenique_label: z.string(),
  voies_administration: z.array(z.string()).optional().default([]),
  dosage: z.string().nullable().optional().default(''),
  posologie_defaut: z.string().nullable().default(''),
  duree_defaut_jours: z.number().nullable(),
  enriched: z.boolean().optional().default(false),
});

export type Medicament = z.infer<typeof MedicamentSchema>;

interface SearchParams {
  q: string;
  forme?: FormeGalenique;
  limit?: number;
}

const searchMedicaments = async (
  params: SearchParams,
): Promise<Medicament[]> => {
  const search = new URLSearchParams();
  search.set('q', params.q);
  search.set('limit', String(params.limit ?? 20));
  if (params.forme) search.set('forme', params.forme);
  return api.get<Medicament[]>(`/depistage/medicaments/search/?${search}`);
};

/**
 * Recherche médicaments (autocomplétion ordonnance).
 * Désactivé si `q.length < 3` — aligné avec le backend qui exige 3 caractères
 * minimum avant d'interroger RxNorm.
 */
export const useMedicamentSearch = (q: string, forme?: FormeGalenique) =>
  useQuery({
    queryKey: ['medicaments', 'search', q, forme],
    queryFn: () => searchMedicaments({ q, forme }),
    enabled: q.trim().length >= 3,
    staleTime: 60_000,
  });
