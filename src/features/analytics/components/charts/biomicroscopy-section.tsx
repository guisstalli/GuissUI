import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsBiomicroscopy } from '../../types';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6'];

function pct(val: number) {
  return `${val.toFixed(1)}%`;
}

type DonutProps = {
  title: string;
  slices: { name: string; value: number; color: string }[];
  sampleSize: number;
};

function MiniDonut({ title, slices, sampleSize }: DonutProps) {
  const filtered = slices.filter((s) => s.value > 0);
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </p>
      {filtered.length > 0 ? (
        <>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filtered}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={52}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {filtered.map((entry) => (
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
          <div className="space-y-1">
            {filtered.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-medium">{pct(s.value)}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">n = {sampleSize}</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Aucune donnée.</p>
      )}
    </div>
  );
}

type BiomicroscopySectionProps = {
  data: AnalyticsBiomicroscopy;
};

export const BiomicroscopySection = ({ data }: BiomicroscopySectionProps) => {
  const { anterior, posterior } = data;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Biomicroscopie</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-0 divide-y border-t md:grid-cols-2 md:divide-x md:divide-y-0">
          {/* Segment antérieur */}
          <div className="p-6">
            <h4 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              Segment antérieur
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <MiniDonut
                title="Cristallin"
                sampleSize={anterior.cristallin.sample_size}
                slices={[
                  {
                    name: 'Normal',
                    value: anterior.cristallin.normal_pct,
                    color: COLORS[0],
                  },
                  {
                    name: 'Cataracte',
                    value: anterior.cristallin.opaque_pct,
                    color: COLORS[1],
                  },
                  {
                    name: 'Pseudophakie',
                    value: anterior.cristallin.pseudophakie_pct,
                    color: COLORS[2],
                  },
                  {
                    name: 'Aphakie',
                    value: anterior.cristallin.aphakie_pct,
                    color: COLORS[3],
                  },
                ]}
              />
              <MiniDonut
                title="Cornée"
                sampleSize={anterior.cornee.sample_size}
                slices={[
                  {
                    name: 'Normale',
                    value: anterior.cornee.normal_pct,
                    color: COLORS[0],
                  },
                  {
                    name: 'Opacité axe',
                    value: anterior.cornee.opacite_axe_pct,
                    color: COLORS[1],
                  },
                  {
                    name: 'Op. périph.',
                    value: anterior.cornee.opacite_peripherie_pct,
                    color: COLORS[2],
                  },
                  {
                    name: 'Op. totale',
                    value: anterior.cornee.opacite_totale_pct,
                    color: COLORS[3],
                  },
                ]}
              />
            </div>
          </div>

          {/* Segment postérieur */}
          <div className="p-6">
            <h4 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              Segment postérieur
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <MiniDonut
                title="Papille"
                sampleSize={posterior.papille.sample_size}
                slices={[
                  {
                    name: 'Normale',
                    value: posterior.papille.normale_pct,
                    color: COLORS[0],
                  },
                  {
                    name: 'Excavation',
                    value: posterior.papille.excavation_elargie_pct,
                    color: COLORS[1],
                  },
                  {
                    name: 'Atrophie',
                    value: posterior.papille.atrophie_pct,
                    color: COLORS[2],
                  },
                  {
                    name: 'Oedème',
                    value: posterior.papille.oedeme_pct,
                    color: COLORS[3],
                  },
                ]}
              />
              <MiniDonut
                title="Macula"
                sampleSize={posterior.macula.sample_size}
                slices={[
                  {
                    name: 'Normale',
                    value: posterior.macula.normal_pct,
                    color: COLORS[0],
                  },
                  {
                    name: 'DMLA',
                    value: posterior.macula.dmla_pct,
                    color: COLORS[1],
                  },
                  {
                    name: 'Oedème',
                    value: posterior.macula.oedeme_pct,
                    color: COLORS[2],
                  },
                  {
                    name: 'Cicatrice',
                    value: posterior.macula.cicatrice_pct,
                    color: COLORS[3],
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
