import { describe, expect, test } from 'vitest';

import {
  FactureCreateSchema,
  FactureSchema,
  LigneFactureSchema,
  PaginatedFacturesSchema,
  PaiementCreateSchema,
  PrestationSchema,
} from '../schemas';

const validPrestation = {
  id: 1,
  libelle: 'Consultation',
  description: 'Consultation initiale',
  prix: '25000.00',
  prix_display: '25 000 FCFA',
};

const validLigne = {
  id: 1,
  prestation_id: 1,
  prestation_libelle: 'Consultation',
  description: 'Consultation initiale',
  quantite: 1,
  prix_unitaire: '25000.00',
  montant_total: '25000.00',
  montant_total_display: '25 000 FCFA',
};

const validFacture = {
  id: 1,
  numero: 'FAC-2026-001',
  site_id: 1,
  site_libelle: 'Centre Nord',
  rendez_vous_id: null,
  rendez_vous_numero: null,
  patient_nom: 'Dupont',
  patient_prenom: 'Alice',
  patient_phone: '+223 70 00 00 01',
  date_emission: '2026-05-10T08:00:00Z',
  statut: 'emise',
  statut_display: 'Émise',
  montant_total: '25000.00',
  montant_total_display: '25 000 FCFA',
  montant_paye: '0.00',
  reste_a_payer: '25000.00',
  notes: '',
  created: '2026-05-10T08:00:00Z',
  modified: '2026-05-10T08:00:00Z',
  lignes: [validLigne],
  paiements: [],
};

describe('PrestationSchema', () => {
  test('parses a valid prestation', () => {
    const result = PrestationSchema.safeParse(validPrestation);
    expect(result.success).toBe(true);
  });

  test('rejects a prestation missing prix', () => {
    const { prix: _omit, ...without } = validPrestation;
    const result = PrestationSchema.safeParse(without);
    expect(result.success).toBe(false);
  });
});

describe('LigneFactureSchema', () => {
  test('parses a valid ligne with optional fields', () => {
    const result = LigneFactureSchema.safeParse(validLigne);
    expect(result.success).toBe(true);
  });

  test('accepts a ligne with null prestation_id', () => {
    const result = LigneFactureSchema.safeParse({
      ...validLigne,
      prestation_id: null,
    });
    expect(result.success).toBe(true);
  });

  test('rejects a ligne with missing montant_total', () => {
    const { montant_total: _omit, ...without } = validLigne;
    const result = LigneFactureSchema.safeParse(without);
    expect(result.success).toBe(false);
  });
});

describe('FactureSchema', () => {
  test('parses a valid facture with all statut values', () => {
    for (const statut of ['brouillon', 'emise', 'payee', 'annulee'] as const) {
      const result = FactureSchema.safeParse({ ...validFacture, statut });
      expect(result.success).toBe(true);
    }
  });

  test('rejects an unknown statut value', () => {
    const result = FactureSchema.safeParse({
      ...validFacture,
      statut: 'inconnu',
    });
    expect(result.success).toBe(false);
  });

  test('rejects a facture with missing numero', () => {
    const { numero: _omit, ...without } = validFacture;
    const result = FactureSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  test('accepts a facture with empty paiements array', () => {
    const result = FactureSchema.safeParse({ ...validFacture, paiements: [] });
    expect(result.success).toBe(true);
  });

  test('rejects a non-numeric site_id', () => {
    const result = FactureSchema.safeParse({ ...validFacture, site_id: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('PaginatedFacturesSchema', () => {
  test('parses a valid paginated response', () => {
    const payload = {
      count: 1,
      next: null,
      previous: null,
      results: [validFacture],
    };
    const result = PaginatedFacturesSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.results).toHaveLength(1);
    }
  });

  test('parses a response with next/previous pagination links', () => {
    const payload = {
      count: 10,
      next: 'http://api/billing/factures/?offset=5',
      previous: null,
      results: [validFacture],
    };
    const result = PaginatedFacturesSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  test('rejects a response missing count', () => {
    const { count: _omit, ...without } = {
      count: 1,
      next: null,
      previous: null,
      results: [validFacture],
    };
    const result = PaginatedFacturesSchema.safeParse(without);
    expect(result.success).toBe(false);
  });
});

describe('FactureCreateSchema', () => {
  test('parses a valid creation payload', () => {
    const payload = {
      site_id: 1,
      patient_nom: 'Dupont',
      patient_prenom: 'Alice',
      lignes: [{ prestation_id: 1, quantite: 1, prix_unitaire: '25000.00' }],
    };
    const result = FactureCreateSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  test('rejects a payload with no lignes', () => {
    const result = FactureCreateSchema.safeParse({ site_id: 1, lignes: [] });
    expect(result.success).toBe(false);
  });

  test('rejects a payload missing site_id', () => {
    const result = FactureCreateSchema.safeParse({
      lignes: [{ prestation_id: 1, quantite: 1, prix_unitaire: '25000.00' }],
    });
    expect(result.success).toBe(false);
  });

  test('coerces quantite from string to number', () => {
    const payload = {
      site_id: 1,
      lignes: [{ prestation_id: 1, quantite: '2', prix_unitaire: '5000.00' }],
    };
    const result = FactureCreateSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lignes[0].quantite).toBe(2);
    }
  });
});

describe('PaiementCreateSchema', () => {
  test('parses a valid paiement payload', () => {
    const payload = {
      montant: '25000.00',
      mode: 'especes',
      date_paiement: '2026-05-11',
    };
    const result = PaiementCreateSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  test('rejects an invalid mode', () => {
    const result = PaiementCreateSchema.safeParse({
      montant: '25000.00',
      mode: 'bitcoin',
      date_paiement: '2026-05-11',
    });
    expect(result.success).toBe(false);
  });

  test('rejects an empty montant', () => {
    const result = PaiementCreateSchema.safeParse({
      montant: '',
      mode: 'especes',
      date_paiement: '2026-05-11',
    });
    expect(result.success).toBe(false);
  });

  test('accepts all valid mode values', () => {
    for (const mode of [
      'especes',
      'cheque',
      'virement',
      'carte',
      'mobile_money',
      'autre',
    ] as const) {
      const result = PaiementCreateSchema.safeParse({
        montant: '1000.00',
        mode,
        date_paiement: '2026-05-11',
      });
      expect(result.success).toBe(true);
    }
  });
});
