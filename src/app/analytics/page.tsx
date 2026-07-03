'use client';

import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can';
import { useNotifications } from '@/components/ui/notifications';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useAnalyticsBiomicroscopy } from '@/features/analytics/api/get-analytics-biomicroscopy';
import { useAnalyticsDriverExperience } from '@/features/analytics/api/get-analytics-driver-experience';
import { useAnalyticsGlaucoma } from '@/features/analytics/api/get-analytics-glaucoma';
import { useAnalyticsOcularTension } from '@/features/analytics/api/get-analytics-ocular-tension';
import { useAnalyticsOverview } from '@/features/analytics/api/get-analytics-overview';
import { useAnalyticsPachymetry } from '@/features/analytics/api/get-analytics-pachymetry';
import { useAnalyticsPediatric } from '@/features/analytics/api/get-analytics-pediatric';
import { useAnalyticsRefraction } from '@/features/analytics/api/get-analytics-refraction';
import { useAnalyticsRiskFactors } from '@/features/analytics/api/get-analytics-risk-factors';
import { useAnalyticsSites } from '@/features/analytics/api/get-analytics-sites';
import { useAnalyticsSymptoms } from '@/features/analytics/api/get-analytics-symptoms';
import { useAnalyticsSymptomsFull } from '@/features/analytics/api/get-analytics-symptoms-full';
import { useAnalyticsTimeline } from '@/features/analytics/api/get-analytics-timeline';
import { useAnalyticsVisualAcuity } from '@/features/analytics/api/get-analytics-visual-acuity';
import { useAnalyticsVisualField } from '@/features/analytics/api/get-analytics-visual-field';
import { AnalyticsFiltersBar } from '@/features/analytics/components/analytics-filters';
import { AnalyticsHeader } from '@/features/analytics/components/analytics-header';
import { AnalyticsKpiRow } from '@/features/analytics/components/analytics-kpi-row';
import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsLoadingState,
} from '@/features/analytics/components/analytics-states';
import { CohortMobileOverlay } from '@/features/analytics/components/cohort/cohort-mobile-overlay';
import { CohortPanel } from '@/features/analytics/components/cohort/cohort-panel';
import {
  DEFAULT_ANALYTICS_FILTERS,
  type AnalyticsFilters,
  type CohortCriterion,
} from '@/features/analytics/types/types';
import { useSites } from '@/features/sites/api/get-sites';
import { useIsMobile } from '@/hooks/use-mobile';

// Les 16 sections de graphiques importent recharts (~100 kB gzip) : elles
// sont chargées en lazy pour sortir recharts du bundle initial de la route.
const chartLoading = () => (
  <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
);

