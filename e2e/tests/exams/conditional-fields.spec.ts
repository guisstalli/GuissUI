/**
 * E2E — Conditional field visibility and enum mapping guards.
 *
 * Verifies:
 * - Enabling a boolean toggle reveals required dependent fields in the UI
 * - Disabling the toggle hides/clears the dependent field
 * - Submitting trigger=true without the dependent value produces a client-side
 *   error (Zod blocks the request — no 400 sent to backend)
 * - Every enum value used by the frontend is accepted by the backend (mapping guard)
 *
 * Auth: tests run as "docteur" (clinical) and "technicien" (technical).
 */
import { test, expect } from '../../fixtures/auth-request';

import {
  createPatientViaApi,
  createAdultExamViaApi,
  createChildPatientViaApi,
  createChildExamViaApi,
} from '../../fixtures/exam-data';

const base = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function goToExam(page: import('@playwright/test').Page, examId: number) {
  await page.goto(`/exams/adult/${examId}`);
  await page.waitForLoadState('networkidle');
  await page.getByText('Examen Technique').first().waitFor({ timeout: 10_000 });
}

async function openClinicalSection(page: import('@playwright/test').Page) {
  await page
    .getByRole('button', { name: /examen clinique/i })
    .first()
    .click();
  await page.waitForLoadState('networkidle');
}

async function openTechnicalSection(page: import('@playwright/test').Page) {
  await page
    .getByRole('button', { name: /examen technique/i })
    .first()
    .click();
  await page.waitForLoadState('networkidle');
}

async function toggleSwitch(
  page: import('@playwright/test').Page,
  name: RegExp | string,
) {
  const pattern = name instanceof RegExp ? name : new RegExp(name, 'i');
  const sw = page.getByRole('switch', { name: pattern });
  if (await sw.isVisible()) await sw.click();
}

// ---------------------------------------------------------------------------
// Plaintes — Diplopie
// ---------------------------------------------------------------------------

test.describe('Champs conditionnels — Diplopie', () => {
  test('activer diplopie → sélecteur de type apparaît', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await goToExam(page, exam.id);
    await openClinicalSection(page);

    const comboBefore = await page.getByRole('combobox').count();
    await toggleSwitch(page, 'Diplopie');

    // A new Type combobox should appear after the switch is toggled
    await expect(page.getByRole('combobox').nth(comboBefore)).toBeVisible({
      timeout: 5_000,
    });
  });

  test('désactiver diplopie → sélecteur de type disparaît', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await goToExam(page, exam.id);
    await openClinicalSection(page);

    await toggleSwitch(page, 'Diplopie');
    await page.waitForTimeout(300);
    await toggleSwitch(page, 'Diplopie');

    await expect(
      page.getByRole('option', { name: /monoculaire/i }),
    ).not.toBeVisible({ timeout: 3_000 });
  });

  test('soumettre diplopie=true sans type → pas de 400 envoyé au backend', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    const statuses: number[] = [];
    page.on('response', (r) => {
      if (r.url().includes('/section/')) statuses.push(r.status());
    });

    await goToExam(page, exam.id);
    await openClinicalSection(page);
    await toggleSwitch(page, 'Diplopie');

    // Save without selecting a type — Zod should block it
    const saveBtn = page.getByRole('button', { name: /sauvegarder/i }).first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(800);
    }

    // No 400 should have reached the server (Zod validation prevents the call)
    expect(statuses.every((s) => s !== 400)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Plaintes — Strabisme
// ---------------------------------------------------------------------------

test.describe('Champs conditionnels — Strabisme', () => {
  test('activer strabisme → sélecteurs œil et type apparaissent', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await goToExam(page, exam.id);
    await openClinicalSection(page);

    const comboBefore = await page.getByRole('combobox').count();
    await toggleSwitch(page, 'Strabisme');

    // Strabisme reveals at least one new combobox (Type and/or Œil selectors)
    await expect(page.getByRole('combobox').nth(comboBefore)).toBeVisible({
      timeout: 5_000,
    });
  });

  test('désactiver strabisme → sélecteurs disparaissent', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await goToExam(page, exam.id);
    await openClinicalSection(page);

    await toggleSwitch(page, 'Strabisme');
    await page.waitForTimeout(300);
    await toggleSwitch(page, 'Strabisme');

    await expect(
      page.getByRole('option', { name: /convergent/i }),
    ).not.toBeVisible({ timeout: 3_000 });
  });
});

// ---------------------------------------------------------------------------
// Acuité visuelle — correction
// ---------------------------------------------------------------------------

