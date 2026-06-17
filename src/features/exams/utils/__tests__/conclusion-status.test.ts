import { describe, expect, test } from 'vitest';

import type { ConclusionApi } from '@/features/exams/types/api-schemas';

import { hasFilledConclusion } from '../conclusion-status';

describe('hasFilledConclusion', () => {
  test('returns false for null or undefined', () => {
    expect(hasFilledConclusion(null)).toBe(false);
    expect(hasFilledConclusion(undefined)).toBe(false);
  });

  test('returns false for a metadata-only conclusion (no content)', () => {
    const conclusion: ConclusionApi = {
      id: 1,
      created: '2026-05-10T08:00:00Z',
      modified: '2026-05-10T08:00:00Z',
    };
    expect(hasFilledConclusion(conclusion)).toBe(false);
  });

  test('returns false when all content fields are null or blank', () => {
    const conclusion: ConclusionApi = {
      vision: null,
      cat: '',
      traitement: '   ',
      observation: null,
      diagnostic_cim_11: [],
    };
    expect(hasFilledConclusion(conclusion)).toBe(false);
  });

  test.each([
    ['vision', { vision: 'Vision corrigée 10/10' }],
    ['cat', { cat: 'Surveillance annuelle' }],
    ['traitement', { traitement: 'Collyre hydratant' }],
    ['observation', { observation: 'RAS' }],
  ])('returns true when %s carries content', (_field, conclusion) => {
    expect(hasFilledConclusion(conclusion as ConclusionApi)).toBe(true);
  });

  test('returns true when diagnostic_cim_11 has at least one entry', () => {
    expect(hasFilledConclusion({ diagnostic_cim_11: ['9D00.0'] })).toBe(true);
  });

  test('treats a whitespace-only field as not filled', () => {
    expect(hasFilledConclusion({ vision: '    ' })).toBe(false);
  });
});
