import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import type {
  PaginatedRdv,
  RendezVous,
  RendezVousConfirmation,
} from '@/features/appointments/types/schemas';

export const mockRdvList: RendezVous[] = [
  {
    id: 1,
    numero_rdv: 'RDV-2024-001',
    date: '2024-06-20',
    heure_debut: '09:00',
    heure_fin: '09:30',
    patient_nom: 'Diallo',
    patient_prenom: 'Aminata',
    patient_phone: '+221 77 123 45 67',
    patient_email: 'aminata.diallo@example.sn',
    motif: 'Consultation de routine',
    statut: 'en_attente',
    notes_internes: '',
    token_annulation: 'tok-abc-123',
    reschedule_count: 0,
    want_reminder: true,
    created: '2024-06-10T08:00:00Z',
  },
  {
    id: 2,
    numero_rdv: 'RDV-2024-002',
    date: '2024-06-21',
    heure_debut: '10:00',
    heure_fin: '10:30',
    patient_nom: 'Sow',
    patient_prenom: 'Ibrahima',
    patient_phone: '+221 76 987 65 43',
    patient_email: '',
    motif: 'Renouvellement ordonnance',
    statut: 'confirme',
    notes_internes: '',
    token_annulation: 'tok-def-456',
    reschedule_count: 0,
    want_reminder: true,
    created: '2024-06-11T09:00:00Z',
  },
];

const mockPaginatedRdv: PaginatedRdv = {
  count: 2,
  next: null,
  previous: null,
  results: mockRdvList,
};

const mockConfirmation: RendezVousConfirmation = {
  numero_rdv: 'RDV-2024-099',
  date: '2024-06-25',
  heure_debut: '14:00',
  heure_fin: '14:30',
  patient_nom: 'Test',
  patient_prenom: 'Patient',
  patient_phone: '+221 77 000 00 00',
  token_annulation: 'tok-new-999',
};

export const appointmentsHandlers = [
  http.get(`${env.API_URL}/rendez-vous/`, () =>
    HttpResponse.json(mockPaginatedRdv),
  ),

  http.get(`${env.API_URL}/rendez-vous/statistiques/`, () =>
    HttpResponse.json({
      en_attente: 5,
      confirme: 3,
      present: 10,
      absent: 2,
      annule: 1,
    }),
  ),

  http.get(`${env.API_URL}/rendez-vous/disponibilites/`, () =>
    HttpResponse.json({
      date: '2024-06-25',
      slots: ['09:00', '09:30', '10:00', '14:00', '14:30'],
    }),
  ),

  http.post(`${env.API_URL}/rendez-vous/reserver/`, () =>
    HttpResponse.json(mockConfirmation, { status: 201 }),
  ),

  http.patch(
    `${env.API_URL}/rendez-vous/:id/confirmer/`,
    ({ params }) =>
      HttpResponse.json({
        ...mockRdvList[0],
        id: Number(params.id),
        statut: 'confirme',
      }),
  ),

  http.patch(
    `${env.API_URL}/rendez-vous/:id/annuler/`,
    ({ params }) =>
      HttpResponse.json({
        ...mockRdvList[0],
        id: Number(params.id),
        statut: 'annule',
      }),
  ),

  http.patch(
    `${env.API_URL}/rendez-vous/:id/present/`,
    ({ params }) =>
      HttpResponse.json({
        ...mockRdvList[0],
        id: Number(params.id),
        statut: 'present',
      }),
  ),

  http.patch(
    `${env.API_URL}/rendez-vous/:id/absent/`,
    ({ params }) =>
      HttpResponse.json({
        ...mockRdvList[0],
        id: Number(params.id),
        statut: 'absent',
      }),
  ),
];
