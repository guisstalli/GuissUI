'use client';

import { useMemo, useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can';
import {
  useAnalyticsOverview,
  useAnalyticsTimeline,
  useAnalyticsSites,
  useAnalyticsGlaucoma,
  useAnalyticsVisualAcuity,
  useAnalyticsRefraction,
  useAnalyticsOcularTension,
  useAnalyticsPachymetry,
  useAnalyticsSymptoms,
} from '@/features/analytics/api';
import {
  AnalyticsFiltersBar,
  AnalyticsHeader,
  AnalyticsKpiRow,
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsLoadingState,
} from '@/features/analytics/components';
import {
  OverviewDonutChart,
  TimelineChart,
  SitesBarChart,
  GlaucomaScatterChart,
  VisualAcuityBarChart,
  RefractionDonutChart,
  OcularTensionBarChart,
  PachymetryKpiCard,
  SymptomsGroupedBar,
} from '@/features/analytics/components/charts';
import {
  DEFAULT_ANALYTICS_FILTERS,
  type AnalyticsFilters,
} from '@/features/analytics/types';
import { useSites } from '@/features/sites/api';

const DRIVER_DEFAULT_FILTERS: AnalyticsFilters = {
  ...DEFAULT_ANALYTICS_FILTERS,
  driver_only: true,
};

export default function DriverAnalyticsPage() {
  const [draftFilters, setDraftFilters] = useState<AnalyticsFilters>(
    DRIVER_DEFAULT_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFilters>(
    DRIVER_DEFAULT_FILTERS,
  );

  const { data: sitesData } = useSites({ params: { limit: 200 } });
  const siteOptions = useMemo(
    () =>
      (sitesData?.results ?? []).map((s) => ({
        id: s.id ?? 0,
        libelle: s.libelle,
      })),
    [sitesData?.results],
  );

  // Queries
  const reqOverview = useAnalyticsOverview({ filters: appliedFilters });
  const reqTimeline = useAnalyticsTimeline({ filters: appliedFilters });
  const reqSites = useAnalyticsSites({ filters: appliedFilters });
  const reqGlaucoma = useAnalyticsGlaucoma({ filters: appliedFilters });
  const reqVA = useAnalyticsVisualAcuity({ filters: appliedFilters });
  const reqRefrac = useAnalyticsRefraction({ filters: appliedFilters });
  const reqTension = useAnalyticsOcularTension({ filters: appliedFilters });
  const reqPachy = useAnalyticsPachymetry({ filters: appliedFilters });
  const reqSymptoms = useAnalyticsSymptoms({ filters: appliedFilters });

  const allQueries = [
    reqOverview,
    reqTimeline,
    reqSites,
    reqGlaucoma,
    reqVA,
    reqRefrac,
    reqTension,
    reqPachy,
    reqSymptoms,
  ];

  const isLoading = allQueries.some((q) => q.isLoading);
  const isFetching = allQueries.some((q) => q.isFetching);
  const isError = allQueries.some((q) => q.isError);

  const errorMessage =
    'Une erreur serveur est survenue lors du chargement des analytiques.';
  const handleRefetchAll = () => allQueries.forEach((q) => q.refetch());

  const onApplyFilters = () => {
    // Always lock driver_only: true before applying
    setAppliedFilters({ ...draftFilters, driver_only: true });
  };

  const onResetFilters = () => {
    setDraftFilters(DRIVER_DEFAULT_FILTERS);
    setAppliedFilters(DRIVER_DEFAULT_FILTERS);
  };

  const handleChange = (filters: AnalyticsFilters) => {
    // Prevent removing driver_only filter
    setDraftFilters({ ...filters, driver_only: true });
  };

  const isEmpty =
    !!reqOverview.data &&
    reqOverview.data.population.patients_total === 0 &&
    reqOverview.data.population.examens_total === 0;

  return (
    <Can permission="analytics:view">
      <Shell title="Analytiques conducteurs">
        <AnalyticsHeader
          lastUpdatedAt={reqOverview.dataUpdatedAt}
          onRefresh={handleRefetchAll}
          isRefetching={isFetching}
        />

        <AnalyticsFiltersBar
          draftFilters={draftFilters}
          sites={siteOptions}
          isApplying={isFetching}
          onChange={handleChange}
          onApply={onApplyFilters}
          onReset={onResetFilters}
          lockDriverOnly
        />

        {isLoading ? (
          <AnalyticsLoadingState />
        ) : isError ? (
          <AnalyticsErrorState
            message={errorMessage}
            onRetry={handleRefetchAll}
            isRetrying={isFetching}
          />
        ) : isEmpty ? (
          <AnalyticsEmptyState />
        ) : (
          <div className="space-y-8 duration-500 animate-in fade-in">
            {reqOverview.data && (
              <AnalyticsKpiRow data={reqOverview.data.population} />
            )}

            <div className="grid gap-6 md:grid-cols-12">
              {/* Colonne gauche (8 colonnes sur Desktop) */}
              <div className="flex flex-col space-y-6 md:col-span-8">
                {reqTimeline.data && (
                  <div className="min-h-[400px] flex-1">
                    <TimelineChart data={reqTimeline.data.timeline} />
                  </div>
                )}

                <div className="grid min-h-[300px] flex-1 gap-6 md:grid-cols-2">
                  {reqVA.data && <VisualAcuityBarChart data={reqVA.data} />}
                  {reqTension.data && (
                    <OcularTensionBarChart data={reqTension.data} />
                  )}
                </div>

                {reqSymptoms.data && (
                  <div className="min-h-[350px] flex-1">
                    <SymptomsGroupedBar data={reqSymptoms.data} />
                  </div>
                )}
              </div>

              {/* Colonne droite (4 colonnes sur Desktop) */}
              <div className="flex flex-col space-y-6 md:col-span-4">
                {reqOverview.data && (
                  <div className="min-h-[300px]">
                    <OverviewDonutChart
                      data={reqOverview.data.population.sex_distribution}
                    />
                  </div>
                )}
                {reqRefrac.data && (
                  <div className="min-h-[300px]">
                    <RefractionDonutChart data={reqRefrac.data} />
                  </div>
                )}
                {reqGlaucoma.data && (
                  <div className="min-h-[300px]">
                    <GlaucomaScatterChart data={reqGlaucoma.data} />
                  </div>
                )}
                {reqPachy.data && (
                  <div className="min-h-[150px]">
                    <PachymetryKpiCard data={reqPachy.data} />
                  </div>
                )}
              </div>
            </div>

            {/* Pleine largeur */}
            {reqSites.data && (
              <div className="min-h-[400px] w-full">
                <SitesBarChart data={reqSites.data.sites} />
              </div>
            )}
          </div>
        )}
      </Shell>
    </Can>
  );
}
