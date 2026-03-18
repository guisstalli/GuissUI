import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsRefraction } from '../../types';

type RefractionDonutChartProps = {
  data: AnalyticsRefraction;
};

const COLORS = {
  Myope: '#3b82f6', // blue
  Hypermetrope: '#f59e0b', // amber
  Normal: '#10b981', // green
};

export const RefractionDonutChart = ({ data }: RefractionDonutChartProps) => {
  if (!data || !data.kpis || data.kpis.sample_size === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Réfraction</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Aucune donnée de réfraction.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { kpis } = data;

  const chartData = [
    { name: 'Myope', value: kpis.pct_myope, fill: COLORS.Myope },
    {
      name: 'Hypermetrope',
      value: kpis.pct_hypermetrope,
      fill: COLORS.Hypermetrope,
    },
    { name: 'Normal/Autre', value: kpis.pct_normal, fill: COLORS.Normal },
  ].filter((d) => d.value > 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium">
              Bilan Réfractif
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${value}%`, 'Proportion']}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">Eq. Sphérique Moy.</span>
          <span className="text-lg font-bold">
            {kpis.eqs_mean != null
              ? `${kpis.eqs_mean > 0 ? '+' : ''}${kpis.eqs_mean.toFixed(2)} D`
              : 'N/A'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
