/**
 * Motifs de consultation proposés dans le formulaire public de prise de
 * rendez-vous. Source unique : le `<Select>` (MOTIF_GROUPS) et la validation
 * Zod (MOTIF_OPTIONS) dérivent tous deux de ces tableaux.
 */

/** Valeur sentinelle du choix « Autre » qui ouvre le champ libre. */
export const MOTIF_AUTRE_VALUE = 'Autre';

const MOTIF_CONSULTATIONS = [
  'Consultation nouveau malade',
  'Consultation ancien malade',
] as const;

const MOTIF_EXPLORATIONS = [
  'Réfraction / correction',
  'Champ visuel',
  'OCT',
  'V3M',
  'Bilan orthoptique',
  'Lancaster',
  'Topographie cornéenne',
  'Électrophysiologie',
  'Meibographie',
  'Tonométrie / pachymétrie',
  'Test des couleurs',
] as const;

/** Toutes les valeurs de motif sélectionnables (hors texte libre « Autre »). */
export const MOTIF_OPTIONS = [
  ...MOTIF_CONSULTATIONS,
  ...MOTIF_EXPLORATIONS,
  MOTIF_AUTRE_VALUE,
] as const;

export type MotifOption = (typeof MOTIF_OPTIONS)[number];

/** Groupes affichés dans le `<Select>` du motif (libellé `null` = sans titre). */
export const MOTIF_GROUPS: {
  label: string | null;
  options: readonly string[];
}[] = [
  { label: null, options: MOTIF_CONSULTATIONS },
  { label: 'Explorations', options: MOTIF_EXPLORATIONS },
  { label: null, options: [MOTIF_AUTRE_VALUE] },
];
