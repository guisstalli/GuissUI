'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsGlaucoma } from '@/features/analytics/api/get-analytics-glaucoma';
import { useAnalyticsOcularTension } from '@/features/analytics/api/get-analytics-ocular-tension';
import { useAnalyticsOverview } from '@/features/analytics/api/get-analytics-overview';
import { useAnalyticsPachymetry } from '@/features/analytics/api/get-analytics-pachymetry';
import { useAnalyticsRefraction } from '@/features/analytics/api/get-analytics-refraction';
import { useAnalyticsSites } from '@/features/analytics/api/get-analytics-sites';
import { useAnalyticsSymptoms } from '@/features/analytics/api/get-analytics-symptoms';
import { useAnalyticsTimeline } from '@/features/analytics/api/get-analytics-timeline';
import { useAnalyticsVisualAcuity } from '@/features/analytics/api/get-analytics-visual-acuity';
import { GlaucomaScatterChart } from '@/features/analytics/components/charts/glaucoma-scatter-chart';
import { OcularTensionBarChart } from '@/features/analytics/components/charts/ocular-tension-bar-chart';
import { OverviewDonutChart } from '@/features/analytics/components/charts/overview-donut-chart';
import { PachymetryKpiCard } from '@/features/analytics/components/charts/pachymetry-kpi-card';
import { RefractionDonutChart } from '@/features/analytics/components/charts/refraction-donut-chart';
import { SitesBarChart } from '@/features/analytics/components/charts/sites-bar-chart';
import { SymptomsGroupedBar } from '@/features/analytics/components/charts/symptoms-grouped-bar';
import { TimelineChart } from '@/features/analytics/components/charts/timeline-chart';
import { VisualAcuityBarChart } from '@/features/analytics/components/charts/visual-acuity-bar-chart';
import type { AnalyticsFilters } from '@/features/analytics/types/types';

import { AnalyticsKpiRow } from './analytics-kpi-row';
import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsLoadingState,
} from './analytics-states';

type AnalyticsDetailDashboardProps = {
  title: string;
  subtitle: string;
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export function AnalyticsDetailDashboard({
  title,
  subtitle,
  filters,
  enabled = true,
}: AnalyticsDetailDashboardProps) {
  const reqOverview = useAnalyticsOverview({ filters, enabled });
  const reqTimeline = useAnalyticsTimeline({ filters, enabled });
  const reqSites = useAnalyticsSites({ filters, enabled });
  const reqGlaucoma = useAnalyticsGlaucoma({ filters, enabled });
  const reqVA = useAnalyticsVisualAcuity({ filters, enabled });
  const reqRefrac = useAnalyticsRefraction({ filters, enabled });
  const reqTension = useAnalyticsOcularTension({ filters, enabled });
  const reqPachy = useAnalyticsPachymetry({ filters, enabled });
  const reqSymptoms = useAnalyticsSymptoms({ filters, enabled });

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

  const isLoading = allQueries.some((query) => query.isLoading);
  const isError = allQueries.some((query) => query.isError);
  const hasAtLeastOneData = allQueries.some((query) => Boolean(query.data));

  const isEmpty =
    !!reqOverview.data &&
    reqOverview.data.population.patients_total === 0 &&
    reqOverview.data.population.examens_total === 0;

  const refetchAll = () => {
    allQueries.forEach((query) => {
      query.refetch();
    });
  };

  if (!enabled) {
    return (
      <AnalyticsEmptyState
        title="Analytiques indisponibles"
        description="L’identifiant de contexte est manquant pour charger ces indicateurs."
      />
    );
  }

  if (isLoading && !hasAtLeastOneData) {
    return <AnalyticsLoadingState />;
  }

  if (isError && !hasAtLeastOneData) {
    return (
      <AnalyticsErrorState
        message="Impossible de charger les analytiques pour ce contexte."
        onRetry={refetchAll}
      />
    );
  }

  if (isEmpty) {
    return (
      <AnalyticsEmptyState
        title="Aucune donnée analytics"
        description="Aucun résultat n’a été trouvé pour ce contexte."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardHeader>
      </Card>

      {reqOverview.data && (
        <AnalyticsKpiRow data={reqOverview.data.population} />
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          {reqTimeline.data && (
            <TimelineChart data={reqTimeline.data.timeline} />
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {reqVA.data && <VisualAcuityBarChart data={reqVA.data} />}
            {reqTension.data && (
              <OcularTensionBarChart data={reqTension.data} />
            )}
          </div>

          {reqSymptoms.data && <SymptomsGroupedBar data={reqSymptoms.data} />}
        </div>

        <div className="space-y-6 xl:col-span-4">
          {reqOverview.data && (
            <OverviewDonutChart
              data={reqOverview.data.population.sex_distribution}
            />
          )}
          {reqRefrac.data && <RefractionDonutChart data={reqRefrac.data} />}
          {reqGlaucoma.data && <GlaucomaScatterChart data={reqGlaucoma.data} />}
          {reqPachy.data && <PachymetryKpiCard data={reqPachy.data} />}
        </div>
      </div>

      {reqSites.data && <SitesBarChart data={reqSites.data.sites} />}
    </div>
  );
}
