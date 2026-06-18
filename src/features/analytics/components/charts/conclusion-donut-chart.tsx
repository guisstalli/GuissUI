import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { CohortCriterion } from '../../types/types';

type ConclusionDonutChartProps = {
  data: Record<string, number>;
  onSegmentClick?: (criterion: CohortCriterion) => void;
};

const COLORS: Record<string, string> = {
  compatible: '#10b981', // green
  a_risque: '#f59e0b', // amber
  incompatible: '#ef4444', // red
};

const LABELS: Record<string, string> = {
  compatible: 'Compatible',
  a_risque: 'À risque',
  incompatible: 'Incompatible',
};

export const ConclusionDonutChart = ({
  data,
  onSegmentClick,
}: ConclusionDonutChartProps) => {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: LABELS[key] ?? key,
    key,
    value,
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Verdicts cliniques
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Données indisponibles</p>
        </CardContent>
      </Card>
    );
  }

  const handleSegmentClick = (entry: {
    payload?: { key?: string; name?: string };
  }) => {
    const key = entry?.payload?.key;
    if (onSegmentClick && key && COLORS[key]) {
      onSegmentClick({
        type: 'conclusion',
        value: key,
        label: `Verdict : ${entry.payload?.name ?? key}`,
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Verdicts cliniques
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
                onClick={onSegmentClick ? handleSegmentClick : undefined}
                cursor={onSegmentClick ? 'pointer' : undefined}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.key] ?? '#9ca3af'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [
                  `${value} examens (${((Number(value) / total) * 100).toFixed(1)}%)`,
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
