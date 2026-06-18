import { z } from 'zod';

import { MOTIF_AUTRE_VALUE } from './motifs';

export const RdvStatutSchema = z.enum([
  'en_attente',
  'confirme',
  'present',
  'absent',
  'annule',
]);

export const DisponibilitesSchema = z.object({
  date: z.string(),
  slots: z.array(z.string()),
});

export type Disponibilites = z.infer<typeof DisponibilitesSchema>;

export const ReservationInputSchema = z.object({
  date: z.string(),
  heure_debut: z.string(),
  patient_nom: z.string().min(1, 'Nom requis'),
  patient_prenom: z.string().min(1, 'Prénom requis'),
  patient_phone: z.string().min(9, 'Téléphone invalide'),
  patient_email: z.string().email().optional().or(z.literal('')),
  motif: z.string().optional(),
  want_reminder: z.boolean().default(true),
});

// `motif` est optionnel et libre : soit l'un des MOTIF_OPTIONS, soit le texte
// saisi via « Autre ». Il n'est jamais une chaîne vide dans le payload (omis
// si l'utilisateur ne choisit rien). Voir `types/motifs.ts`.
export type ReservationInput = z.infer<typeof ReservationInputSchema>;

/* ─── motif (formulaire public) ───────────────────────────────────────────── */

/**
 * Schéma du formulaire de réservation : ajoute `motif_autre`, le champ libre
 * affiché lorsque l'utilisateur choisit « Autre ». `motif_autre` n'est jamais
 * envoyé tel quel au backend — il remplace `motif` au moment de la soumission.
 */
export const ReservationFormSchema = ReservationInputSchema.extend({
  motif_autre: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.motif === MOTIF_AUTRE_VALUE && !values.motif_autre?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['motif_autre'],
      message: 'Veuillez préciser le motif',
    });
  }
});

export type ReservationFormInput = z.infer<typeof ReservationFormSchema>;

export const RendezVousSchema = z.object({
  id: z.number(),
  numero_rdv: z.string(),
  date: z.string(),
  heure_debut: z.string(),
  heure_fin: z.string(),
  patient_nom: z.string(),
  patient_prenom: z.string(),
  patient_phone: z.string(),
  patient_email: z.string(),
  motif: z.string(),
  statut: RdvStatutSchema,
  notes_internes: z.string(),
  token_annulation: z.string(),
  reschedule_count: z.number(),
  want_reminder: z.boolean(),
  created: z.string(),
});

export type RendezVous = z.infer<typeof RendezVousSchema>;

export const RendezVousConfirmationSchema = z.object({
  numero_rdv: z.string(),
  date: z.string(),
  heure_debut: z.string(),
  heure_fin: z.string(),
  patient_nom: z.string(),
  patient_prenom: z.string(),
  patient_phone: z.string(),
  token_annulation: z.string(),
});

export type RendezVousConfirmation = z.infer<
  typeof RendezVousConfirmationSchema
>;

export const PaginatedRdvSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(RendezVousSchema),
});

export type PaginatedRdv = z.infer<typeof PaginatedRdvSchema>;

export const RdvConfigSchema = z.object({
  slot_duration: z.number(),
  heure_debut: z.string(),
  heure_fin: z.string(),
  capacite_par_slot: z.number(),
  buffer_avance_heures: z.number(),
  reschedule_limit: z.number().optional(),
  reschedule_token_ttl_minutes: z.number().optional(),
  buffer_inter_slots: z.number().optional(),
  max_rdv_par_jour: z.number().optional(),
  lundi: z.boolean(),
  mardi: z.boolean(),
  mercredi: z.boolean(),
  jeudi: z.boolean(),
  vendredi: z.boolean(),
  samedi: z.boolean(),
  dimanche: z.boolean(),
});

export type RdvConfig = z.infer<typeof RdvConfigSchema>;

export const ReminderConfigSchema = z.object({
  rappel_j1_actif: z.boolean(),
  rappel_j1_heure: z.string(),
  rappel_h2_actif: z.boolean(),
  canal: z.enum(['in_app', 'email', 'both']),
  message_template: z.string(),
});

export type ReminderConfig = z.infer<typeof ReminderConfigSchema>;

export const JourFermeSchema = z.object({
  id: z.number(),
  date: z.string(),
  motif: z.string().optional(),
});

export type JourFerme = z.infer<typeof JourFermeSchema>;

// Réponse de GET /rendez-vous/statistiques/ : un compteur par statut. Aligné
// sur RdvStatutSchema et sur l'usage dans la page gestion (statsData.en_attente…).
export const RdvStatsSchema = z.object({
  en_attente: z.number(),
  confirme: z.number(),
  present: z.number(),
  absent: z.number(),
  annule: z.number(),
});

export type RdvStats = z.infer<typeof RdvStatsSchema>;
