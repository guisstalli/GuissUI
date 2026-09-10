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

/**
 * `examens` = la saisie d'une séance ; `dossiers` = la cohérence d'une fiche
 * patient ou conducteur. Les deux ne se corrigent pas au même endroit ni par
 * les mêmes personnes, d'où deux sections distinctes à l'écran.
 */
export const familleSchema = z.enum(['examens', 'dossiers']);
export type Famille = z.infer<typeof familleSchema>;

export const regleQualiteSchema = z.object({
  code: z.string(),
  famille: familleSchema,
  libelle: z.string(),
  gravite: graviteSchema,
  explication: z.string(),
  nombre: z.number(),
  // Servis pour les seules règles « dossiers ». Une anomalie saisie dans
  // l'application se corrige — l'opérateur est identifiable, le patient
  // joignable. Une anomalie héritée de l'ancienne plateforme, souvent pas.
  importes: z.number().optional(),
  saisis: z.number().optional(),
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

/**
 * Une exécution de nettoyage — manuelle ou planifiée.
 *
 * La tâche de 5 h fusionnait, archivait et supprimait sans que personne puisse
 * voir son effet. Ces lignes sont ce qui rend l'automatisation inspectable.
 */
export const nettoyageRunSchema = z.object({
  id: z.number(),
  operation: z.string(),
  jour: z.string().nullable(),
  declencheur: z.enum(['automatique', 'manuel', 'commande']),
  lance_le: z.string(),
  lance_par_email: z.string().nullable().optional(),
  statut: z.enum(['simulation', 'applique', 'restaure', 'echoue']),
  examens_concernes: z.number(),
  fusions: z.number(),
  supprimes: z.number(),
  arbitrages_crees: z.number(),
  rattaches_site: z.number(),
  archive: z.string(),
  est_restaurable: z.boolean(),
  restaure_le: z.string().nullable().optional(),
  restaure_par_email: z.string().nullable().optional(),
});
export type NettoyageRun = z.infer<typeof nettoyageRunSchema>;

/** Ce que la simulation annonce avant toute écriture. */
export const planNettoyageSchema = z.object({
  jour: z.string(),
  examens_concernes: z.number(),
  patients: z.number(),
  reprises_epargnees: z.number(),
  fusions: z.number(),
  supprimes: z.number(),
  conflits: z.number(),
  simulation: z.boolean(),
  rapport: z.string(),
});
export type PlanNettoyage = z.infer<typeof planNettoyageSchema>;
