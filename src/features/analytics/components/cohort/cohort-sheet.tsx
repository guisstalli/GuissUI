import { useMemo } from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import {
  COHORT_FETCH_LIMIT,
  useAnalyticsCohort,
} from '../../api/get-analytics-cohort';
import type { AnalyticsFilters, CohortCriterion } from '../../types/types';
import { downloadCohortCsv } from '../../utils/cohort-csv';
import { AnalyticsErrorState } from '../analytics-states';

import { CohortActionBar } from './cohort-action-bar';
import { CohortKpiHeader } from './cohort-kpi-header';
import { CohortPatientTable } from './cohort-patient-table';
import { CohortSeverityBadge } from './cohort-severity-badge';
import { useCohortSelection } from './use-cohort-selection';

type CohortSheetProps = {
  criterion: CohortCriterion | null;
  appliedFilters: AnalyticsFilters;
  onClose: () => void;
  onAnalyze: (ids: number[]) => void;
};

/**
 * Construit les filtres de cohorte : le périmètre hérité + l'unique critère
 * cliqué. Tous les autres critères cliniques sont retirés (backend = 1 critère).
 */
const buildCohortFilters = (
  appliedFilters: AnalyticsFilters,
  criterion: CohortCriterion,
): AnalyticsFilters => ({
  ...appliedFilters,
  acuity: undefined,
  tension: undefined,
  conclusion: undefined,
  symptom: undefined,
  // patient_ids ne s'applique pas au listing de cohorte (on part du périmètre)
  patient_ids: undefined,
  [criterion.type]: criterion.value,
});

export const CohortSheet = ({
  criterion,
  appliedFilters,
  onClose,
  onAnalyze,
}: CohortSheetProps) => {
  const selection = useCohortSelection();

  const cohortFilters = useMemo(
    () =>
      criterion
        ? buildCohortFilters(appliedFilters, criterion)
        : appliedFilters,
    [appliedFilters, criterion],
  );

  const { data, isLoading, isError, refetch, isFetching } = useAnalyticsCohort({
    filters: cohortFilters,
    enabled: !!criterion,
    limit: COHORT_FETCH_LIMIT,
  });

  const patients = data?.results ?? [];
  const summary = data?.summary;

  const handleToggleAllPage = (allSelected: boolean) => {
    const ids = patients.map((p) => p.id);
    if (allSelected) {
      selection.deselectAll(ids);
    } else {
      selection.selectAll(ids);
    }
  };

  const handleExportCsv = () => {
    const selectedRows = patients.filter((p) => selection.isSelected(p.id));
    downloadCohortCsv(selectedRows);
  };

  const handleAnalyze = () => {
    if (selection.count === 0) {
      return;
    }
    onAnalyze(selection.selectedIds);
    selection.clear();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      selection.clear();
      onClose();
    }
  };

  return (
    <Sheet open={!!criterion} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-2xl"
        aria-describedby="cohort-scope-description"
      >
        <SheetHeader className="border-b p-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <SheetTitle className="text-base font-semibold">
              {criterion?.label ?? 'Cohorte'}
            </SheetTitle>
            {summary && <CohortSeverityBadge severity={summary.severity} />}
          </div>
          <SheetDescription id="cohort-scope-description">
            Patients du périmètre courant correspondant à ce critère clinique.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {isError ? (
            <AnalyticsErrorState
              message="Impossible de charger la cohorte."
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          ) : (
            <>
              {summary && (
                <CohortKpiHeader
                  total={summary.count}
                  severity={summary.severity}
                />
              )}
              <CohortPatientTable
                patients={patients}
                isLoading={isLoading}
                isSelected={selection.isSelected}
                onToggle={selection.toggle}
                onToggleAllPage={handleToggleAllPage}
              />
            </>
          )}
        </div>

        <CohortActionBar
          selectionCount={selection.count}
          onExportCsv={handleExportCsv}
          onAnalyze={handleAnalyze}
        />
      </SheetContent>
    </Sheet>
  );
};
