import { z } from 'zod';

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

export const InscriptionPubliqueInputSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  phone_number: z
    .string()
    .min(9, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
  date_de_naissance: z.string().optional().nullable(),
  sex: z.enum(['H', 'F', 'A']).optional().nullable(),
});

export type InscriptionPubliqueInput = z.infer<
  typeof InscriptionPubliqueInputSchema
>;

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
