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

import type { AnalyticsOcularTension } from '../../types';

type OcularTensionBarChartProps = {
  data: AnalyticsOcularTension;
};

export const OcularTensionBarChart = ({ data }: OcularTensionBarChartProps) => {
  if (!data || !data.kpis || data.kpis.sample_size === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Tension Oculaire (TO)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Aucune donnée de TO.</p>
        </CardContent>
      </Card>
    );
  }

  const { kpis } = data;

  const chartData = [
    {
      name: 'Normale (<21)',
      value: 100 - kpis.pct_to_above_21,
      fill: '#10b981',
    }, // green
    {
      name: 'Élevée (>21)',
      value: kpis.pct_to_above_21 - kpis.pct_to_above_25,
      fill: '#f59e0b',
    }, // amber
    { name: 'Très élevée (>25)', value: kpis.pct_to_above_25, fill: '#ef4444' }, // red
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium">
              Tension Oculaire (TO)
            </CardTitle>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Échantillon</div>
            <div className="text-lg font-bold">{kpis.sample_size}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                fontSize={11}
                interval={0}
                tickMargin={10}
              />
              <YAxis type="number" unit="%" domain={[0, 100]} fontSize={11} />
              <Tooltip
                formatter={(value: any) => [
                  `${Number(value).toFixed(1)}%`,
                  'Proportion',
                ]}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">Moyenne Globale TO</span>
          <span className="text-lg font-bold">
            {kpis.to_mean != null ? `${kpis.to_mean.toFixed(1)} mmHg` : 'N/A'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
