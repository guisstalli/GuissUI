import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsSymptoms } from '../../types';

type SymptomsGroupedBarProps = {
  data: AnalyticsSymptoms;
};

export const SymptomsGroupedBar = ({ data }: SymptomsGroupedBarProps) => {
  if (!data || !data.kpis || data.kpis.esterman_sample_size === 0) {
    return (
      <Card className="col-span-full h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Symptômes & Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Aucune donnée disponible.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { kpis } = data;

  // Convert Record<string, number> to array and take top 5 for symptoms
  const symptomsData = Object.entries(kpis.symptoms || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Convert Array<[string, number]> to array of objects for Recharts
  const chartDiagnostics = (kpis.top_diagnostics || []).map(
    ([name, count]) => ({
      name,
      count,
    }),
  );

  return (
    <Card className="col-span-full h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">
            Analyse des Symptômes et Diagnostics Top 5
          </CardTitle>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">
              Échantillon Global
            </div>
            <div className="text-sm font-bold">
              {kpis.esterman_sample_size} examens
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-0 divide-y border-t md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-6">
            <h4 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              Diagnostics les plus fréquents
            </h4>
            <div className="h-[250px] w-full">
              {chartDiagnostics.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartDiagnostics}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      fontSize={11}
                      width={140}
                      tickFormatter={(val: string) =>
                        val.length > 18 ? `${val.substring(0, 18)}...` : val
                      }
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar
                      dataKey="count"
                      name="Cas"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Pas de diagnostics enregistrés
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-between p-6">
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
                Prévalence des symptômes majeurs
              </h4>
              <div className="h-[200px] w-full">
                {symptomsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={symptomsData}
                      margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} tickMargin={10} />
                      <YAxis
                        type="number"
                        fontSize={11}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Bar
                        dataKey="value"
                        name="Cas"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Pas de symptômes enregistrés
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-2 text-sm">
              <span className="text-muted-foreground">
                Score Esterman Moyen
              </span>
              <span className="text-lg font-bold">
                {kpis.esterman_mean != null
                  ? `${kpis.esterman_mean.toFixed(1)} %`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
