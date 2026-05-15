import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const FACTURE_STATUT_VALUES = [
  'brouillon',
  'emise',
  'payee',
  'annulee',
] as const;
export const PAIEMENT_MODE_VALUES = [
  'especes',
  'cheque',
  'virement',
  'carte',
  'mobile_money',
  'autre',
] as const;

// ─── Prestation ───────────────────────────────────────────────────────────────

export const BillingPreferencesSchema = z.object({
  prefixe_facture: z.string(),
  prochain_numero: z.number(),
  conditions_paiement: z.string(),
  mention_legale: z.string(),
  devise: z.string(),
});

export type BillingPreferences = z.infer<typeof BillingPreferencesSchema>;

export const PrestationSchema = z.object({
  id: z.number(),
  libelle: z.string(),
  description: z.string(),
  prix: z.string(),
  prix_display: z.string(),
  is_active: z.boolean(),
});

export type Prestation = z.infer<typeof PrestationSchema>;

// ─── Ligne Facture ────────────────────────────────────────────────────────────

export const LigneFactureSchema = z.object({
  id: z.number(),
  prestation_id: z.number().nullable(),
  prestation_libelle: z.string().nullable().optional(),
  description: z.string(),
  quantite: z.number(),
  prix_unitaire: z.string(),
  montant_total: z.string(),
  montant_total_display: z.string().optional(),
});

export type LigneFacture = z.infer<typeof LigneFactureSchema>;

// ─── Paiement ─────────────────────────────────────────────────────────────────

export const PaiementSchema = z.object({
  id: z.number(),
  montant: z.string(),
  montant_display: z.string().optional(),
  mode: z.enum(PAIEMENT_MODE_VALUES),
  mode_display: z.string().optional(),
  date_paiement: z.string(),
  reference: z.string().nullable().optional(),
  created: z.string().optional(),
});

export type Paiement = z.infer<typeof PaiementSchema>;

// ─── Facture ──────────────────────────────────────────────────────────────────

export const FactureSchema = z.object({
  id: z.number(),
  numero: z.string(),
  site_id: z.number(),
  site_libelle: z.string(),
  rendez_vous_id: z.number().nullable(),
  rendez_vous_numero: z.string().nullable(),
  patient_nom: z.string(),
  patient_prenom: z.string(),
  patient_phone: z.string(),
  date_emission: z.string(),
  statut: z.enum(FACTURE_STATUT_VALUES),
  statut_display: z.string(),
  montant_total: z.string(),
  montant_total_display: z.string(),
  montant_paye: z.string(),
  reste_a_payer: z.string(),
  notes: z.string(),
  created: z.string(),
  modified: z.string(),
  lignes: z.array(LigneFactureSchema),
  paiements: z.array(PaiementSchema),
});

export type Facture = z.infer<typeof FactureSchema>;

// ─── Paginated Factures ───────────────────────────────────────────────────────

export const PaginatedFacturesSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(FactureSchema),
});

export type PaginatedFactures = z.infer<typeof PaginatedFacturesSchema>;

// ─── Input schemas (for forms) ────────────────────────────────────────────────

export const LigneFactureCreateSchema = z.object({
  prestation_id: z.number().nullable().optional(),
  description: z.string().optional(),
  quantite: z.coerce
    .number()
    .min(1, 'La quantité doit être au moins 1')
    .optional(),
  prix_unitaire: z.string().optional(),
});

export const FactureCreateSchema = z.object({
  site_id: z.number({ required_error: 'Le site est requis' }),
  patient_nom: z.string().optional(),
  patient_prenom: z.string().optional(),
  patient_phone: z.string().optional(),
  rendez_vous_id: z.number().optional(),
  lignes: z
    .array(LigneFactureCreateSchema)
    .min(1, 'Au moins une ligne est requise'),
  notes: z.string().optional(),
});

export const FactureUpdateSchema = z.object({
  lignes: z.array(LigneFactureCreateSchema).optional(),
  notes: z.string().optional(),
});

export const PaiementCreateSchema = z.object({
  montant: z.string().min(1, 'Le montant est requis'),
  mode: z.enum(PAIEMENT_MODE_VALUES, { required_error: 'Le mode est requis' }),
  date_paiement: z.string().min(1, 'La date est requise'),
  reference: z.string().optional(),
});

export type LigneFactureCreate = z.infer<typeof LigneFactureCreateSchema>;
export type FactureCreate = z.infer<typeof FactureCreateSchema>;
export type FactureUpdate = z.infer<typeof FactureUpdateSchema>;
export type PaiementCreate = z.infer<typeof PaiementCreateSchema>;
