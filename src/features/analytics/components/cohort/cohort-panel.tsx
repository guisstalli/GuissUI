import { X } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

type CohortPanelProps = {
  criterion: CohortCriterion;
  appliedFilters: AnalyticsFilters;
  onClose: () => void;
  onAnalyze: (ids: number[]) => void;
  className?: string;
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

/**
 * Contenu du drill-down cohorte, indépendant du conteneur. Rendu soit dans un
 * panneau redimensionnable ancré (desktop), soit dans un overlay plein écran
 * (mobile). N'utilise volontairement aucun modal Radix : l'ouverture ne dépend
 * donc plus de l'état de la sidebar.
 */
export const CohortPanel = ({
  criterion,
  appliedFilters,
  onClose,
  onAnalyze,
  className,
}: CohortPanelProps) => {
  const selection = useCohortSelection();

  const cohortFilters = useMemo(
    () => buildCohortFilters(appliedFilters, criterion),
    [appliedFilters, criterion],
  );

  const { data, isLoading, isError, refetch, isFetching } = useAnalyticsCohort({
    filters: cohortFilters,
    enabled: true,
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

  const handleClose = () => {
    selection.clear();
    onClose();
  };

  return (
    <section
      aria-label="Cohorte"
      className={cn(
        'flex min-h-0 flex-col bg-popover text-popover-foreground',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold text-foreground">
              {criterion.label}
            </h2>
            {summary && <CohortSeverityBadge severity={summary.severity} />}
          </div>
          <p className="text-sm text-muted-foreground">
            Patients du périmètre courant correspondant à ce critère clinique.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleClose}
          aria-label="Fermer le panneau cohorte"
        >
          <X className="size-4" />
        </Button>
      </header>

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
    </section>
  );
};
