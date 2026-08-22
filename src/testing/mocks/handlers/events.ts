import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type {
  EventPublic,
  EventStaff,
  InscriptionConfirmation,
  PaginatedEvents,
  PatientExistant,
} from '@/features/events/types/schemas';

export const mockPublicEvents: EventPublic[] = [
  {
    numero_evenement: 'EVT-2024-001',
    titre: 'Campagne de dépistage visuel — Thiès',
    description:
      'Dépistage ophtalmologique gratuit pour les conducteurs de la région.',
    slug: 'campagne-depistage-thies-2024',
    date_event: '2024-07-15',
    heure_debut: '08:00',
    heure_fin: '17:00',
    lieu: 'Centre de santé de Thiès',
    capacite_max: 100,
    places_restantes: 45,
    pour_conducteurs: true,
    type_examen: 'adulte',
    statut: 'planifie',
  },
  {
    numero_evenement: 'EVT-2024-002',
    titre: 'Journée vision enfants — Dakar',
    description: 'Examen ophtalmologique pour les enfants en âge scolaire.',
    slug: 'vision-enfants-dakar-2024',
    date_event: '2024-07-20',
    heure_debut: '09:00',
    heure_fin: '16:00',
    lieu: 'École Léopold Sédar Senghor',
    capacite_max: 50,
    places_restantes: 10,
    pour_conducteurs: false,
    type_examen: 'enfant',
    statut: 'planifie',
  },
];

export const mockStaffEvents: EventStaff[] = mockPublicEvents.map((e, i) => ({
  ...e,
  id: i + 1,
  created: '2024-06-01T10:00:00Z',
}));

const mockPaginatedEvents: PaginatedEvents = {
  count: 2,
  next: null,
  previous: null,
  results: mockPublicEvents,
};

const mockInscriptionConfirmation: InscriptionConfirmation = {
  numero_inscription: 'INS-2024-001',
  nom: 'Diop',
  prenom: 'Fatou',
  phone_number: '+221 77 111 22 33',
  statut: 'inscrit',
  inscrit_at: '2024-06-20T10:30:00Z',
};

// ─── Inscriptions ────────────────────────────────────────────────────────────

/** Patient portant déjà le numéro de l'inscription #2. */
export const mockInscriptionPatientExistant: PatientExistant = {
  id: 42,
  numero_identifiant: 'PAT-2026-042',
  full_name: 'Fatou Diop',
  date_de_naissance: '1991-04-03',
  age: 34,
  sex: 'F',
  is_adult: true,
  examens_count: 3,
  has_driver: false,
  driver_id: null,
  is_deleted: false,
};

/**
 * Trois cas de figure exposés par la liste :
 * - #1 : aucun patient → « Créer patient » légitime.
 * - #2 : numéro déjà pris → rattachement, jamais création (l'API répondait 500).
 * - #3 : patient déjà rattaché → consultation du dossier.
 */
export const mockInscriptions = [
  {
    id: 1,
    numero_inscription: 'INS-2026-001',
    nom: 'Ndiaye',
    prenom: 'Awa',
    phone_number: '+221771111111',
    date_de_naissance: '1995-02-01',
    sex: 'F',
    statut: 'inscrit',
    patient_id: null,
    patient_existant: null,
    pour_conducteurs: false,
    driver_data: null,
    inscrit_at: '2026-03-01T09:00:00.000Z',
    presente_at: null,
  },
  {
    id: 2,
    numero_inscription: 'INS-2026-002',
    nom: 'Diop',
    prenom: 'Fatou',
    phone_number: '+221775726004',
    date_de_naissance: '1991-04-03',
    sex: 'F',
    statut: 'inscrit',
    patient_id: null,
    patient_existant: mockInscriptionPatientExistant,
    pour_conducteurs: false,
    driver_data: null,
    inscrit_at: '2026-03-01T09:05:00.000Z',
    presente_at: null,
  },
  {
    id: 3,
    numero_inscription: 'INS-2026-003',
    nom: 'Fall',
    prenom: 'Moussa',
    phone_number: '+221772222222',
    date_de_naissance: '1980-11-20',
    sex: 'H',
    statut: 'present',
    patient_id: 7,
    patient_existant: null,
    pour_conducteurs: false,
    driver_data: null,
    inscrit_at: '2026-03-01T09:10:00.000Z',
    presente_at: '2026-03-02T08:30:00.000Z',
  },
];

