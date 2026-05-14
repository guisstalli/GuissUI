/**
 * Test data generators for exam E2E tests.
 * Uses @ngneat/falso for random values where appropriate.
 */
import { randFloat, randNumber } from '@ngneat/falso';
import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

export const createPatientViaApi = async (
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
) => {
  // Use timestamp-based suffix for uniqueness across parallel test runs and reruns
  const uid = Date.now().toString(36) + randNumber({ min: 100, max: 999 });
  const res = await request.post(
    `${apiUrl()}/depistage/patients/create/`,
    {
      data: {
        name: `E2E${uid}`,
        last_name: `Test${uid}`,
        date_de_naissance: '1985-06-15',
        sex: 'H',
        ...overrides,
      },
    },
  );
  expect(res.status()).toBe(201);
  return res.json();
};

export const createAdultExamViaApi = async (
  request: APIRequestContext,
  patientId: number,
) => {
  const res = await request.post(
    `${apiUrl()}/depistage/examens/adultes/create/`,
    { data: { patient_id: patientId } },
  );
  expect(res.status()).toBe(201);
  return res.json();
};

export const createChildPatientViaApi = async (
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
) => {
  const uid = Date.now().toString(36) + randNumber({ min: 100, max: 999 });
  const res = await request.post(
    `${apiUrl()}/depistage/patients/create/`,
    {
      data: {
        name: `E2EChild${uid}`,
        last_name: `Test${uid}`,
        date_de_naissance: '2015-06-15',
        sex: 'H',
        ...overrides,
      },
    },
  );
  expect(res.status()).toBe(201);
  return res.json();
};

export const createChildExamViaApi = async (
  request: APIRequestContext,
  patientId: number,
) => {
  const res = await request.post(
    `${apiUrl()}/depistage/examens/enfants/create/`,
    { data: { patient_id: patientId } },
  );
  expect(res.status()).toBe(201);
  return res.json();
};

export const patchExamSectionViaApi = async (
  request: APIRequestContext,
  examId: number,
  section: string,
  data: Record<string, unknown>,
) => {
  const res = await request.patch(
    `${apiUrl()}/depistage/examens/adultes/${examId}/section/`,
    { data: { section, data } },
  );
  expect(res.status()).toBe(200);
  return res.json();
};

// ---------------------------------------------------------------------------
// Data generators
// ---------------------------------------------------------------------------

export function generateVisualAcuity(withCorrection = false) {
  const base = {
    avsc_od: String(randFloat({ min: 1, max: 10, fraction: 1 })),
    avsc_og: String(randFloat({ min: 1, max: 10, fraction: 1 })),
    avac_od: String(randFloat({ min: 1, max: 10, fraction: 1 })),
    avac_og: String(randFloat({ min: 1, max: 10, fraction: 1 })),
    correction: withCorrection,
  };
  if (!withCorrection) return base;
  return {
    ...base,
    avsc_od_avec_correction: String(
      randFloat({ min: 1, max: 10, fraction: 1 }),
    ),
    avsc_og_avec_correction: String(
      randFloat({ min: 1, max: 10, fraction: 1 }),
    ),
    avsc_odg_avec_correction: String(
      randFloat({ min: 1, max: 10, fraction: 1 }),
    ),
    avac_od_avec_correction: String(
      randFloat({ min: 1, max: 10, fraction: 1 }),
    ),
    avac_og_avec_correction: String(
      randFloat({ min: 1, max: 10, fraction: 1 }),
    ),
    avac_odg_avec_correction: String(
      randFloat({ min: 1, max: 10, fraction: 1 }),
    ),
  };
}

export function generateRefraction() {
  return {
    od_s: String(randFloat({ min: -5, max: 5, fraction: 2 })),
    og_s: String(randFloat({ min: -5, max: 5, fraction: 2 })),
    correction: false,
  };
}

export function generateOcularTension() {
  return {
    od: String(randFloat({ min: 10, max: 21, fraction: 1 })),
    og: String(randFloat({ min: 10, max: 21, fraction: 1 })),
  };
}

export function generatePachymetry() {
  return {
    od: String(randFloat({ min: 500, max: 580, fraction: 1 })),
    og: String(randFloat({ min: 500, max: 580, fraction: 1 })),
  };
}

export function generatePlaintesDiplopie() {
  return {
    diplopie: true,
    diplopie_type: 'monoculaire',
    strabisme: false,
    nystagmus: false,
    ptosis: false,
  };
}

export function generatePlaintesStrabisme() {
  return {
    diplopie: false,
    strabisme: true,
    strabisme_eye: 'od',
    strabisme_type: 'convergent',
    nystagmus: false,
    ptosis: false,
  };
}

export function generatePlaintesEmpty() {
  return { diplopie: false, strabisme: false, nystagmus: false, ptosis: false };
}