/* eslint-disable @typescript-eslint/naming-convention */
const BiomicroscopySection = dynamic(
  () =>
    import('@/features/analytics/components/charts/biomicroscopy-section').then(
      (m) => m.BiomicroscopySection,
    ),
  { ssr: false, loading: chartLoading },
);
const ConclusionDonutChart = dynamic(
  () =>
    import(
      '@/features/analytics/components/charts/conclusion-donut-chart'
    ).then((m) => m.ConclusionDonutChart),
  { ssr: false, loading: chartLoading },
);
const DriverExperienceSection = dynamic(
  () =>
    import(
      '@/features/analytics/components/charts/driver-experience-section'
    ).then((m) => m.DriverExperienceSection),
  { ssr: false, loading: chartLoading },
);
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
const PediatricSection = dynamic(
  () =>
    import('@/features/analytics/components/charts/pediatric-section').then(
      (m) => m.PediatricSection,
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
const RiskFactorsSection = dynamic(
  () =>
    import('@/features/analytics/components/charts/risk-factors-section').then(
      (m) => m.RiskFactorsSection,
    ),
  { ssr: false, loading: chartLoading },
);
const SitesBarChart = dynamic(
  () =>
    import('@/features/analytics/components/charts/sites-bar-chart').then(
      (m) => m.SitesBarChart,
    ),
  { ssr: false, loading: chartLoading },
);
const SymptomsFullChart = dynamic(
  () =>
    import('@/features/analytics/components/charts/symptoms-full-chart').then(
      (m) => m.SymptomsFullChart,
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
const VisualFieldSection = dynamic(
  () =>
    import('@/features/analytics/components/charts/visual-field-section').then(
      (m) => m.VisualFieldSection,
    ),
  { ssr: false, loading: chartLoading },
);
/* eslint-enable @typescript-eslint/naming-convention */

const MAX_COHORT_PATIENTS = 200;

export default function AnalyticsPage() {
  const [draftFilters, setDraftFilters] = useState<AnalyticsFilters>(
    DEFAULT_ANALYTICS_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFilters>(
    DEFAULT_ANALYTICS_FILTERS,
  );
  const [cohortCriterion, setCohortCriterion] =
    useState<CohortCriterion | null>(null);

  const { addNotification } = useNotifications();
  const isMobile = useIsMobile();

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
  const reqRiskFactors = useAnalyticsRiskFactors({ filters: appliedFilters });
  const reqSymptomsFull = useAnalyticsSymptomsFull({ filters: appliedFilters });
  const reqBiomicroscopy = useAnalyticsBiomicroscopy({
    filters: appliedFilters,
  });
  const reqPediatric = useAnalyticsPediatric({ filters: appliedFilters });
  const reqVisualField = useAnalyticsVisualField({ filters: appliedFilters });
  const reqDriverExperience = useAnalyticsDriverExperience({
    filters: appliedFilters,
  });

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
    reqRiskFactors,
    reqSymptomsFull,
    reqBiomicroscopy,
    reqPediatric,
    reqVisualField,
    reqDriverExperience,
  ];

  const isLoading = allQueries.some((q) => q.isLoading);
  const isFetching = allQueries.some((q) => q.isFetching);
  const isError = allQueries.some((q) => q.isError);

  const errorMessage =
    'Une erreur serveur est survenue lors du chargement des analytiques.';
  const handleRefetchAll = () => allQueries.forEach((q) => q.refetch());

  const onApplyFilters = () => setAppliedFilters(draftFilters);
  const onResetFilters = () => {
    setDraftFilters(DEFAULT_ANALYTICS_FILTERS);
    setAppliedFilters(DEFAULT_ANALYTICS_FILTERS);
  };

  const handleAnalyzeCohort = (ids: number[]) => {
    let selectedIds = ids;
    if (ids.length > MAX_COHORT_PATIENTS) {
      selectedIds = ids.slice(0, MAX_COHORT_PATIENTS);
      addNotification({
        type: 'warning',
        title: 'Cohorte tronquée',
        message: `La sélection a été limitée aux ${MAX_COHORT_PATIENTS} premiers patients.`,
      });
    }
    setAppliedFilters((prev) => ({ ...prev, patient_ids: selectedIds }));
    setCohortCriterion(null);
  };

  const resetCohortScope = () =>
    setAppliedFilters((prev) => ({ ...prev, patient_ids: undefined }));

  const cohortPatientCount = appliedFilters.patient_ids?.length ?? 0;

  const isEmpty =
    !!reqOverview.data &&
    reqOverview.data.population.patients_total === 0 &&
    reqOverview.data.population.examens_total === 0;

  return (
    <Can permission="analytics:view">
      <Shell title="Analytiques">
        <AnalyticsHeader
          lastUpdatedAt={reqOverview.dataUpdatedAt}
          onRefresh={handleRefetchAll}
          isRefetching={isFetching}
        />

        <AnalyticsFiltersBar
          draftFilters={draftFilters}
          sites={siteOptions}
          isApplying={isFetching}
          onChange={setDraftFilters}
          onApply={onApplyFilters}
          onReset={onResetFilters}
        />

        {cohortPatientCount > 0 && (
          <div className="bg-primary/5 border-primary/30 mb-6 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 duration-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Badge variant="default">Cohorte</Badge>
              <span className="text-sm text-foreground">
                Analyse restreinte à {cohortPatientCount} patient(s)
                sélectionné(s)
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={resetCohortScope}>
              <X className="size-4" />
              Réinitialiser la cohorte
            </Button>
          </div>
        )}

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
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId="analytics-cohort"
            className="items-stretch"
            // La lib force height:100%+overflow:hidden en inline, ce qui
            // tronquerait le dashboard (plus haut que l'écran) dans le <main>
            // borné. On laisse le groupe grandir et c'est <main> qui scrolle.
            style={{ height: 'auto', overflow: 'visible' }}
          >
            <ResizablePanel
              id="dashboard"
              order={1}
              defaultSize={62}
              minSize={40}
              className="min-w-0"
            >
              <div className="space-y-8 duration-500 animate-in fade-in @container md:pr-1">
                {reqOverview.data && (
                  <AnalyticsKpiRow data={reqOverview.data.population} />
                )}

                {/* Grilles pilotées par la largeur DU PANNEAU (container query),
                    pas du viewport — sinon les charts se chevauchent quand le
                    panneau cohorte rétrécit le dashboard. */}
                <div className="grid gap-6 @5xl:grid-cols-12">
                  {/* Colonne gauche */}
                  <div className="flex flex-col space-y-6 @5xl:col-span-8">
                    {reqTimeline.data && (
                      <div className="min-h-[400px] flex-1">
                        <TimelineChart data={reqTimeline.data.timeline} />
                      </div>
                    )}

                    <div className="grid min-h-[300px] flex-1 gap-6 @3xl:grid-cols-2">
                      {reqVA.data && (
                        <VisualAcuityBarChart
                          data={reqVA.data}
                          onSegmentClick={setCohortCriterion}
                        />
                      )}
                      {reqTension.data && (
                        <OcularTensionBarChart
                          data={reqTension.data}
                          onSegmentClick={setCohortCriterion}
                        />
                      )}
                    </div>

                    {reqSymptoms.data && (
                      <div className="min-h-[350px] flex-1">
                        <SymptomsGroupedBar data={reqSymptoms.data} />
                      </div>
                    )}
                  </div>

                  {/* Colonne droite */}
                  <div className="flex flex-col space-y-6 @5xl:col-span-4">
                    {reqOverview.data && (
                      <div className="min-h-[300px]">
                        <OverviewDonutChart
                          data={reqOverview.data.population.sex_distribution}
                        />
                      </div>
                    )}
                    {reqOverview.data?.population.conclusion_distribution && (
                      <div className="min-h-[300px]">
                        <ConclusionDonutChart
                          data={
                            reqOverview.data.population.conclusion_distribution
                          }
                          onSegmentClick={setCohortCriterion}
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

                {/* Nouvelles sections analytiques */}
                <div className="grid grid-cols-1 gap-6">
                  {reqSymptomsFull.data && (
                    <SymptomsFullChart
                      data={reqSymptomsFull.data}
                      onSegmentClick={setCohortCriterion}
                    />
                  )}
                  {reqRiskFactors.data && (
                    <RiskFactorsSection data={reqRiskFactors.data} />
                  )}
                  {reqBiomicroscopy.data && (
                    <BiomicroscopySection data={reqBiomicroscopy.data} />
                  )}
                  {reqVisualField.data && (
                    <VisualFieldSection data={reqVisualField.data} />
                  )}
                  {reqPediatric.data && (
                    <PediatricSection data={reqPediatric.data} />
                  )}
                  {reqDriverExperience.data && (
                    <DriverExperienceSection data={reqDriverExperience.data} />
                  )}
                </div>
              </div>
            </ResizablePanel>

            {!isMobile && cohortCriterion && (
              <>
                <ResizableHandle withHandle className="mx-3" />
                <ResizablePanel
                  id="cohort"
                  order={2}
                  defaultSize={38}
                  minSize={28}
                  maxSize={55}
                  className="min-w-0"
                  // overflow-visible (au lieu du hidden par défaut de la lib)
                  // pour que le panneau sticky reste ancré pendant le scroll page.
                  style={{ overflow: 'visible' }}
                >
                  <div className="sticky top-4">
                    <CohortPanel
                      criterion={cohortCriterion}
                      appliedFilters={appliedFilters}
                      onClose={() => setCohortCriterion(null)}
                      onAnalyze={handleAnalyzeCohort}
                      className="max-h-[calc(100vh-6rem)] overflow-hidden rounded-xl border shadow-lg"
                    />
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        )}

        {isMobile && cohortCriterion && (
          <CohortMobileOverlay
            criterion={cohortCriterion}
            appliedFilters={appliedFilters}
            onClose={() => setCohortCriterion(null)}
            onAnalyze={handleAnalyzeCohort}
          />
        )}
      </Shell>
    </Can>
  );
}
