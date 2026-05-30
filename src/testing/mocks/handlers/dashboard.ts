import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type { Dashboard } from '@/features/dashboard/types/schemas';

export const mockDashboard: Dashboard = {
  generated_at: '2026-05-11T08:00:00Z',
  examens: {
    today: { adult: 12, child: 5, total: 17 },
    last_7_days: [
      { date: '2026-05-05', total: 10 },
      { date: '2026-05-06', total: 14 },
      { date: '2026-05-07', total: 8 },
      { date: '2026-05-08', total: 20 },
      { date: '2026-05-09', total: 16 },
      { date: '2026-05-10', total: 11 },
      { date: '2026-05-11', total: 17 },
    ],
  },
  patients: { total: 340, today_new: 3 },
  conducteurs: { total: 120, today_new: 1 },
  rendez_vous: {
    today: { total: 9, by_statut: { PLANIFIE: 4, CONFIRME: 3, EN_COURS: 2 } },
    pending_count: 0,
    prochains: [
      {
        id: 1,
        heure_debut: '2026-05-11T09:30:00Z',
        patient_nom: 'Dupont',
        patient_prenom: 'Marie',
        statut: 'CONFIRME',
      },
      {
        id: 2,
        heure_debut: '2026-05-11T10:00:00Z',
        patient_nom: 'Martin',
        patient_prenom: 'Jean',
        statut: 'PLANIFIE',
      },
    ],
  },
  evenements: {
    en_cours: [
      {
        id: 10,
        titre: 'Campagne de dépistage A',
        lieu: 'Centre Médical Nord',
        inscrits: 50,
        presents: 42,
      },
    ],
    planifies_7j: [
      {
        id: 11,
        titre: 'Journée santé',
        date_event: '2026-05-14',
        lieu: 'Hôpital Central',
        inscrits: 30,
      },
    ],
    inscriptions_aujourd_hui: 7,
    pending_count: 0,
  },
};

export const dashboardHandlers = [
  http.get(`${env.API_URL}/api/v1/dashboard/`, () =>
    HttpResponse.json(mockDashboard),
  ),
];
