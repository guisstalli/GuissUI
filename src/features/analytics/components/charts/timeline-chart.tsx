import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsTimeline } from '../../types';

type TimelineChartProps = {
  data: AnalyticsTimeline['timeline'];
};

export const TimelineChart = ({ data }: TimelineChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Évolution temporelle
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucune donnée temporelle.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format the date for the XAxis
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Évolution Temporelle des Examens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="formattedDate" fontSize={12} tickMargin={10} />
              <YAxis fontSize={12} tickMargin={10} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_examens"
                name="Total"
                stroke="#8b5cf6" // purple
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="adult_examens"
                name="Adultes"
                stroke="#3b82f6" // blue
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="child_examens"
                name="Enfants"
                stroke="#10b981" // green
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
