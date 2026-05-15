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

import type { AnalyticsSymptomsFull } from '../../types';

const SYMPTOM_LABELS: Record<string, string> = {
  BAV: 'BAV',
  DOULEUR: 'Douleur',
  ROUGEUR: 'Rougeur',
  LARMOIEMENT: 'Larmoiement',
  DIPLOPIE: 'Diplopie',
  STRABISME: 'Strabisme',
  SECRETIONS: 'Sécrétions',
  PRURIT_OCULAIRE: 'Prurit',
  NYSTAGMUS: 'Nystagmus',
  PTOSIS: 'Ptosis',
  AUTRES: 'Autres',
  AUCUN: 'Aucun',
};

type SymptomsFullChartProps = {
  data: AnalyticsSymptomsFull;
};

export const SymptomsFullChart = ({ data }: SymptomsFullChartProps) => {
  if (!data || data.sample_size === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Distribution complète des symptômes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[120px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Aucune donnée.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.symptom_distribution.map((d) => ({
    name: SYMPTOM_LABELS[d.symptom] ?? d.symptom,
    count: d.count,
    pct: d.pct,
  }));

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">
            Distribution complète des symptômes (12 symptômes)
          </CardTitle>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Échantillon</div>
            <div className="text-sm font-bold">{data.sample_size} examens</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid divide-y border-t md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-6">
            <h4 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              Fréquence par symptôme
            </h4>
            <div className="h-[280px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={11} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      fontSize={11}
                      width={90}
                    />
                    <Tooltip
                      formatter={(value: any, _: any, props: any) => [
                        `${value} cas (${props?.payload?.pct?.toFixed(1)}%)`,
                      ]}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar
                      dataKey="count"
                      name="Cas"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun symptôme.</p>
              )}
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
                Diplopie
              </h4>
              {data.diplopie_detail.sample_size > 0 ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monoculaire</span>
                    <span className="font-medium">
                      {data.diplopie_detail.monoculaire_pct.toFixed(1)} %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Binoculaire</span>
                    <span className="font-medium">
                      {data.diplopie_detail.binoculaire_pct.toFixed(1)} %
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    n = {data.diplopie_detail.sample_size}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune diplopie.
                </p>
              )}
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
                Strabisme
              </h4>
              {data.strabisme_detail.sample_size > 0 ? (
                <div className="space-y-2 text-sm">
                  {[
                    {
                      label: 'Convergent',
                      val: data.strabisme_detail.convergent_pct,
                    },
                    {
                      label: 'Divergent',
                      val: data.strabisme_detail.divergent_pct,
                    },
                    { label: 'OD', val: data.strabisme_detail.od_pct },
                    { label: 'OG', val: data.strabisme_detail.og_pct },
                    { label: 'ODG', val: data.strabisme_detail.odg_pct },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{val.toFixed(1)} %</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    n = {data.strabisme_detail.sample_size}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun strabisme.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">
                Sans symptôme
              </span>
              <span className="text-lg font-bold">
                {data.no_symptom_pct.toFixed(1)} %
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