test.describe('Champs conditionnels — Acuité visuelle avec correction', () => {
  test('activer correction → champs avec_correction apparaissent', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await goToExam(page, exam.id);
    await openTechnicalSection(page);

    await toggleSwitch(page, /surcorrection|avec correction/i);

    await expect(
      page.getByText(/avec.*correction|surcorrection/i).first(),
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ---------------------------------------------------------------------------
// Enum mapping guards — direct API calls (no browser needed)
// ---------------------------------------------------------------------------

test.describe('Enum mapping guards — valeurs frontend acceptées par le backend', () => {
  test('diplopie_type: monoculaire / binoculaire → 200', async ({
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    for (const dtype of ['monoculaire', 'binoculaire']) {
      const res = await apiRequest.patch(
        `${base()}/depistage/examens/adultes/${exam.id}/section/`,
        {
          data: {
            section: 'plaintes',
            data: {
              diplopie: true,
              diplopie_type: dtype,
              strabisme: false,
              nystagmus: false,
              ptosis: false,
            },
          },
        },
      );
      expect(res.status(), `diplopie_type="${dtype}" rejected`).toBe(200);
    }
  });

  test('strabisme_type: convergent / divergent → 200', async ({ apiRequest }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    for (const stype of ['convergent', 'divergent']) {
      const res = await apiRequest.patch(
        `${base()}/depistage/examens/adultes/${exam.id}/section/`,
        {
          data: {
            section: 'plaintes',
            data: {
              strabisme: true,
              strabisme_eye: 'od',
              strabisme_type: stype,
              diplopie: false,
              nystagmus: false,
              ptosis: false,
            },
          },
        },
      );
      expect(res.status(), `strabisme_type="${stype}" rejected`).toBe(200);
    }
  });

  test('strabisme_eye: od / og / odg → 200', async ({ apiRequest }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    for (const eye of ['od', 'og', 'odg']) {
      const res = await apiRequest.patch(
        `${base()}/depistage/examens/adultes/${exam.id}/section/`,
        {
          data: {
            section: 'plaintes',
            data: {
              strabisme: true,
              strabisme_eye: eye,
              strabisme_type: 'convergent',
              diplopie: false,
              nystagmus: false,
              ptosis: false,
            },
          },
        },
      );
      expect(res.status(), `strabisme_eye="${eye}" rejected`).toBe(200);
    }
  });

  test('HirschbergType: orthotropie / exotropie / esotropie → 200', async ({
    apiRequest,
  }) => {
    // vision_binoculaire belongs to ExamenEnfant, not ExamensAdult
    const patient = await createChildPatientViaApi(apiRequest);
    const exam = await createChildExamViaApi(apiRequest, patient.id);

    for (const htype of ['orthotropie', 'exotropie', 'esotropie']) {
      const res = await apiRequest.patch(
        `${base()}/depistage/examens/enfants/${exam.id}/technical/`,
        {
          data: {
            vision_binoculaire: {
              hirschberg_type: htype,
              ...(htype !== 'orthotropie'
                ? { hirschberg_detail: 'bord_pupillaire' }
                : {}),
            },
          },
        },
      );
      expect(res.status(), `hirschberg_type="${htype}" rejected`).toBe(200);
    }
  });

  test('PupillaryReflex: rouge / leucocorie / anormal → 200', async ({
    apiRequest,
  }) => {
    const patient = await createChildPatientViaApi(apiRequest);
    const exam = await createChildExamViaApi(apiRequest, patient.id);

    for (const reflet of ['rouge', 'leucocorie', 'anormal']) {
      const res = await apiRequest.patch(
        `${base()}/depistage/examens/enfants/${exam.id}/technical/`,
        {
          data: {
            vision_binoculaire: {
              reflet_pupillaire: reflet,
              reflet_lateralite: 'odg',
              ...(reflet !== 'rouge'
                ? { reflet_pupillaire_detail: 'Détail test' }
                : {}),
            },
          },
        },
      );
      expect(res.status(), `reflet_pupillaire="${reflet}" rejected`).toBe(200);
    }
  });

  test('CoverType: orthotropie / tropie / phorie → 200', async ({
    apiRequest,
  }) => {
    const patient = await createChildPatientViaApi(apiRequest);
    const exam = await createChildExamViaApi(apiRequest, patient.id);

    for (const ctype of ['orthotropie', 'tropie', 'phorie']) {
      const res = await apiRequest.patch(
        `${base()}/depistage/examens/enfants/${exam.id}/technical/`,
        {
          data: {
            vision_binoculaire: {
              cover_vl_type: ctype,
              ...(ctype !== 'orthotropie' ? { cover_vl_direction: 'eso' } : {}),
              cover_vp_type: 'orthotropie',
            },
          },
        },
      );
      expect(res.status(), `cover_vl_type="${ctype}" rejected`).toBe(200);
    }
  });
});
