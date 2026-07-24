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

import type { AdminDashboardAiTraffic } from '../types/schemas';

type RunsPerDayChartProps = {
  data: AdminDashboardAiTraffic['runs_per_day'];
};

/** Histogramme des exécutions IA par jour sur la fenêtre sélectionnée. */
export function RunsPerDayChart({ data }: RunsPerDayChartProps) {
  const formattedData = (data ?? []).map((item) => ({
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
          Exécutions IA par jour
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formattedData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Aucune exécution sur la période.
            </p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
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
                <Bar
                  dataKey="runs"
                  name="Exécutions"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
