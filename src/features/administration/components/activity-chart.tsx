import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AdminDashboardActivity } from '../types/schemas';

type ActivityChartProps = {
  data: AdminDashboardActivity['examens_per_day'];
};

/**
 * Examens réalisés par jour — le pouls métier de la plateforme.
 *
 * Barres EMPILÉES : la hauteur totale se lit comme le volume du jour, et la
 * césure interne montre la part adultes / enfants. Deux séries côte à côte
 * obligeraient au contraire à additionner de tête pour obtenir le volume.
 */
export function ActivityChart({ data }: ActivityChartProps) {
  const formatted = (data ?? []).map((point) => ({
    ...point,
    formattedDate: new Date(point.date).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  const hasActivity = formatted.some(
    (point) => point.adultes > 0 || point.enfants > 0,
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Examens réalisés par jour
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Adultes et enfants empilés — la hauteur donne le volume du jour.
        </p>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <div className="flex h-[260px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Aucun examen enregistré sur la période.
            </p>
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatted}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="formattedDate" fontSize={12} tickMargin={8} />
                <YAxis fontSize={12} tickMargin={8} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="adultes"
                  stackId="examens"
                  name="Adultes"
                  fill="#0ea5e9"
                />
                <Bar
                  dataKey="enfants"
                  stackId="examens"
                  name="Enfants"
                  fill="#f59e0b"
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
