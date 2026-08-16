'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface RdvStatsDatum {
  name: string;
  value: number;
  fill: string;
}

interface RdvStatsDonutProps {
  data: RdvStatsDatum[];
}

/**
 * Donut de répartition des RDV par statut (recharts).
 * Chargé en lazy via next/dynamic depuis la page Agenda.
 */
export function RdvStatsDonut({ data }: RdvStatsDonutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Répartition par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, 'RDV']}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
