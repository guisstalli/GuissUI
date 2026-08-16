'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can';
import { useAnalyticsGlaucoma } from '@/features/analytics/api/get-analytics-glaucoma';
import { useAnalyticsOcularTension } from '@/features/analytics/api/get-analytics-ocular-tension';
import { useAnalyticsOverview } from '@/features/analytics/api/get-analytics-overview';
import { useAnalyticsPachymetry } from '@/features/analytics/api/get-analytics-pachymetry';
import { useAnalyticsRefraction } from '@/features/analytics/api/get-analytics-refraction';
import { useAnalyticsSites } from '@/features/analytics/api/get-analytics-sites';
import { useAnalyticsSymptoms } from '@/features/analytics/api/get-analytics-symptoms';
import { useAnalyticsTimeline } from '@/features/analytics/api/get-analytics-timeline';
import { useAnalyticsVisualAcuity } from '@/features/analytics/api/get-analytics-visual-acuity';
import { AnalyticsFiltersBar } from '@/features/analytics/components/analytics-filters';
import { AnalyticsHeader } from '@/features/analytics/components/analytics-header';
import { AnalyticsKpiRow } from '@/features/analytics/components/analytics-kpi-row';
import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsLoadingState,
} from '@/features/analytics/components/analytics-states';
import {
  DEFAULT_ANALYTICS_FILTERS,
  type AnalyticsFilters,
} from '@/features/analytics/types/types';
import { useSites } from '@/features/sites/api/get-sites';

// Charts recharts chargés en lazy : hors du bundle initial de la route.
const chartLoading = () => (
  <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
);

/* eslint-disable @typescript-eslint/naming-convention */
const GlaucomaScatterChart = dynamic(
  () =>
    import(
      '@/features/analytics/components/charts/glaucoma-scatter-chart'
    ).then((m) => m.GlaucomaScatterChart),
  { ssr: false, loading: chartLoading },
);
const OcularTensionBarChart = dynamic(
  () =>
    import(
      '@/features/analytics/components/charts/ocular-tension-bar-chart'
    ).then((m) => m.OcularTensionBarChart),
  { ssr: false, loading: chartLoading },
);
const OverviewDonutChart = dynamic(
  () =>
    import('@/features/analytics/components/charts/overview-donut-chart').then(
      (m) => m.OverviewDonutChart,
    ),
  { ssr: false, loading: chartLoading },
);
const PachymetryKpiCard = dynamic(
  () =>
    import('@/features/analytics/components/charts/pachymetry-kpi-card').then(
      (m) => m.PachymetryKpiCard,
    ),
  { ssr: false, loading: chartLoading },
);
const RefractionDonutChart = dynamic(
  () =>
    import(
      '@/features/analytics/components/charts/refraction-donut-chart'
    ).then((m) => m.RefractionDonutChart),
  { ssr: false, loading: chartLoading },
);
const SitesBarChart = dynamic(
  () =>
    import('@/features/analytics/components/charts/sites-bar-chart').then(
      (m) => m.SitesBarChart,
    ),
  { ssr: false, loading: chartLoading },
);
const SymptomsGroupedBar = dynamic(
  () =>
    import('@/features/analytics/components/charts/symptoms-grouped-bar').then(
      (m) => m.SymptomsGroupedBar,
    ),
  { ssr: false, loading: chartLoading },
);
const TimelineChart = dynamic(
  () =>
    import('@/features/analytics/components/charts/timeline-chart').then(
      (m) => m.TimelineChart,
    ),
  { ssr: false, loading: chartLoading },
);
const VisualAcuityBarChart = dynamic(
  () =>
    import(
      '@/features/analytics/components/charts/visual-acuity-bar-chart'
    ).then((m) => m.VisualAcuityBarChart),
  { ssr: false, loading: chartLoading },
);
/* eslint-enable @typescript-eslint/naming-convention */

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
