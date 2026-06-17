import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type {
  Driver,
  PaginatedDrivers,
} from '@/features/drivers/types/schemas';

// ─── Fixtures ────────────────────────────────────────────────────────────────

export const mockDriver1: Driver = {
  id: 1,
  patient: {
    id: 2,
    numero_identifiant: 'PAT-2026-002',
    full_name: 'Oumar Ndiaye',
    date_de_naissance: '1985-03-20',
    sex: 'H',
    phone_number: null,
    at_risk: false,
    is_adult: true,
  },
  numero_permis: 'SN-00001',
  type_permis: 'Leger',
  autre_type_permis: null,
  date_delivrance_permis: '2010-06-15',
  date_peremption_permis: '2030-06-15',
  transporteur_professionnel: false,
  service: 'Prive',
  annees_experience: 15,
  type_vehicule_conduit: 'Leger',
  type_instruction_suivie: 'Française',
  niveau_instruction: 'Secondaire',
  prise_en_charge: null,
  zone_de_residence: 'Dakar',
  image: null,
  created: '2026-01-15T08:00:00Z',
  modified: '2026-03-01T10:00:00Z',
  is_deleted: false,
  deleted_at: null,
};

export const mockDriver2: Driver = {
  id: 2,
  patient: {
    id: 5,
    numero_identifiant: 'PAT-2026-005',
    full_name: 'Mamadou Ba',
    date_de_naissance: '1978-11-02',
    sex: 'H',
    phone_number: '+221 77 200 00 02',
    at_risk: true,
    is_adult: true,
  },
  numero_permis: 'SN-00002',
  type_permis: 'Lourd',
  autre_type_permis: null,
  date_delivrance_permis: '2005-09-20',
  date_peremption_permis: '2025-09-20',
  transporteur_professionnel: true,
  service: 'Public',
  annees_experience: 20,
  type_vehicule_conduit: 'Lourd',
  type_instruction_suivie: 'Française',
  niveau_instruction: 'Primaire',
  prise_en_charge: 'GRATUIT',
  zone_de_residence: 'Thies',
  image: null,
  created: '2026-02-01T08:00:00Z',
  modified: '2026-04-01T10:00:00Z',
  is_deleted: false,
  deleted_at: null,
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const driversHandlers = [
  // GET /conducteurs/ — liste paginée
  http.get(`${env.API_URL}/conducteurs/`, ({ request }) => {
    const url = new URL(request.url);
    const atRisk = url.searchParams.get('at_risk');

    let results = [mockDriver1, mockDriver2];

    if (atRisk === 'true') {
      results = results.filter((d) => d.patient.at_risk);
    } else if (atRisk === 'false') {
      results = results.filter((d) => !d.patient.at_risk);
    }

    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results,
    } satisfies PaginatedDrivers);
  }),

  // GET /conducteurs/:id/
  http.get(`${env.API_URL}/conducteurs/:id/`, ({ params }) => {
    const id = Number(params.id);
    if (id === 1) {
      return HttpResponse.json(mockDriver1);
    }
    if (id === 2) {
      return HttpResponse.json(mockDriver2);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // POST /conducteurs/create/
  http.post(`${env.API_URL}/conducteurs/create/`, async ({ request }) => {
    const body = (await request.json()) as {
      patient: {
        name: string;
        last_name: string;
        date_de_naissance: string;
        sex: string;
        phone_number?: string | null;
      };
      numero_permis: string;
      type_permis: string;
      zone_de_residence: string;
      service: string;
      annees_experience: number;
      type_vehicule_conduit: string;
      type_instruction_suivie: string;
      niveau_instruction: string;
      date_delivrance_permis: string;
      date_peremption_permis: string;
      transporteur_professionnel: boolean;
      prise_en_charge?: string | null;
      autre_type_permis?: string;
    };

    const created: Driver = {
      id: 99,
      patient: {
        id: 99,
        numero_identifiant: 'PAT-2026-099',
        full_name: `${body.patient.name} ${body.patient.last_name}`,
        date_de_naissance: body.patient.date_de_naissance,
        sex: body.patient.sex as 'H' | 'F' | 'A',
        phone_number: body.patient.phone_number ?? null,
        at_risk: false,
        is_adult: true,
      },
      numero_permis: body.numero_permis,
      type_permis: body.type_permis as 'Leger' | 'Lourd' | 'Autres',
      autre_type_permis: body.autre_type_permis ?? null,
      date_delivrance_permis: body.date_delivrance_permis,
      date_peremption_permis: body.date_peremption_permis,
      transporteur_professionnel: body.transporteur_professionnel,
      service: body.service as 'Public' | 'Prive' | 'Particulier',
      annees_experience: body.annees_experience,
      type_vehicule_conduit: body.type_vehicule_conduit as
        | 'Leger'
        | 'Lourd'
        | 'Autres',
      type_instruction_suivie: body.type_instruction_suivie as
        | 'Française'
        | 'Arabe',
      niveau_instruction: body.niveau_instruction as
        | 'Primaire'
        | 'Secondaire'
        | 'Superieure'
        | 'Autres'
        | 'Aucune',
      prise_en_charge: body.prise_en_charge ?? null,
      zone_de_residence: body.zone_de_residence as Driver['zone_de_residence'],
      image: null,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      is_deleted: false,
      deleted_at: null,
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  // DELETE /conducteurs/:id/delete/ (soft-delete)
  http.delete(`${env.API_URL}/conducteurs/:id/delete/`, ({ params }) => {
    const id = Number(params.id);
    if (id === 9999) {
      return new HttpResponse(null, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /conducteurs/deleted/
  http.get(`${env.API_URL}/conducteurs/deleted/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    } satisfies PaginatedDrivers);
  }),
];
