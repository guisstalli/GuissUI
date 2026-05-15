import { APIRequestContext, expect } from '@playwright/test';

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export const createPatientViaApi = async (
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
) => {
  const res = await request.post(
    `${apiUrl()}/depistage/patients/create/`,
    {
      data: {
        prenom: 'Mamadou',
        nom: 'Diallo',
        date_de_naissance: '1990-05-15',
        sex: 'M',
        telephone: '+221771234567',
        is_adult: true,
        site_id: 1,
        ...overrides,
      },
    },
  );
  expect(res.status()).toBe(201);
  return res.json();
};

export const createEventViaApi = async (
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
) => {
  const res = await request.post(`${apiUrl()}/api/v1/events/creer/`, {
    data: {
      titre: 'Dépistage Test Fixture',
      description: 'Créé par fixture de test',
      date_event: '2026-06-01',
      heure_debut: '09:00',
      heure_fin: '17:00',
      lieu: 'Centre médical test',
      capacite_max: 50,
      pour_conducteurs: false,
      type_examen: 'ADULTE',
      site_id: 1,
      ...overrides,
    },
  });
  expect(res.status()).toBe(201);
  return res.json();
};

export const createFactureViaApi = async (
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
) => {
  const res = await request.post(`${apiUrl()}/api/v1/billing/factures/`, {
    data: {
      patient_id: 1,
      site_id: 1,
      lignes: [{ prestation: 1, quantite: 1 }],
      ...overrides,
    },
  });
  expect(res.status()).toBe(201);
  return res.json();
};
