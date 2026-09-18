/**
 * Périmètre transmis à l'assistant depuis un écran filtré.
 *
 * POURQUOI — la bulle de discussion s'ouvre au-dessus d'un tableau de bord déjà
 * filtré, et la question porte sur ce qui est affiché. Le serveur applique ce
 * périmètre à chaque outil, mais il ne peut appliquer que les dimensions que
 * les outils connaissent : la cohorte sélectionnée à la souris, par exemple,
 * n'en fait pas partie.
 *
 * Le dire est le point entier de ce module. Une bulle qui a l'air filtrée sans
 * l'être ferait lire « 4 069 patients » pour un sous-ensemble de 80 — un écart
 * que rien, dans la réponse, ne signalerait.
 */

/**
 * Dimensions que les outils d'analyse acceptent — miroir de
 * `AggregateFilters` (apps/ai_core/services/analytics_tools.py). Le serveur
 * reste l'autorité : il écarte de lui-même tout ce qui n'est pas dans cette
 * liste. Elle sert ici à dire à l'utilisateur ce qui part réellement.
 */
const DIMENSIONS_TRANSMISES = [
  'date_start',
  'date_end',
  'site_id',
  'sex',
  'exam_type',
  'age_band',
  'eye_strategy',
  'exam_scope',
  'driver_scope',
  'driver_only',
] as const;

/** Valeurs qui ne restreignent rien : les annoncer inventerait un périmètre. */
const VALEURS_NEUTRES: Record<string, unknown> = {
  exam_type: 'all',
  age_band: 'all',
  eye_strategy: 'separate',
  exam_scope: 'all',
  driver_scope: 'all',
  driver_only: false,
  analytics_scope: 'population',
};

const LIBELLES: Record<string, string> = {
  date_start: 'Depuis le',
  date_end: "Jusqu'au",
  site_id: 'Sites',
  sex: 'Sexe',
  exam_type: "Type d'examen",
  age_band: "Tranche d'âge",
  eye_strategy: 'Stratégie œil',
  exam_scope: 'Examens',
  driver_scope: 'Conducteurs',
  driver_only: 'Conducteurs uniquement',
};

const VALEURS: Record<string, Record<string, string>> = {
  sex: { H: 'Hommes', F: 'Femmes' },
  exam_type: { adult: 'Adulte', child: 'Enfant' },
  age_band: { child: 'Enfants', adult: 'Adultes', over_40: 'Plus de 40 ans' },
  eye_strategy: { worst: 'Œil le plus atteint', average: 'Moyenne OD/OG' },
  exam_scope: { first: 'Premier par patient' },
  driver_scope: { only: 'Conducteurs seuls', exclude: 'Hors conducteurs' },
};

/**
 * Dimensions propres à l'écran, qu'aucun outil n'accepte. Les lister permet de
 * prévenir au lieu de les laisser tomber en silence.
 */
const NON_TRANSMISES: Record<string, string> = {
  patient_ids: 'la cohorte sélectionnée',
  acuity: "le filtre d'acuité",
  tension: 'le filtre de tension',
  conclusion: 'le filtre de conclusion',
  symptom: 'le filtre de symptôme',
  patient_id: 'le patient sélectionné',
  exam_id: "l'examen sélectionné",
};

export type EntreePerimetre = { label: string; valeur: string };

const estVide = (valeur: unknown): boolean =>
  valeur === undefined ||
  valeur === null ||
  valeur === '' ||
  (Array.isArray(valeur) && valeur.length === 0);

/** Ce qui part réellement au serveur, en libellés lisibles. */
export function entreesDuPerimetre(
  filtres: Record<string, unknown>,
  nomsDeSites?: Map<number, string>,
): EntreePerimetre[] {
  const entrees: EntreePerimetre[] = [];
  for (const cle of DIMENSIONS_TRANSMISES) {
    const valeur = filtres[cle];
    if (estVide(valeur) || VALEURS_NEUTRES[cle] === valeur) continue;
    if (cle === 'site_id' && Array.isArray(valeur)) {
      entrees.push({
        label: LIBELLES[cle],
        valeur: valeur
          .map((id) => nomsDeSites?.get(Number(id)) ?? `Site ${id}`)
          .join(', '),
      });
      continue;
    }
    if (cle === 'driver_only') {
      entrees.push({ label: LIBELLES[cle], valeur: 'Oui' });
      continue;
    }
    const texte = String(valeur);
    entrees.push({
      label: LIBELLES[cle] ?? cle,
      valeur: VALEURS[cle]?.[texte] ?? texte,
    });
  }
  return entrees;
}

/** Ce que l'écran restreint mais que l'assistant ne peut PAS appliquer. */
export function restrictionsNonTransmises(
  filtres: Record<string, unknown>,
): string[] {
  return Object.entries(NON_TRANSMISES)
    .filter(([cle]) => !estVide(filtres[cle]))
    .map(([, libelle]) => libelle);
}

/** Résumé d'une ligne pour l'en-tête de la bulle. */
export function resumePerimetre(entrees: EntreePerimetre[]): string {
  if (entrees.length === 0) return 'Toutes les données';
  return entrees.map((e) => `${e.label} ${e.valeur}`).join(' · ');
}
