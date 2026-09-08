import { z } from 'zod';

/**
 * Gravité d'une anomalie de saisie.
 *
 * On distingue trois niveaux parce qu'ils appellent des réactions distinctes :
 * `critique` exige une reprise immédiate (les données se dispersent),
 * `majeure` fausse les analyses, `mineure` encombre sans nuire.
 * Seules les deux premières déclenchent une alerte — une alerte que l'on
 * apprend à ignorer ne sert à rien.
 */
export const graviteSchema = z.enum(['critique', 'majeure', 'mineure']);
export type Gravite = z.infer<typeof graviteSchema>;

export const regleQualiteSchema = z.object({
  code: z.string(),
  libelle: z.string(),
  gravite: graviteSchema,
  explication: z.string(),
  nombre: z.number(),
});
export type RegleQualite = z.infer<typeof regleQualiteSchema>;

export const doublonSchema = z.object({
  jour: z.string(),
  patient_id: z.number(),
  examens: z.number(),
});
export type Doublon = z.infer<typeof doublonSchema>;

export type FiltresQualite = {
  dateDebut?: string;
  dateFin?: string;
};
