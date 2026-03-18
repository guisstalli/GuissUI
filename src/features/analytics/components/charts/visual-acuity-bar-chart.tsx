import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsVisualAcuity } from '../../types';

type VisualAcuityBarChartProps = {
  data: AnalyticsVisualAcuity;
};

export const VisualAcuityBarChart = ({ data }: VisualAcuityBarChartProps) => {
  if (!data || !data.kpis || data.kpis.sample_size === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Acuité Visuelle</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Aucune donnée AV.</p>
        </CardContent>
      </Card>
    );
  }

  const { kpis } = data;

  const chartData = [
    {
      name: '< 3/10 (Malvoyance)',
      value: kpis.pct_av_less_than_3,
      color: '#ef4444',
    }, // red
    {
      name: '< 5/10 (Basse)',
      value: kpis.pct_av_less_than_5,
      color: '#f59e0b',
    }, // amber
    {
      name: '< 10/10 (Moyenne)',
      value: kpis.pct_av_less_than_10,
      color: '#3b82f6',
    }, // blue
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium">
              Acuité Visuelle
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
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" unit="%" domain={[0, 100]} fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={11} width={120} />
              <Tooltip
                formatter={(value: any) => [`${value}%`, 'Proportion']}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">Moyenne Globale AV</span>
          <span className="text-lg font-bold">
            {kpis.av_mean != null ? `${kpis.av_mean.toFixed(2)} / 10` : 'N/A'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
