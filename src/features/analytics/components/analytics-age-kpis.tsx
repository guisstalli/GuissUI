'use client';

import { Activity, Users } from 'lucide-react';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import type { AnalyticsOverview } from '../types';

const formatInteger = (value: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);

const formatDecimal = (value: number | null, precision = 1) => {
  if (value === null) {
    return 'N/A';
  }

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

const SEX_LABELS: Record<string, string> = {
  H: 'Hommes',
  F: 'Femmes',
  A: 'Autre/Anonyme',
};

export function AnalyticsAgeKpis({ data }: { data: AnalyticsOverview }) {
  const sexDistribution = useMemo(() => {
    const entries = Object.entries(data.population.sex_distribution ?? {});
    const total = entries.reduce((sum, [, count]) => sum + count, 0);

    return entries.map(([sex, count]) => ({
      sex,
      label: SEX_LABELS[sex] ?? sex,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }, [data.population.sex_distribution]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Patients analysés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatInteger(data.population.patients_total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Examens analysés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatInteger(data.population.examens_total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Âge moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {data.population.age_mean === null
                ? 'N/A'
                : `${formatDecimal(data.population.age_mean)} ans`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" aria-hidden="true" />
              Répartition sexe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sexDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Donnée non disponible
              </p>
            ) : (
              <div
                className="space-y-4"
                role="list"
                aria-label="Répartition par sexe"
              >
                {sexDistribution.map((item) => (
                  <div key={item.sex} className="space-y-1" role="listitem">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.label}</span>
                      <span className="text-muted-foreground">
                        {formatInteger(item.count)} (
                        {formatDecimal(item.percentage, 0)}%)
                      </span>
                    </div>
                    <Progress
                      value={Math.max(0, Math.min(100, item.percentage))}
                      aria-label={`${item.label} ${formatDecimal(item.percentage, 0)}%`}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4" aria-hidden="true" />
              Distribution par tranche d’âge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-md border border-border p-4">
              <p className="text-sm font-medium text-foreground">
                Donnée non disponible
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Le backend ne renvoie pas encore une distribution détaillée par
                tranche d’âge.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
