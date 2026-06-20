import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type {
  MedicamentAdmin,
  PaginatedMedicaments,
} from '@/features/medicaments-admin/types/schemas';

export const mockMedicaments: MedicamentAdmin[] = [
  {
    id: 1,
    dci: 'timolol',
    atc_code: 'S01ED01',
    atc_libelle: 'Bêtabloquant antiglaucomateux',
    nom_commercial: 'Timoptol',
    forme_galenique: 'COLLYRE',
    forme_galenique_label: 'Collyre',
    dosage_defaut: '0.5%',
    posologie_defaut: '1 goutte 2 fois par jour',
    duree_defaut_jours: 30,
    actif: true,
    created: '2024-01-01T10:00:00Z',
    modified: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    dci: 'latanoprost',
    atc_code: 'S01EE01',
    atc_libelle: 'Analogue de la prostaglandine',
    nom_commercial: 'Xalatan',
    forme_galenique: 'COLLYRE',
    forme_galenique_label: 'Collyre',
    dosage_defaut: '0.005%',
    posologie_defaut: '1 goutte le soir',
    duree_defaut_jours: 30,
    actif: true,
    created: '2024-01-02T10:00:00Z',
    modified: '2024-01-02T10:00:00Z',
  },
  {
    id: 3,
    dci: 'prednisolone',
    atc_code: 'S01BA04',
    atc_libelle: 'Corticostéroïde ophtalmique',
    nom_commercial: 'Predsol',
    forme_galenique: 'POMMADE',
    forme_galenique_label: 'Pommade ophtalmique',
    dosage_defaut: '0.5%',
    posologie_defaut: '3 fois par jour',
    duree_defaut_jours: 7,
    actif: false,
    created: '2024-01-03T10:00:00Z',
    modified: '2024-01-03T10:00:00Z',
  },
];

const mockPaginatedMedicaments: PaginatedMedicaments = {
  count: 3,
  next: null,
  previous: null,
  limit: 20,
  offset: 0,
  results: mockMedicaments,
};

export const medicamentsAdminHandlers = [
  http.get(`${env.API_URL}/depistage/medicaments/`, () =>
    HttpResponse.json(mockPaginatedMedicaments),
  ),

  http.post(`${env.API_URL}/depistage/medicaments/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created: MedicamentAdmin = {
      id: 99,
      dci: String(body.dci ?? ''),
      atc_code: String(body.atc_code ?? ''),
      atc_libelle: String(body.atc_libelle ?? ''),
      nom_commercial: String(body.nom_commercial ?? ''),
      forme_galenique: 'COLLYRE',
      forme_galenique_label: 'Collyre',
      dosage_defaut: String(body.dosage_defaut ?? ''),
      posologie_defaut: String(body.posologie_defaut ?? ''),
      duree_defaut_jours: null,
      actif: body.actif !== false,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch(
    `${env.API_URL}/depistage/medicaments/:id/`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as Partial<MedicamentAdmin>;
      const existing = mockMedicaments.find((m) => m.id === id);
      if (!existing) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json({ ...existing, ...body });
    },
  ),

  http.delete(`${env.API_URL}/depistage/medicaments/:id/`, ({ params }) => {
    const id = Number(params.id);
    const exists = mockMedicaments.some((m) => m.id === id);
    if (!exists) return new HttpResponse(null, { status: 404 });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(
    `${env.API_URL}/depistage/medicaments/:id/toggle/`,
    ({ params }) => {
      const id = Number(params.id);
      const existing = mockMedicaments.find((m) => m.id === id);
      if (!existing) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json({ ...existing, actif: !existing.actif });
    },
  ),
];
