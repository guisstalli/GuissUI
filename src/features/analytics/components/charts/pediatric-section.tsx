import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsPediatric } from '../../types';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

type PediatricSectionProps = {
  data: AnalyticsPediatric;
};

export const PediatricSection = ({ data }: PediatricSectionProps) => {
  if (!data || data.sample_size === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Vision pédiatrique
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[120px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Aucune donnée enfant disponible.
          </p>
        </CardContent>
      </Card>
    );
  }

  const alignmentSlices = [
    {
      name: 'Orthotropie',
      value: data.alignment.orthotropie_pct,
      color: COLORS[0],
    },
    {
      name: 'Ésotropie',
      value: data.alignment.esotropie_pct,
      color: COLORS[1],
    },
    {
      name: 'Exotropie',
      value: data.alignment.exotropie_pct,
      color: COLORS[2],
    },
  ].filter((s) => s.value > 0);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">
            Vision pédiatrique
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.sample_size} examens
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-0 divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Alignment */}
          <div className="p-6">
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Alignement oculaire (Hirschberg)
            </h4>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alignmentSlices}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {alignmentSlices.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`]}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {alignmentSlices.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
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
          </div>

          {/* Stereopsis */}
          <div className="flex flex-col justify-center p-6">
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Stéréopsie Lang II
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Testés</span>
                <span className="text-lg font-bold">
                  {data.stereopsis_lang_ii.tested_pct.toFixed(1)} %
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Succès</span>
                <span className="text-lg font-bold text-green-600">
                  {data.stereopsis_lang_ii.success_pct.toFixed(1)} %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.stereopsis_lang_ii.success_count} succès sur{' '}
                {data.sample_size} examens
              </p>
            </div>
          </div>

          {/* Cover test */}
          <div className="p-6">
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Cover test
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-2 font-medium text-foreground">
                  Vision de loin (VL)
                </p>
                {[
                  {
                    label: 'Orthotropie',
                    val: data.cover_test_vl.orthotropie_pct,
                  },
                  { label: 'Tropie', val: data.cover_test_vl.tropie_pct },
                  { label: 'Phorie', val: data.cover_test_vl.phorie_pct },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{val.toFixed(1)} %</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-2 font-medium text-foreground">
                  Vision de près (VP)
                </p>
                {[
                  {
                    label: 'Orthotropie',
                    val: data.cover_test_vp.orthotropie_pct,
                  },
                  { label: 'Tropie', val: data.cover_test_vp.tropie_pct },
                  { label: 'Phorie', val: data.cover_test_vp.phorie_pct },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{val.toFixed(1)} %</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
