import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsDriverExperience } from '../../types';

const ETAT_COLORS: Record<string, string> = {
  ACTIF: '#22c55e',
  INACTIF: '#f59e0b',
  DCD: '#6b7280',
  PERTE_VUE: '#3b82f6',
};
const ETAT_LABELS: Record<string, string> = {
  ACTIF: 'Actif',
  INACTIF: 'Inactif',
  DCD: 'Décédé',
  PERTE_VUE: 'Perdu de vue',
};
const AV_LABELS: Record<string, string> = {
  lt_5: 'AV < 5/10',
  from_5_to_7: '5/10 ≤ AV ≤ 7/10',
  gt_7: 'AV > 7/10',
};

type DriverExperienceSectionProps = {
  data: AnalyticsDriverExperience;
};

export const DriverExperienceSection = ({
  data,
}: DriverExperienceSectionProps) => {
  if (!data || data.sample_size === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Expérience conduite
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[120px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucune donnée conducteur.
          </p>
        </CardContent>
      </Card>
    );
  }

  const etatSlices = Object.entries(data.etat_conducteur).map(
    ([key, { pct }]) => ({
      name: ETAT_LABELS[key] ?? key,
      value: pct,
      color: ETAT_COLORS[key] ?? '#94a3b8',
    }),
  );

  const visitData = data.accidents.accident_per_visit.map((v) => ({
    visit: `Visite ${v.visit}`,
    mean: v.mean_accidents ?? 0,
  }));

  const avData = data.av_vs_accidents.map((v) => ({
    name: AV_LABELS[v.av_range] ?? v.av_range,
    mean: v.mean_accidents ?? 0,
    count: v.count,
  }));

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">
            Expérience conduite
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.sample_size} conducteurs
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-0 divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* État conducteur donut */}
          <div className="p-6">
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              État du conducteur
            </h4>
            {etatSlices.length > 0 ? (
              <>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={etatSlices}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={58}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {etatSlices.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [
                          `${Number(value).toFixed(1)}%`,
                        ]}
                        contentStyle={{ borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1">
                  {etatSlices.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="inline-block size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="ml-auto font-medium">
                        {s.value.toFixed(1)} %
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune donnée.</p>
            )}
          </div>

          {/* Accidents per visit bar */}
          <div className="p-6">
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Accidents par visite
            </h4>
            <div className="mb-3 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-lg border p-2">
                <p className="text-muted-foreground">Moy. accidents</p>
                <p className="text-base font-bold">
                  {data.accidents.mean_accidents_per_driver != null
                    ? data.accidents.mean_accidents_per_driver.toFixed(1)
                    : 'N/A'}
                </p>
              </div>
              <div className="rounded-lg border p-2">
                <p className="text-muted-foreground">Avec accident</p>
                <p className="text-base font-bold">
                  {data.accidents.drivers_with_accident_pct.toFixed(1)} %
                </p>
              </div>
            </div>
            {visitData.length > 0 ? (
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={visitData}
                    margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="visit" fontSize={10} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Bar
                      dataKey="mean"
                      name="Moy. accidents"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pas de données par visite.
              </p>
            )}
          </div>

          {/* AV vs accidents */}
          <div className="p-6">
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Acuité visuelle vs accidents
            </h4>
            {avData.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={avData}
                    margin={{ top: 0, right: 10, left: -20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={10}
                      angle={-15}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis fontSize={11} />
                    <Tooltip
                      formatter={(value: any, _: any, props: any) => [
                        `${Number(value).toFixed(1)} acc. moy (n=${props?.payload?.count})`,
                      ]}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar
                      dataKey="mean"
                      name="Moy. accidents"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune corrélation.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
