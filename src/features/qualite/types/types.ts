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

export const pointTendanceSchema = z.object({
  jour: z.string(),
  examens: z.number(),
  doublons: z.number(),
  sans_site: z.number(),
  coquilles_vides: z.number(),
});
export type PointTendance = z.infer<typeof pointTendanceSchema>;

/**
 * Une valeur écartée par un nettoyage, en attente d'un choix médical.
 *
 * Le nettoyage fusionne ce qui ne se contredit pas. Quand l'examen conservé
 * portait DÉJÀ une autre valeur, aucune règle mécanique ne départage : sphère
 * +0,500 contre −0,750, c'est hypermétropie contre myopie.
 */
export const arbitrageSchema = z.object({
  id: z.number(),
  jour: z.string(),
  patient_id: z.number(),
  patient_nom: z.string().nullable().optional(),
  examen_conserve_id: z.number(),
  examen_ecarte_id: z.number(),
  numero_examen_ecarte: z.string(),
  composant: z.string(),
  champ: z.string(),
  // Intitulés servis par l'API : « Sphère OD » plutôt que « refraction.od_s ».
  composant_libelle: z.string(),
  champ_libelle: z.string(),
  valeur_conservee: z.string(),
  valeur_ecartee: z.string(),
  statut: z.enum(['en_attente', 'conservee', 'remplacee', 'ignoree']),
  commentaire: z.string().nullable().optional(),
  decide_le: z.string().nullable().optional(),
  decide_par_email: z.string().nullable().optional(),
});
export type Arbitrage = z.infer<typeof arbitrageSchema>;

export type DecisionArbitrage = 'conservee' | 'remplacee' | 'ignoree';

export type StatutArbitrage = Arbitrage['statut'];
