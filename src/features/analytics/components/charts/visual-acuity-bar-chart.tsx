import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsVisualAcuity, CohortCriterion } from '../../types/types';

import { AcuiteSansCorrection } from './acuite-sans-correction';
import { DrilldownHint } from './drilldown-hint';
import { Effectif } from './effectif';
import { MoyenneLogmar } from './moyenne-logmar';
import { UnitesEchantillon } from './unites-echantillon';

type VisualAcuityBarChartProps = {
  data: AnalyticsVisualAcuity;
  onSegmentClick?: (criterion: CohortCriterion) => void;
};

export const VisualAcuityBarChart = ({
  data,
  onSegmentClick,
}: VisualAcuityBarChartProps) => {
  if (!data || !data.kpis || data.kpis.sample_size === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Acuité Visuelle</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Aucune donnée AV.</p>
        </CardContent>
      </Card>
    );
  }

  const { kpis } = data;

  const chartData = [
    {
      name: '< 3/10 (Malvoyance)',
      value: kpis.pct_av_less_than_3,
      count: kpis.count_av_less_than_3,
      color: '#ef4444',
      criterion: {
        type: 'acuity' as const,
        value: 'malvoyance',
        label: 'Acuité d’au moins un œil < 3/10 (Malvoyance)',
      },
    }, // red
    {
      name: '< 5/10 (Basse)',
      value: kpis.pct_av_less_than_5,
      count: kpis.count_av_less_than_5,
      color: '#f59e0b',
      criterion: {
        type: 'acuity' as const,
        value: 'basse_vision',
        label: 'Acuité d’au moins un œil < 5/10 (Basse vision)',
      },
    }, // amber
    {
      name: '< 10/10 (Moyenne)',
      value: kpis.pct_av_less_than_10,
      count: kpis.count_av_less_than_10,
      color: '#3b82f6',
      criterion: {
        type: 'acuity' as const,
        value: 'moyenne',
        label: 'Acuité d’au moins un œil < 10/10 (Moyenne)',
      },
    }, // blue
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
              Acuité Visuelle
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Meilleur œil, une valeur par examen
            </p>
            {onSegmentClick && <DrilldownHint />}
          </div>
          <UnitesEchantillon
            count={kpis.sample_size}
            unit="examen"
            patients={kpis.patients_count}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" unit="%" domain={[0, 100]} fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={11} width={120} />
              <Tooltip
                formatter={(value, _name, item) => {
                  const count = (item?.payload as { count?: number })?.count;
                  return [
                    count != null
                      ? `${value} % (${count} sur ${kpis.sample_size} examens)`
                      : `${value} %`,
                    'Proportion',
                  ];
                }}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={24}
                onClick={onSegmentClick ? handleBarClick : undefined}
                cursor={onSegmentClick ? 'pointer' : undefined}
                activeBar={onSegmentClick ? { fillOpacity: 0.8 } : undefined}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-3 space-y-1 text-xs">
          {chartData.map((entry) => (
            <li key={entry.name} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{entry.name}</span>
              <span>
                <span className="font-medium">{entry.value} %</span>{' '}
                <Effectif
                  count={entry.count}
                  total={kpis.sample_size}
                  unit="examen"
                />
              </span>
            </li>
          ))}
        </ul>
        <MoyenneLogmar
          titre="Moyenne (LogMAR)"
          decimal={kpis.av_logmar_decimal}
          logmar={kpis.av_logmar_mean}
          zeros={kpis.av_zero_count}
          repli={kpis.av_mean}
        />
        {data.uncorrected_best_eye &&
          data.uncorrected_best_eye.sample_size > 0 && (
            <AcuiteSansCorrection resume={data.uncorrected_best_eye} />
          )}
      </CardContent>
    </Card>
  );
};
