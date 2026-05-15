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

import type { AnalyticsRiskFactors } from '../../types';

type RiskFactorsSectionProps = {
  data: AnalyticsRiskFactors;
};

export const RiskFactorsSection = ({ data }: RiskFactorsSectionProps) => {
  if (!data || data.sample_size === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Facteurs de risque
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[120px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Aucune donnée.</p>
        </CardContent>
      </Card>
    );
  }

  const familialData = [
    { name: 'GPAO', pct: data.family_history.gpao_pct },
    { name: 'Cécité', pct: data.family_history.cecite_pct },
    { name: 'Autre', pct: data.family_history.other_pct },
  ].filter((d) => d.pct > 0);

  const addictionData = [
    { name: 'Tabagisme', pct: data.addiction.type_distribution.TABAGISME_pct },
    { name: 'Alcool', pct: data.addiction.type_distribution.ALCOOL_pct },
    { name: 'Autres', pct: data.addiction.type_distribution.AUTRES_pct },
  ].filter((d) => d.pct > 0);

  const topOphthalmic = data.medical_antecedents.top_ophthalmic.slice(0, 5);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">
            Facteurs de risque
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.sample_size} patients
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-0 divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Screen usage + Medical antecedents KPIs */}
          <div className="space-y-3 p-6">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
              Habitudes & antécédents
            </h4>
            {[
              {
                label: 'Utilisateurs écrans',
                pct: data.screen_usage.uses_screen_pct,
              },
              {
                label: 'Ant. médico-chir.',
                pct: data.medical_antecedents.has_medical_pct,
              },
              {
                label: 'Pathologies ophtalmo.',
                pct: data.medical_antecedents.has_ophthalmic_pct,
              },
              {
                label: 'Ant. familiaux',
                pct: data.family_history.has_familial_pct,
              },
              { label: 'Addictions', pct: data.addiction.has_addiction_pct },
            ].map(({ label, pct }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{pct.toFixed(1)} %</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {data.screen_usage.mean_hours_per_day != null && (
              <p className="text-xs text-muted-foreground">
                Moy. écrans :{' '}
                <span className="font-medium text-foreground">
                  {data.screen_usage.mean_hours_per_day.toFixed(1)} h/j
                </span>
              </p>
            )}
          </div>

          {/* Family history bar + addictions */}
          <div className="p-6">
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Antécédents familiaux
            </h4>
            <div className="h-[140px] w-full">
              {familialData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={familialData}
                    margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis
                      tickFormatter={(v: number) => `${v}%`}
                      fontSize={11}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        `${Number(value).toFixed(1)}%`,
                      ]}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar
                      dataKey="pct"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun antécédent familial.
                </p>
              )}
            </div>

            {addictionData.length > 0 && (
              <>
                <h4 className="mb-3 mt-4 text-xs font-semibold uppercase text-muted-foreground">
                  Addictions
                </h4>
                <div className="h-[100px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={addictionData}
                      margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis
                        tickFormatter={(v: number) => `${v}%`}
                        fontSize={11}
                      />
                      <Tooltip
                        formatter={(value: any) => [
                          `${Number(value).toFixed(1)}%`,
                        ]}
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Bar
                        dataKey="pct"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        barSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>

          {/* Top ophthalmic pathologies */}
          <div className="p-6">
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Top pathologies ophtalmologiques
            </h4>
            {topOphthalmic.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topOphthalmic}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={11} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      fontSize={10}
                      width={120}
                      tickFormatter={(v: string) =>
                        v.length > 16 ? `${v.slice(0, 16)}…` : v
                      }
                    />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Bar
                      dataKey="count"
                      name="Cas"
                      fill="#6366f1"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune pathologie ophtalmologique.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
