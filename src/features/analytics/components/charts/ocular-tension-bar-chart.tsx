import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type {
  AnalyticsOcularTension,
  CohortCriterion,
} from '../../types/types';

import { DrilldownHint } from './drilldown-hint';
import { TensionParOeil } from './tension-par-oeil';
import { UnitesEchantillon } from './unites-echantillon';

type OcularTensionBarChartProps = {
  data: AnalyticsOcularTension;
  onSegmentClick?: (criterion: CohortCriterion) => void;
};

export const OcularTensionBarChart = ({
  data,
  onSegmentClick,
}: OcularTensionBarChartProps) => {
  if (!data || !data.kpis || data.kpis.sample_size === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Tension Oculaire (TO)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Aucune donnée de TO.</p>
        </CardContent>
      </Card>
    );
  }

  const { kpis } = data;

  const chartData: Array<{
    name: string;
    value: number;
    fill: string;
    criterion?: CohortCriterion;
  }> = [
    {
      name: 'Normale (<21)',
      value: 100 - kpis.pct_to_above_21,
      fill: '#10b981',
    }, // green
    {
      name: 'Élevée (>21)',
      value: kpis.pct_to_above_21 - kpis.pct_to_above_25,
      fill: '#f59e0b',
      criterion: {
        type: 'tension',
        value: 'hypertonie_legere',
        label: 'Tension oculaire > 21 mmHg (Hypertonie légère)',
      },
    }, // amber
    {
      name: 'Très élevée (>25)',
      value: kpis.pct_to_above_25,
      fill: '#ef4444',
      criterion: {
        type: 'tension',
        value: 'hypertonie_moderee',
        label: 'Tension oculaire > 25 mmHg (Hypertonie modérée)',
      },
    }, // red
  ];

  const handleBarClick = (entry: {
    payload?: { criterion?: CohortCriterion };
  }) => {
    const criterion = entry?.payload?.criterion;
    if (onSegmentClick && criterion) {
      onSegmentClick(criterion);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              Tension Oculaire (TO)
            </CardTitle>
            {onSegmentClick && (
              <DrilldownHint label="Cliquez sur une tranche pour explorer" />
            )}
          </div>
          <UnitesEchantillon
            count={kpis.sample_size}
            patients={kpis.patients_count}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                fontSize={11}
                interval={0}
                tickMargin={10}
              />
              <YAxis type="number" unit="%" domain={[0, 100]} fontSize={11} />
              <Tooltip
                formatter={(value: any) => [
                  `${Number(value).toFixed(1)}%`,
                  'Proportion',
                ]}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                barSize={40}
                onClick={onSegmentClick ? handleBarClick : undefined}
                cursor={onSegmentClick ? 'pointer' : undefined}
                activeBar={onSegmentClick ? { fillOpacity: 0.8 } : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">Moyenne Globale TO</span>
          <span className="text-lg font-bold">
            {kpis.to_mean != null ? `${kpis.to_mean.toFixed(1)} mmHg` : 'N/A'}
          </span>
        </div>
        {kpis.count_to_above_21 != null && (
          <p className="mt-1 text-xs text-muted-foreground">
            &gt; 21 mmHg : {kpis.pct_to_above_21} % ({kpis.count_to_above_21}{' '}
            yeux sur {kpis.sample_size})
          </p>
        )}
        {data.by_eye && <TensionParOeil byEye={data.by_eye} />}
      </CardContent>
    </Card>
  );
};
