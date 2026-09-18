import { z } from 'zod';

/**
 * Une campagne, c'est un lieu et une journée.
 *
 * Elle se déclare par un événement quand il en existe un, sinon simplement par
 * un site : exiger l'événement aurait exclu les séances qui n'en déclarent
 * pas — c'est-à-dire la plupart de celles du terrain.
 */
export type Campagne = {
  siteId: number | null;
  eventId: number | null;
  libelle: string;
};

export const ligneFileSchema = z.object({
  examen_id: z.number(),
  numero_examen: z.string(),
  type_examen: z.enum(['adulte', 'enfant']),
  heure: z.string(),
  // Trois états, pas deux : ouvert, commencé, terminé. Une file qui ne les
  // distingue pas ne permet pas de piloter une journée.
  commence: z.boolean(),
  complet: z.boolean(),
  motif_reprise: z.string(),
  patient: z.object({
    id: z.number(),
    nom_complet: z.string(),
    age: z.number().nullable(),
    sex: z.string().nullable(),
    numero_identifiant: z.string(),
  }),
});
export type LigneFile = z.infer<typeof ligneFileSchema>;

/** Une personne trouvée pendant la frappe, avec son passage du jour. */
export const personneVueSchema = z.object({
  id: z.number(),
  nom_complet: z.string(),
  age: z.number().nullable(),
  sex: z.string().nullable(),
  numero_identifiant: z.string(),
  site: z.string().nullable(),
  vu_aujourdhui: z.boolean(),
  examen_du_jour_id: z.number().nullable(),
});
export type PersonneVue = z.infer<typeof personneVueSchema>;

export const enregistrementSchema = z.object({
  patient_id: z.number(),
  examen_id: z.number(),
  numero_examen: z.string(),
  type_examen: z.enum(['adulte', 'enfant']),
  site_id: z.number().nullable(),
});
export type Enregistrement = z.infer<typeof enregistrementSchema>;

/** Ce que l'opérateur saisit d'une personne nouvelle — rien de plus. */
export const nouvellePersonneSchema = z.object({
  last_name: z.string().min(1, 'Le nom est requis.'),
  name: z.string().min(1, 'Le prénom est requis.'),
  date_de_naissance: z.string().min(1, 'La date de naissance est requise.'),
  sex: z.enum(['H', 'F'], { message: 'Indiquez le sexe.' }),
});
export type NouvellePersonne = z.infer<typeof nouvellePersonneSchema>;

/** Ce que la campagne a réellement mesuré. */
export const completudeSchema = z.object({
  jour: z.string(),
  passages: z.number(),
  adultes: z.number(),
  enfants: z.number(),
  // Les passages ne suffisent pas : le 17/09/2026, 98 des 189 examens enfant
  // ne portaient aucune mesure et comptaient pourtant comme réalisés.
  avec_mesure: z.number(),
  sans_mesure: z.number(),
  complets: z.number(),
  taux_mesure: z.number(),
  taux_complet: z.number(),
  seuil_interpretation: z.number(),
  effectif_interpretable: z.boolean(),
});
export type Completude = z.infer<typeof completudeSchema>;
