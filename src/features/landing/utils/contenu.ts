/**
 * Contenu de la vitrine — repris du document de présentation 2026 du CVMRN.
 *
 * Tout ce qui est chiffré ou nominatif vient de ce document : les dates, la
 * composition de l'équipe, la liste des appareils, les financeurs. On ne
 * romance pas un centre de santé — un plateau technique inventé serait
 * découvert au premier rendez-vous, et une vitrine hospitalière se juge sur
 * ce qu'elle promet de tenir.
 */

export const CENTRE = {
  nom: 'Centre de Vision Madoune Robert Ndiaye',
  sigle: 'CVMRN',
  rattachement:
    'Unité mixte de recherche et de diagnostic — UFR des Sciences de la Santé, Université Iba Der Thiam de Thiès',
  inauguration: 2022,
  coordination: 'Pr Aïssatou M. Wane',
  ophtalmologisteResident: 'Dr Babacar Mbengue',
} as const;

/** Les quatre missions de l'enseignement supérieur, telles que le centre les porte. */
export const MISSIONS = [
  {
    titre: 'Soins',
    texte:
      'Consultations et dépistages ophtalmologiques, au centre ou en stratégie avancée (hors des murs du centre).',
  },
  {
    titre: 'Recherche',
    texte: "Unité mixte de recherche et de diagnostic de l'UFR Santé de Thiès.",
  },
  {
    titre: 'Enseignement',
    texte:
      'Terrain de formation en ophtalmologie, orthoptie et optique-lunetterie.',
  },
  {
    titre: 'Communauté',
    texte:
      'Écoles, Daaras, quartiers, services administratifs — et sur demande.',
  },
] as const;

/**
 * Le programme qui donne son sens au reste : depuis le 14 mars 2023, les
 * conducteurs sont examinés GRATUITEMENT. Un conducteur peut lire 10/10 et
 * avoir un champ visuel amputé sans le savoir — c'est précisément ce que la
 * périmétrie révèle, et ce que l'acuité seule laisse passer.
 */
export const SECURITE_ROUTIERE = {
  depuis: '14 mars 2023',
  intitule: "Contribution à la sécurité routière par l'examen du champ visuel",
  promesse:
    'Consultation ophtalmologique et examen du champ visuel, gratuits pour les conducteurs.',
} as const;

export const PLATEAU = [
  {
    groupe: 'Consultation',
    appareils: [
      'Réfractomètre automatisé',
      'Tonopachymètre',
      'Rétinographe',
      'Biomicroscope',
      "Écrans d'acuité visuelle",
    ],
  },
  {
    groupe: 'Explorations complémentaires',
    appareils: [
      'OCT',
      'Périmètre automatisé Metrovision MonPack One',
      'Synoptophore',
      'Topographe cornéen',
    ],
  },
  {
    groupe: 'Examens complémentaires',
    appareils: [
      'Echographie ( À,B,UBM)',
      'Orthoptie',
      'Bilan orthoptique',
      'Rééducation orthoptique',
    ],
  },
] as const;

/** Équipe de base de l'unité médicale mobile. */
export const EQUIPE = [
  { nombre: 4, role: 'ophtalmologistes seniors' },
  { nombre: 2, role: 'orthoptistes' },
  { nombre: 1, role: 'médecin de santé publique, doctorant à l’UIDT' },
  { nombre: 1, role: 'assistant administratif' },
  { nombre: 1, role: 'informaticien' },
] as const;

export const FINANCEURS = [
  'Novartis',
  "UIDT — Fonds d'appui à la recherche et à l'innovation",
  "Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation (Fonds FIRST)",
  'UFR Santé de Thiès',
] as const;
