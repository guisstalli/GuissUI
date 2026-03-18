'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAnalyticsGlaucoma,
  useAnalyticsOcularTension,
  useAnalyticsPachymetry,
  useAnalyticsRefraction,
  useAnalyticsVisualAcuity,
} from '@/features/analytics/api';
import {
  GlaucomaScatterChart,
  OcularTensionBarChart,
  PachymetryKpiCard,
  RefractionDonutChart,
  VisualAcuityBarChart,
} from '@/features/analytics/components/charts';
import { buildExamAnalyticsFilters } from '@/features/analytics/utils';

import { AnalyticsCollapsibleContext } from './analytics-collapsible-context';
import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsLoadingState,
} from './analytics-states';

type ExamAnalyticsContextProps = {
  examId: number;
  examType: 'adult' | 'child';
  examLabel?: string;
};

export function ExamAnalyticsContext({
  examId,
  examType,
  examLabel,
}: ExamAnalyticsContextProps) {
  const hasValidExamId = Number.isFinite(examId) && examId > 0;

  const filters = useMemo(
    () =>
      buildExamAnalyticsFilters(examId, examType, {
        eye_strategy: 'separate',
        exam_scope: 'all',
      }),
    [examId, examType],
  );

  // Fetch only exam-relevant endpoints
  const reqVA = useAnalyticsVisualAcuity({ filters, enabled: hasValidExamId });
  const reqTension = useAnalyticsOcularTension({
    filters,
    enabled: hasValidExamId,
  });
  const reqPachy = useAnalyticsPachymetry({ filters, enabled: hasValidExamId });
  const reqRefrac = useAnalyticsRefraction({
    filters,
    enabled: hasValidExamId,
  });
  const reqGlaucoma = useAnalyticsGlaucoma({
    filters,
    enabled: hasValidExamId,
  });

  const allQueries = [reqVA, reqTension, reqPachy, reqRefrac, reqGlaucoma];
  const isLoading = allQueries.some((q) => q.isLoading);
  const isError = allQueries.some((q) => q.isError);
  const hasAtLeastOneData = allQueries.some((q) => Boolean(q.data));

  if (!hasValidExamId) {
    return (
      <AnalyticsEmptyState
        title="Analytiques indisponibles"
        description="L'identifiant de l'examen manque."
      />
    );
  }

  if (isLoading && !hasAtLeastOneData) {
    return <AnalyticsLoadingState />;
  }

  if (isError && !hasAtLeastOneData) {
    return (
      <AnalyticsErrorState
        message="Impossible de charger les analytiques de l'examen."
        onRetry={() => allQueries.forEach((q) => q.refetch())}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Indicateurs Cliniques
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {examLabel && `Examen ${examLabel}`}
          </p>
        </CardHeader>
      </Card>

      {/* 5 Quick KPI Cards */}
      <div className="grid gap-3 md:grid-cols-5">
        {reqVA.data && (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                AV Moy.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {reqVA.data.kpis?.av_mean != null
                  ? reqVA.data.kpis.av_mean.toFixed(2)
                  : '—'}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">/ 10</p>
            </CardContent>
          </Card>
        )}

        {reqTension.data && (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                TO Moy.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {reqTension.data.kpis?.to_mean != null
                  ? reqTension.data.kpis.to_mean.toFixed(1)
                  : '—'}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">mmHg</p>
            </CardContent>
          </Card>
        )}

        {reqPachy.data && (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                Pachymétrie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {reqPachy.data.kpis?.pachymetry_mean != null
                  ? Math.round(reqPachy.data.kpis.pachymetry_mean)
                  : '—'}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">µm</p>
            </CardContent>
          </Card>
        )}

        {reqRefrac.data && (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                EQS Moy.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {reqRefrac.data.kpis?.eqs_mean != null
                  ? `${reqRefrac.data.kpis.eqs_mean > 0 ? '+' : ''}${reqRefrac.data.kpis.eqs_mean.toFixed(2)}`
                  : '—'}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">D</p>
            </CardContent>
          </Card>
        )}

        {reqGlaucoma.data && (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                Glaucome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {reqGlaucoma.data.kpis?.glaucoma_suspect_count ?? 0}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">suspect</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {reqVA.data && <VisualAcuityBarChart data={reqVA.data} />}
        {reqTension.data && <OcularTensionBarChart data={reqTension.data} />}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reqGlaucoma.data && <GlaucomaScatterChart data={reqGlaucoma.data} />}
        {reqRefrac.data && <RefractionDonutChart data={reqRefrac.data} />}
        {reqPachy.data && <PachymetryKpiCard data={reqPachy.data} />}
      </div>

      {/* Collapsible: Patient History Context (optional) */}
      <AnalyticsCollapsibleContext
        title="Historique du patient"
        description="Voir comment cet examen se compare aux examens précédents"
      >
        <div className="flex items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Historique et comparaison à venir
        </div>
      </AnalyticsCollapsibleContext>
    </div>
  );
}
