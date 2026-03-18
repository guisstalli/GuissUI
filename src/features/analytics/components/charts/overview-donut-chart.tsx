import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OverviewDonutChartProps = {
  data: Record<string, number>;
};

const COLORS: Record<string, string> = {
  H: '#3b82f6', // blue
  F: '#ec4899', // pink
  A: '#9ca3af', // gray
};

const LABELS: Record<string, string> = {
  H: 'Hommes',
  F: 'Femmes',
  A: 'Autres',
};

export const OverviewDonutChart = ({ data }: OverviewDonutChartProps) => {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: LABELS[key] || key,
    key,
    value,
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Répartition par Sexe
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Données indisponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Répartition par Sexe
        </CardTitle>
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
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.key] || COLORS.A}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [
                  `${value} patients (${((value / total) * 100).toFixed(1)}%)`,
                  'Total',
                ]}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
