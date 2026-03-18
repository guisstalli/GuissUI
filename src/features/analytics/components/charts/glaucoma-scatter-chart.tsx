import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import type { AnalyticsGlaucoma } from '../../types';

type GlaucomaScatterChartProps = {
  data: AnalyticsGlaucoma;
};

export const GlaucomaScatterChart = ({ data }: GlaucomaScatterChartProps) => {
  if (!data || !data.scatter_to_cd || data.scatter_to_cd.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Analyse Glaucome
          </CardTitle>
          <CardDescription>TO vs Cup/Disk Ratio</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Aucune donnée biométrique exploitable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium">
              Dépistage Glaucome
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Tension Oculaire (X) vs C/D Ratio (Y)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Suspects</div>
            <div className="text-lg font-bold text-orange-500">
              {data.kpis?.glaucoma_suspect_count ?? 0}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="to"
                name="Tension Oculaire"
                unit=" mmHg"
                domain={['auto', 'auto']}
                fontSize={12}
              />
              <YAxis
                type="number"
                dataKey="cd"
                name="C/D Ratio"
                domain={[0, 1.0]}
                fontSize={12}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <ReferenceLine x={21} stroke="orange" strokeDasharray="3 3" />
              <ReferenceLine x={25} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={0.3} stroke="orange" strokeDasharray="3 3" />
              <ReferenceLine y={0.6} stroke="red" strokeDasharray="3 3" />
              <Scatter
                name="Yeux"
                data={data.scatter_to_cd}
                fill="#ef4444"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-orange-500" /> Limite modérée
            (TO&gt;21, CD&gt;0.3)
          </span>
          <span className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-red-500" /> Haut risque
            (TO&gt;25, CD&gt;0.6)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