export const mockEventStats = {
  inscrits: 2,
  presents: 1,
  absents: 0,
  annules: 0,
  total: 3,
  taux_presence: 33.3,
};

export const eventsHandlers = [
  http.get(`${env.API_URL}/events/public/`, () =>
    HttpResponse.json(mockPaginatedEvents),
  ),

  http.get(`${env.API_URL}/events/public/:slug/`, ({ params }) => {
    const event = mockPublicEvents.find((e) => e.slug === params.slug);
    if (!event) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(event);
  }),

  http.post(`${env.API_URL}/events/public/:slug/inscrire/`, () =>
    HttpResponse.json(mockInscriptionConfirmation, { status: 201 }),
  ),

  http.get(`${env.API_URL}/events/`, () =>
    HttpResponse.json({
      count: mockStaffEvents.length,
      next: null,
      previous: null,
      results: mockStaffEvents,
    }),
  ),

  http.post(`${env.API_URL}/events/creer/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created: EventStaff = {
      id: 99,
      numero_evenement: 'EVT-2024-099',
      titre: String(body.titre ?? ''),
      description: String(body.description ?? ''),
      slug: 'nouvel-evenement-2024',
      date_event: String(body.date_event ?? '2024-07-30'),
      heure_debut: String(body.heure_debut ?? '08:00'),
      heure_fin: String(body.heure_fin ?? '17:00'),
      lieu: String(body.lieu ?? ''),
      capacite_max: body.capacite_max ? Number(body.capacite_max) : null,
      places_restantes: body.capacite_max ? Number(body.capacite_max) : null,
      pour_conducteurs: Boolean(body.pour_conducteurs),
      type_examen: 'adulte',
      statut: 'planifie',
      created: new Date().toISOString(),
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get(`${env.API_URL}/events/:id/`, ({ params }) => {
    const id = Number(params.id);
    const event =
      mockStaffEvents.find((e) => e.id === id) ?? mockStaffEvents[0];
    return HttpResponse.json({ ...event, id });
  }),

  http.get(`${env.API_URL}/events/:id/inscriptions/`, () =>
    HttpResponse.json({
      count: mockInscriptions.length,
      next: null,
      previous: null,
      results: mockInscriptions,
    }),
  ),

  http.get(`${env.API_URL}/events/:id/statistiques/`, () =>
    HttpResponse.json(mockEventStats),
  ),

  // Le serveur annonce ce qu'il a fait : `rattache` quand le numéro désignait
  // déjà un patient, `cree` sinon. L'écran adapte son message en conséquence.
  http.post(
    `${env.API_URL}/events/:id/inscriptions/:inscriptionId/convert/`,
    ({ params }) => {
      const inscriptionId = Number(params.inscriptionId);
      const inscription = mockInscriptions.find((i) => i.id === inscriptionId);
      const patientExistant = inscription?.patient_existant ?? null;
      return HttpResponse.json({
        action: patientExistant ? 'rattache' : 'cree',
        patient_id: patientExistant ? patientExistant.id : 99,
      });
    },
  ),

  http.get(`${env.API_URL}/events/:id/qr-code/`, () => {
    // Return a minimal 1×1 PNG blob
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84,
      8, 215, 99, 248, 15, 0, 0, 1, 1, 0, 5, 24, 212, 221, 0, 0, 0, 0, 73, 69,
      78, 68, 174, 66, 96, 130,
    ]);
    return new HttpResponse(pngBytes, {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    });
  }),
];
