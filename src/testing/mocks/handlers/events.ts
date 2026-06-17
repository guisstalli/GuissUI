import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import type {
  EventPublic,
  EventStaff,
  InscriptionConfirmation,
  PaginatedEvents,
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

export const eventsHandlers = [
  http.get(`${env.API_URL}/events/public/`, () =>
    HttpResponse.json(mockPaginatedEvents),
  ),

  http.get(`${env.API_URL}/events/public/:slug/`, ({ params }) => {
    const event = mockPublicEvents.find((e) => e.slug === params.slug);
    if (!event) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(event);
  }),

  http.post(
    `${env.API_URL}/events/public/:slug/inscrire/`,
    () => HttpResponse.json(mockInscriptionConfirmation, { status: 201 }),
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

  http.get(`${env.API_URL}/events/:id/qr-code/`, () => {
    // Return a minimal 1×1 PNG blob
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0,
      1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68,
      65, 84, 8, 215, 99, 248, 15, 0, 0, 1, 1, 0, 5, 24, 212, 221, 0, 0, 0, 0,
      73, 69, 78, 68, 174, 66, 96, 130,
    ]);
    return new HttpResponse(pngBytes, {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    });
  }),
];
