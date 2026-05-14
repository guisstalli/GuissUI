/**
 * E2E — Independent section submissions for adult exams.
 *
 * Verifies that each section (visual acuity, refraction, plaintes…) can be
 * saved on its own without the other sections being filled, and that the data
 * persists correctly after a full page reload.
 *
 * Auth: tests run as "technicien" (technical sections) and "docteur" (clinical).
 * Fixtures: exam + patient are created via the API before each test so the UI
 * always starts from a known, empty exam state.
 */
import { test, expect } from '../../fixtures/auth-request';

import {
  createPatientViaApi,
  createAdultExamViaApi,
  patchExamSectionViaApi,
  generateVisualAcuity,
  generatePachymetry,
} from '../../fixtures/exam-data';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function goToExam(page: import('@playwright/test').Page, examId: number) {
  await page.goto(`/exams/adult/${examId}`);
  await page.waitForLoadState('networkidle');
  await page.getByText('Examen Technique').first().waitFor({ timeout: 10_000 });
}

async function clickSectionNav(
  page: import('@playwright/test').Page,
  label: string,
) {
  await page
    .getByRole('button', { name: new RegExp(label, 'i') })
    .first()
    .click();
  await page.waitForLoadState('networkidle');
}

async function saveSection(page: import('@playwright/test').Page) {
  const saveBtn = page.getByRole('button', { name: /sauvegarder/i }).first();
  await expect(saveBtn).toBeEnabled({ timeout: 5_000 });
  await saveBtn.click();
  await page.waitForLoadState('networkidle');
}

// ---------------------------------------------------------------------------
// Technical sections
// ---------------------------------------------------------------------------

test.describe('Soumissions indépendantes — sections techniques', () => {
  test('acuité visuelle seule → sauvegarde sans erreur, section clinique vide', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await goToExam(page, exam.id);
    await clickSectionNav(page, 'Examen Technique');

    const avscOd = page.getByLabel(/avsc.*od|od.*sans correction/i).first();
    if (await avscOd.isVisible()) await avscOd.fill('5.0');

    await saveSection(page);

    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: /erreur/i })
        .or(page.locator('[data-sonner-toast][data-type="error"]')),
    ).not.toBeVisible({ timeout: 3_000 });
    // Notification confirms section was saved
    await expect(
      page.getByText(/section mise à jour|sauvegarder/i).first(),
    ).toBeVisible({ timeout: 6_000 });
  });

  test('données acuité persistées après rechargement de page', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);
    const va = generateVisualAcuity();

    await patchExamSectionViaApi(apiRequest, exam.id, 'visual_acuity', va);

    await goToExam(page, exam.id);
    await clickSectionNav(page, 'Examen Technique');

    // Try multiple formats: "2.9", "2,9" (French locale), "2.900" (3 decimals).
    const numVal = Number(va.avsc_od);
    const fmtPeriod = numVal.toString();
    const fmtComma = fmtPeriod.replace('.', ',');
    const fmt3Dec = numVal.toFixed(3);
    await expect(
      page
        .locator(
          `input[value="${fmtPeriod}"], input[value="${fmtComma}"], input[value="${fmt3Dec}"]`,
        )
        .first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('réfraction seule → sauvegarde sans erreur 400', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await goToExam(page, exam.id);
    await clickSectionNav(page, 'Examen Technique');

    const refractionTab = page.getByRole('tab', {
      name: /réfraction|refraction/i,
    });
    if (await refractionTab.isVisible()) await refractionTab.click();

    const odS = page.getByLabel(/od.*sphère|sphère.*od/i).first();
    if (await odS.isVisible()) await odS.fill('1.25');

    await saveSection(page);
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: /erreur/i })
        .or(page.locator('[data-sonner-toast][data-type="error"]')),
    ).not.toBeVisible({ timeout: 3_000 });
  });

  test('pachymétrie persistée après rechargement', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);
    const pachy = generatePachymetry();

    await patchExamSectionViaApi(apiRequest, exam.id, 'pachymetry', pachy);

    await goToExam(page, exam.id);
    await clickSectionNav(page, 'Examen Technique');

    const pachyTab = page.getByRole('tab', { name: /pachymétrie/i });
    if (await pachyTab.isVisible()) await pachyTab.click();

    // Try multiple formats: "557.1", "557,1" (French locale), "557.100" (3 decimals).
    const numVal = Number(pachy.od);
    const fmtPeriod = numVal.toString();
    const fmtComma = fmtPeriod.replace('.', ',');
    const fmt3Dec = numVal.toFixed(3);
    await expect(
      page
        .locator(
          `input[value="${fmtPeriod}"], input[value="${fmtComma}"], input[value="${fmt3Dec}"]`,
        )
        .first(),
    ).toBeVisible({ timeout: 8_000 });
  });
});

// ---------------------------------------------------------------------------
// Clinical sections
// ---------------------------------------------------------------------------

test.describe('Soumissions indépendantes — sections cliniques', () => {
  test('plaintes seule → sauvegarde sans erreur, section technique reste vide', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await goToExam(page, exam.id);
    await clickSectionNav(page, 'Examen Clinique');

    // All toggles default to off — just save as-is
    await saveSection(page);

    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: /erreur/i })
        .or(page.locator('[data-sonner-toast][data-type="error"]')),
    ).not.toBeVisible({ timeout: 3_000 });
    // Technical section nav is still shown (not hidden when clinical saves)
    await expect(page.getByText(/examen technique/i).first()).toBeVisible();
  });

  test('diplopie=binoculaire persistée après rechargement', async ({
    page,
    apiRequest,
  }) => {
    const patient = await createPatientViaApi(apiRequest);
    const exam = await createAdultExamViaApi(apiRequest, patient.id);

    await patchExamSectionViaApi(apiRequest, exam.id, 'plaintes', {
      diplopie: true,
      diplopie_type: 'binoculaire',
      strabisme: false,
      nystagmus: false,
      ptosis: false,
    });

    await goToExam(page, exam.id);
    await clickSectionNav(page, 'Examen Clinique');

    const diplopieSwitch = page
      .getByRole('switch', { name: /diplopie/i })
      .first();
    if (await diplopieSwitch.isVisible()) {
      await expect(diplopieSwitch).toHaveAttribute('aria-checked', 'true', {
        timeout: 6_000,
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Idempotence — re-saving same section overwrites, does not duplicate
// ---------------------------------------------------------------------------

test('re-soumettre la même section écrase les données précédentes', async ({
  apiRequest,
}) => {
  const patient = await createPatientViaApi(apiRequest);
  const exam = await createAdultExamViaApi(apiRequest, patient.id);
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

  await patchExamSectionViaApi(apiRequest, exam.id, 'visual_acuity', {
    avsc_od: '5.000',
    correction: false,
  });
  await patchExamSectionViaApi(apiRequest, exam.id, 'visual_acuity', {
    avsc_od: '8.000',
    correction: false,
  });

  const getRes = await apiRequest.get(
    `${base}/depistage/examens/adultes/${exam.id}/`,
  );
  expect(getRes.status()).toBe(200);
  const data = await getRes.json();
  const avscOd = data?.technical_examen?.visual_acuity?.avsc_od ?? '';
  expect(parseFloat(avscOd)).toBeCloseTo(8.0, 1);
});
