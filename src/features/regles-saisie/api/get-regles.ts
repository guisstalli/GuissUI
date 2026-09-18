import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';

/**
 * Trois statuts, pas deux.
 *
 * `validee` : une personne nommée l'a confirmée, à une date connue.
 * `a_valider` : la règle s'applique sans validation clinique — une dette, pas
 * un reproche. `produit` : décision d'outil, qui n'attend aucune validation
 * médicale et ne doit pas encombrer la liste de ce qui en attend une.
 */
export const statutRegleSchema = z.enum(['validee', 'a_valider', 'produit']);
export type StatutRegle = z.infer<typeof statutRegleSchema>;

export const regleSaisieSchema = z.object({
  code: z.string(),
  domaine: z.string(),
  champ: z.string(),
  regle: z.string(),
  statut: statutRegleSchema,
  source: z.string(),
  date_validation: z.string(),
  incident: z.string(),
  applique_dans: z.string(),
});
export type RegleSaisie = z.infer<typeof regleSaisieSchema>;

export const registreSchema = z.object({
  regles: z.array(regleSaisieSchema),
  a_valider: z.number(),
});
export type Registre = z.infer<typeof registreSchema>;

export const getReglesSaisie = (): Promise<Registre> =>
  api.get<Registre>('/depistage/regles-saisie/');

export const getReglesSaisieQueryOptions = () =>
  queryOptions({
    queryKey: ['regles-saisie'],
    queryFn: getReglesSaisie,
    // Le registre ne change qu'au déploiement : le réinterroger à chaque
    // navigation n'apprendrait rien.
    staleTime: 30 * 60_000,
  });

export const useReglesSaisie = () => useQuery(getReglesSaisieQueryOptions());
