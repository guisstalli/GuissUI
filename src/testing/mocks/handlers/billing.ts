import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type {
  Facture,
  PaginatedFactures,
} from '@/features/billing/types/schemas';

export const mockFacture: Facture = {
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
  lignes: [
    {
      id: 1,
      prestation_id: 1,
      prestation_libelle: 'Consultation',
      description: 'Consultation initiale',
      quantite: 1,
      prix_unitaire: '25000.00',
      montant_total: '25000.00',
      montant_total_display: '25 000 FCFA',
    },
  ],
  paiements: [],
};

export const mockFacture2: Facture = {
  ...mockFacture,
  id: 2,
  numero: 'FAC-2026-002',
  patient_nom: 'Martin',
  patient_prenom: 'Bob',
  statut: 'payee',
  statut_display: 'Payée',
  montant_paye: '25000.00',
  reste_a_payer: '0.00',
};

export const mockPaginatedFactures: PaginatedFactures = {
  count: 2,
  next: null,
  previous: null,
  results: [mockFacture, mockFacture2],
};

export const billingHandlers = [
  http.get(`${env.API_URL}/billing/factures/`, () =>
    HttpResponse.json(mockPaginatedFactures),
  ),

  http.get(`${env.API_URL}/billing/factures/:id/`, ({ params }) => {
    const id = Number(params.id);
    const facture = [mockFacture, mockFacture2].find((f) => f.id === id);
    if (!facture) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(facture);
  }),

  http.post(`${env.API_URL}/billing/factures/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created: Facture = {
      ...mockFacture,
      id: 99,
      numero: 'FAC-2026-099',
      patient_nom: (body.patient_nom as string) ?? '',
      patient_prenom: (body.patient_prenom as string) ?? '',
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post(`${env.API_URL}/billing/factures/:id/emettre/`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      ...mockFacture,
      id,
      statut: 'emise' as const,
      statut_display: 'Émise',
    });
  }),

  http.post(`${env.API_URL}/billing/factures/:id/annuler/`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      ...mockFacture,
      id,
      statut: 'annulee' as const,
      statut_display: 'Annulée',
    });
  }),

  http.post(
    `${env.API_URL}/billing/factures/:id/paiements/`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(
        {
          id: 50,
          montant: body.montant,
          montant_display: `${body.montant} FCFA`,
          mode: body.mode,
          mode_display: body.mode,
          date_paiement: body.date_paiement,
          reference: null,
          created: '2026-05-11T10:00:00Z',
        },
        { status: 201 },
      );
    },
  ),
];
