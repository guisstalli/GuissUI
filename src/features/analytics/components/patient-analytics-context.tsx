'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAnalyticsGlaucoma,
  useAnalyticsOverview,
  useAnalyticsRefraction,
  useAnalyticsVisualAcuity,
  useAnalyticsOcularTension,
} from '@/features/analytics/api';
import {
  GlaucomaScatterChart,
  OverviewDonutChart,
  RefractionDonutChart,
  VisualAcuityBarChart,
  OcularTensionBarChart,
} from '@/features/analytics/components/charts';
import { buildPatientAnalyticsFilters } from '@/features/analytics/utils';

import { AnalyticsCollapsibleContext } from './analytics-collapsible-context';
import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsLoadingState,
} from './analytics-states';

type PatientAnalyticsContextProps = {
  patientId: number;
  patientName?: string;
};

export function PatientAnalyticsContext({
  patientId,
  patientName,
}: PatientAnalyticsContextProps) {
  const hasValidPatientId = Number.isFinite(patientId) && patientId > 0;

  const filters = useMemo(
    () =>
      buildPatientAnalyticsFilters(patientId, {
        exam_scope: 'all',
        eye_strategy: 'separate',
      }),
    [patientId],
  );

  // Only fetch what's relevant for single patient
  const reqOverview = useAnalyticsOverview({
    filters,
    enabled: hasValidPatientId,
  });
  const reqGlaucoma = useAnalyticsGlaucoma({
    filters,
    enabled: hasValidPatientId,
  });
  const reqVA = useAnalyticsVisualAcuity({
    filters,
    enabled: hasValidPatientId,
  });
  const reqRefrac = useAnalyticsRefraction({
    filters,
    enabled: hasValidPatientId,
  });
  const reqTension = useAnalyticsOcularTension({
    filters,
    enabled: hasValidPatientId,
  });

  const allQueries = [reqOverview, reqGlaucoma, reqVA, reqRefrac, reqTension];
  const isLoading = allQueries.some((q) => q.isLoading);
  const isError = allQueries.some((q) => q.isError);
  const hasAtLeastOneData = allQueries.some((q) => Boolean(q.data));

  const isEmpty =
    !!reqOverview.data && reqOverview.data.population.patients_total === 0;

  if (!hasValidPatientId) {
    return (
      <AnalyticsEmptyState
        title="Analytiques indisponibles"
        description="L'identifiant du patient manque."
      />
    );
  }

  if (isLoading && !hasAtLeastOneData) {
    return <AnalyticsLoadingState />;
  }

  if (isError && !hasAtLeastOneData) {
    return (
      <AnalyticsErrorState
        message="Impossible de charger les analytiques du patient."
        onRetry={() => allQueries.forEach((q) => q.refetch())}
      />
    );
  }

  if (isEmpty) {
    return (
      <AnalyticsEmptyState
        title="Aucun examen"
        description="Ce patient n'a pas encore d'examens enregistrés."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Historique et Profil du Patient
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {patientName && `Basé sur tous les examens de ${patientName}`}
          </p>
        </CardHeader>
      </Card>

      {/* Main Clinical Indicators Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {reqVA.data && (
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                  AV Moyenne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reqVA.data.kpis?.av_mean != null
                    ? reqVA.data.kpis.av_mean.toFixed(2)
                    : 'N/A'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">/ 10</p>
              </CardContent>
            </Card>
          </div>
        )}

        {reqTension.data && (
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                  TO Moyenne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reqTension.data.kpis?.to_mean != null
                    ? reqTension.data.kpis.to_mean.toFixed(1)
                    : 'N/A'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">mmHg</p>
              </CardContent>
            </Card>
          </div>
        )}

        {reqGlaucoma.data && (
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                  Suspect Glaucome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reqGlaucoma.data.kpis?.glaucoma_suspect_count ?? 0}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">examens</p>
              </CardContent>
            </Card>
          </div>
        )}

        {reqRefrac.data && (
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                  EQS Moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reqRefrac.data.kpis?.eqs_mean != null
                    ? `${reqRefrac.data.kpis.eqs_mean > 0 ? '+' : ''}${reqRefrac.data.kpis.eqs_mean.toFixed(2)}`
                    : 'N/A'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">D</p>
              </CardContent>
            </Card>
          </div>
        )}

        {reqOverview.data && (
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                  Examens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reqOverview.data.population.examens_total}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">total</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {reqVA.data && <VisualAcuityBarChart data={reqVA.data} />}
        {reqTension.data && <OcularTensionBarChart data={reqTension.data} />}
      </div>

      {/* Glaucoma & Refraction */}
      <div className="grid gap-4 md:grid-cols-2">
        {reqGlaucoma.data && <GlaucomaScatterChart data={reqGlaucoma.data} />}
        {reqRefrac.data && <RefractionDonutChart data={reqRefrac.data} />}
      </div>

      {/* Collapsible: Population Context */}
      <AnalyticsCollapsibleContext
        title="Comparer avec la population"
        description="Voir comment ce patient se positionne par rapport à la population globale"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {reqOverview.data && (
            <OverviewDonutChart
              data={reqOverview.data.population.sex_distribution}
            />
          )}
          <div className="flex items-center justify-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Autres comparés à venir (trend populationnelle)
          </div>
        </div>
      </AnalyticsCollapsibleContext>
    </div>
  );
}
