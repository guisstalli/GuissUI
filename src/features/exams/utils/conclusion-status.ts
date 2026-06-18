import type { ConclusionApi } from '@/features/exams/types/api-schemas';

/**
 * A conclusion is only "complete" once a clinician has actually filled at
 * least one of its content fields. Metadata (`id`, `created`, `modified`) is
 * ignored — the backend may persist an empty conclusion row alongside the
 * clinical exam without any clinical content yet.
 */
export function hasFilledConclusion(
  conclusion: ConclusionApi | null | undefined,
): boolean {
  if (!conclusion) return false;

  const hasText = (value: string | null | undefined): boolean =>
    typeof value === 'string' && value.trim().length > 0;

  return (
    hasText(conclusion.vision) ||
    hasText(conclusion.cat) ||
    hasText(conclusion.traitement) ||
    hasText(conclusion.observation) ||
    (conclusion.diagnostic_cim_11?.length ?? 0) > 0
  );
}
