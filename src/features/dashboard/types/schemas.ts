import { z } from 'zod';

const examsTodaySchema = z.object({
  adult: z.number(),
  child: z.number(),
  total: z.number(),
});

const examsLast7DaysItemSchema = z.object({
  date: z.string(),
  total: z.number(),
});

const examsSchema = z.object({
  today: examsTodaySchema,
  last_7_days: z.array(examsLast7DaysItemSchema),
});

const patientsSchema = z.object({
  total: z.number(),
  today_new: z.number(),
});

const conducteursSchema = z.object({
  total: z.number(),
  today_new: z.number(),
});

const rendezVousTodaySchema = z.object({
  total: z.number(),
  by_statut: z.record(z.string(), z.number()),
});

const prochainsRendezVousSchema = z.object({
  id: z.number(),
  heure_debut: z.string().nullable().optional(),
  patient_nom: z.string(),
  patient_prenom: z.string(),
  statut: z.string(),
  numero_rdv: z.string().optional(),
});

const rendezVousSchema = z.object({
  today: rendezVousTodaySchema,
  prochains: z.array(prochainsRendezVousSchema),
  pending_count: z.number().default(0),
});

const evenementEnCoursSchema = z.object({
  id: z.number(),
  titre: z.string(),
  lieu: z.string(),
  inscrits: z.number(),
  presents: z.number(),
});

const evenementPlanifieSchema = z.object({
  id: z.number(),
  titre: z.string(),
  date_event: z.string(),
  lieu: z.string(),
  inscrits: z.number(),
});

const evenementsSchema = z.object({
  en_cours: z.array(evenementEnCoursSchema),
  planifies_7j: z.array(evenementPlanifieSchema),
  inscriptions_aujourd_hui: z.number(),
  pending_count: z.number().default(0),
});

export const dashboardSchema = z.object({
  generated_at: z.string(),
  examens: examsSchema,
  patients: patientsSchema,
  conducteurs: conducteursSchema,
  rendez_vous: rendezVousSchema,
  evenements: evenementsSchema,
});

export type Dashboard = z.infer<typeof dashboardSchema>;
export type ExamsLast7DaysItem = z.infer<typeof examsLast7DaysItemSchema>;
export type ProchainsRendezVous = z.infer<typeof prochainsRendezVousSchema>;
export type EvenementEnCours = z.infer<typeof evenementEnCoursSchema>;
