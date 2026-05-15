'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ExamsLast7DaysItem } from '../types/schemas';

interface ExamsChartProps {
  data: ExamsLast7DaysItem[];
}

export function ExamsChart({ data }: ExamsChartProps) {
  const formatted = data.map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    }),
  }));

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Examens — 7 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">Aucune donnée.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Examens — 7 derniers jours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formatted}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                fontSize={11}
                tickMargin={6}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                fontSize={11}
                tickMargin={6}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
                formatter={(value) => [value ?? 0, 'Examens']}
              />
              <Bar dataKey="total" fill="#70CBFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
