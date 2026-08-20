import { z } from 'zod';

import { optionalPhoneSchema } from '@/utils/phone';

export const EventStatutSchema = z.enum([
  'planifie',
  'en_cours',
  'termine',
  'annule',
]);
export const EventTypeExamenSchema = z.enum(['adulte', 'enfant', 'les_deux']);

export const EventPublicSchema = z.object({
  numero_evenement: z.string(),
  titre: z.string(),
  description: z.string(),
  slug: z.string(),
  date_event: z.string(),
  /** NULL = événement d'une seule journée. */
  date_fin: z.string().nullable().optional(),
  heure_debut: z.string(),
  heure_fin: z.string(),
  lieu: z.string(),
  capacite_max: z.number().nullable(),
  places_restantes: z.number().nullable(),
  pour_conducteurs: z.boolean(),
  type_examen: EventTypeExamenSchema,
  statut: EventStatutSchema,
});

export type EventPublic = z.infer<typeof EventPublicSchema>;

export const EventStaffSchema = EventPublicSchema.extend({
  id: z.number(),
  created: z.string().optional(),
});

export type EventStaff = z.infer<typeof EventStaffSchema>;

/** Valeurs acceptées par le serveur — miroir des `TextChoices` du modèle. */
export const TYPE_PERMIS_OPTIONS = [
  { value: 'Leger', label: 'Léger' },
  { value: 'Lourd', label: 'Lourd' },
  { value: 'Autres', label: 'Autres' },
] as const;

export const SERVICE_OPTIONS = [
  { value: 'Public', label: 'Public' },
  { value: 'Prive', label: 'Privé' },
  { value: 'Particulier', label: 'Particulier' },
] as const;

/**
 * Le strict nécessaire demandé au public sur un événement conducteurs.
 *
 * Le dossier conducteur complet exige onze champs (dates de permis, années
 * d'expérience, type de véhicule, niveau d'instruction…). Les demander ici
 * ferait abandonner, et ces informations se vérifient sur pièce le jour J :
 * l'accueil complète le dossier, pré-rempli avec ce qui suit.
 */
export const DriverEssentialsSchema = z.object({
  numero_permis: z.string().min(1, 'Numéro de permis requis'),
  type_permis: z.enum(['Leger', 'Lourd', 'Autres'], {
    message: 'Type de permis requis',
  }),
  service: z.enum(['Public', 'Prive', 'Particulier'], {
    message: 'Service requis',
  }),
  zone_de_residence: z.string().min(1, 'Zone de résidence requise'),
});

export type DriverEssentials = z.infer<typeof DriverEssentialsSchema>;

export const InscriptionPubliqueInputSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  phone_number: optionalPhoneSchema,
  date_de_naissance: z.string().min(1, 'Date de naissance requise'),
  sex: z.enum(['H', 'F', 'A'], { message: 'Sexe requis' }),
  /** Renseigné uniquement quand l'événement est `pour_conducteurs`. */
  driver_data: DriverEssentialsSchema.optional(),
});

export type InscriptionPubliqueInput = z.infer<
  typeof InscriptionPubliqueInputSchema
>;

/**
 * Schéma effectif du formulaire, selon la nature de l'événement.
 *
 * `driver_data` est optionnel dans le schéma de base — une inscription
 * ordinaire n'en a pas — mais devient OBLIGATOIRE sur un événement
 * conducteurs. Sans cette bascule, le champ resterait facultatif et
 * l'inscription repartirait sans la moindre donnée conducteur : exactement le
 * défaut qu'on corrige.
 */
export const inscriptionPubliqueSchemaFor = (pourConducteurs: boolean) =>
  pourConducteurs
    ? InscriptionPubliqueInputSchema.extend({
        driver_data: DriverEssentialsSchema,
      })
    : InscriptionPubliqueInputSchema;

export const InscriptionConfirmationSchema = z.object({
  numero_inscription: z.string(),
  nom: z.string(),
  prenom: z.string(),
  phone_number: z.string().nullable(),
  statut: z.string(),
  inscrit_at: z.string(),
});

export type InscriptionConfirmation = z.infer<
  typeof InscriptionConfirmationSchema
>;

export const PaginatedEventsSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(EventPublicSchema),
});

export type PaginatedEvents = z.infer<typeof PaginatedEventsSchema>;

export const EventCreateInputSchema = z.object({
  titre: z.string().min(1, 'Titre requis'),
  date_event: z.string(),
  /** NULL = événement d'une seule journée. */
  date_fin: z.string().nullable().optional(),
  heure_debut: z.string(),
  heure_fin: z.string(),
  lieu: z.string().min(1, 'Lieu requis'),
  type_examen: EventTypeExamenSchema,
  capacite_max: z.number().optional().nullable(),
  description: z.string().optional(),
  pour_conducteurs: z.boolean().optional(),
  site_id: z.number().optional().nullable(),
});

export type EventCreateInput = z.infer<typeof EventCreateInputSchema>;
