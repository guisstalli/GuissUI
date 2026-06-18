import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type {
  Patient,
  PatientList,
  PaginatedPatientsResponse,
} from '@/features/patients/types/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

export const mockPatient1: PatientList = {
  id: 1,
  numero_identifiant: 'PAT-2026-001',
  last_name: 'Diallo',
  name: 'Aminata',
  full_name: 'Aminata Diallo',
  date_de_naissance: '1990-05-15',
  age: 36,
  sex: 'F',
  is_adult: true,
  has_driver: false,
  phone_number: '+221 77 100 00 01',
  created: '2026-01-10T08:00:00.000Z',
};

export const mockPatient2: PatientList = {
  id: 2,
  numero_identifiant: 'PAT-2026-002',
  last_name: 'Ndiaye',
  name: 'Oumar',
  full_name: 'Oumar Ndiaye',
  date_de_naissance: '1985-03-20',
  age: 41,
  sex: 'H',
  is_adult: true,
  has_driver: true,
  phone_number: null,
  created: '2026-01-15T08:00:00.000Z',
};

export const mockPatientChild: PatientList = {
  id: 3,
  numero_identifiant: 'PAT-2026-003',
  last_name: 'Sow',
  name: 'Fatou',
  full_name: 'Fatou Sow',
  date_de_naissance: '2015-07-10',
  age: 10,
  sex: 'F',
  is_adult: false,
  has_driver: false,
  phone_number: null,
  created: '2026-02-01T08:00:00.000Z',
};

export const mockPatientFull: Patient = {
  id: 1,
  numero_identifiant: 'PAT-2026-001',
  last_name: 'Diallo',
  name: 'Aminata',
  full_name: 'Aminata Diallo',
  date_de_naissance: '1990-05-15',
  age: 36,
  sex: 'F',
  is_adult: true,
  has_driver: false,
  phone_number: '+221 77 100 00 01',
  examens_count: { adult: 2, child: 0 },
  created: '2026-01-10T08:00:00.000Z',
  modified: '2026-03-01T10:00:00.000Z',
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const patientsHandlers = [
  // GET /depistage/patients/ — liste paginée
  http.get(`${env.API_URL}/depistage/patients/`, ({ request }) => {
    const url = new URL(request.url);
    const isDriverFilter = url.searchParams.get('is_driver');
    const search = url.searchParams.get('search');

    let results = [mockPatient1, mockPatient2, mockPatientChild];

    // Filtre is_driver
    if (isDriverFilter === 'false') {
      results = results.filter((p) => !p.has_driver);
    } else if (isDriverFilter === 'true') {
      results = results.filter((p) => p.has_driver);
    }

    // Filtre search basique
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((p) => p.full_name.toLowerCase().includes(q));
    }

    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results,
    } satisfies PaginatedPatientsResponse);
  }),

  // GET /depistage/patients/:id/
  http.get(`${env.API_URL}/depistage/patients/:id/`, ({ params }) => {
    const id = Number(params.id);
    if (id === 1) {
      return HttpResponse.json(mockPatientFull);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // POST /depistage/patients/create/
  http.post(
    `${env.API_URL}/depistage/patients/create/`,
    async ({ request }) => {
      const body = (await request.json()) as {
        last_name: string;
        name: string;
        date_de_naissance: string;
        sex: string;
        phone_number?: string | null;
      };

      const created: Patient = {
        id: 99,
        numero_identifiant: 'PAT-2026-099',
        last_name: body.last_name,
        name: body.name,
        full_name: `${body.name} ${body.last_name}`,
        date_de_naissance: body.date_de_naissance,
        age: 25,
        sex: body.sex as 'H' | 'F' | 'A',
        is_adult: true,
        has_driver: false,
        phone_number: body.phone_number ?? null,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      };
      return HttpResponse.json(created, { status: 201 });
    },
  ),

  // DELETE /depistage/patients/:id/delete/ (soft-delete)
  http.delete(`${env.API_URL}/depistage/patients/:id/delete/`, ({ params }) => {
    const id = Number(params.id);
    if (id === 9999) {
      return new HttpResponse(null, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /depistage/patients/:id/restore/
  http.post(`${env.API_URL}/depistage/patients/:id/restore/`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({ ...mockPatientFull, id });
  }),

  // GET /depistage/patients/deleted/
  http.get(`${env.API_URL}/depistage/patients/deleted/`, () => {
    return HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    } satisfies PaginatedPatientsResponse);
  }),

  // GET /depistage/patients/adults/
  http.get(`${env.API_URL}/depistage/patients/adults/`, () => {
    const adults = [mockPatient1, mockPatient2];
    return HttpResponse.json({
      count: adults.length,
      next: null,
      previous: null,
      results: adults,
    } satisfies PaginatedPatientsResponse);
  }),

  // GET /depistage/patients/children/
  http.get(`${env.API_URL}/depistage/patients/children/`, () => {
    const children = [mockPatientChild];
    return HttpResponse.json({
      count: children.length,
      next: null,
      previous: null,
      results: children,
    } satisfies PaginatedPatientsResponse);
  }),
];
