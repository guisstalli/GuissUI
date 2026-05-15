import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsVisualField } from '../../types';

type VisualFieldSectionProps = {
  data: AnalyticsVisualField;
};

export const VisualFieldSection = ({ data }: VisualFieldSectionProps) => {
  if (!data || data.sample_size === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Champ visuel</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[120px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Aucune donnée.</p>
        </CardContent>
      </Card>
    );
  }

  const { mean_field_extents: ext } = data;

  const defectData = data.defect_distribution.map((d) => ({
    name: d.value,
    count: d.count,
    pct: d.pct,
  }));

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">Champ visuel</CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.sample_size} examens
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid divide-y border-t md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-6">
            <h4 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              Distribution des défauts (PBO)
            </h4>
            <div className="h-[200px] w-full">
              {defectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={defectData}
                    margin={{ top: 0, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={10}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip
                      formatter={(value: any, _: any, props: any) => [
                        `${value} cas (${props?.payload?.pct?.toFixed(1)}%)`,
                      ]}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar
                      dataKey="count"
                      name="Cas"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      barSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pas de défauts enregistrés.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 p-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="text-sm text-muted-foreground">
                Score Esterman moyen
              </span>
              <span className="text-2xl font-bold">
                {data.esterman_mean != null
                  ? `${data.esterman_mean.toFixed(1)} %`
                  : 'N/A'}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Étendues moyennes du champ visuel
              </p>
              {[
                {
                  label: 'Supérieure',
                  val: ext.superieure_mean,
                  unit: '°',
                },
                { label: 'Inférieure', val: ext.inferieure_mean, unit: '°' },
                { label: 'Horizontale', val: ext.horizontal_mean, unit: '°' },
              ].map(({ label, val, unit }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">
                    {val != null ? `${val.toFixed(1)} ${unit}` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
