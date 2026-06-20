import type { AnalyticsFilters, CohortCriterion } from '../../types/types';

import { CohortPanel } from './cohort-panel';

type CohortMobileOverlayProps = {
  criterion: CohortCriterion;
  appliedFilters: AnalyticsFilters;
  onClose: () => void;
  onAnalyze: (ids: number[]) => void;
};

/**
 * Présentation mobile du drill-down : un overlay plein écran simple (pas de
 * Dialog Radix), afin que l'ouverture ne dépende d'aucun état global de modale.
 */
export const CohortMobileOverlay = (props: CohortMobileOverlayProps) => (
  <div className="fixed inset-0 z-50 flex flex-col bg-background duration-200 animate-in fade-in">
    <CohortPanel {...props} className="h-full" />
  </div>
);
