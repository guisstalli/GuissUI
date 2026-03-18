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
import { Table, type TableColumn } from '@/components/ui/table';

import type { AnalyticsSites } from '../../types';

type SitesBarChartProps = {
  data: AnalyticsSites['sites'];
};

export const SitesBarChart = ({ data }: SitesBarChartProps) => {
  if (!data || data.length === 0) {
    // ... rendu vide ...
    return (
      <Card className="col-span-full h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Répartition par Sites
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Aucune donnée site.</p>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort(
    (a, b) => b.examens_total - a.examens_total,
  );

  const columns: TableColumn<any>[] = [
    { title: 'Site', field: 'site_libelle' },
    {
      title: 'Patients',
      field: 'patients_total',
      Cell: ({ entry }) => (
        <div className="text-right">{entry.patients_total}</div>
      ),
    },
    {
      title: 'Av moy.',
      field: 'av_mean',
      Cell: ({ entry }) => (
        <div className="text-right">
          {entry.av_mean != null ? entry.av_mean.toFixed(2) : '-'}
        </div>
      ),
    },
    {
      title: 'TO moy.',
      field: 'to_mean',
      Cell: ({ entry }) => (
        <div className="text-right">
          {entry.to_mean != null ? entry.to_mean.toFixed(1) : '-'}
        </div>
      ),
    },
  ];

  return (
    <Card className="col-span-full h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Répartition et Statistiques par Sites
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-0 divide-y border-t md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-6">
            <h4 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              Volume d&apos;examens
            </h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} allowDecimals={false} />
                  <YAxis
                    dataKey="site_libelle"
                    type="category"
                    fontSize={12}
                    width={100}
                    tickFormatter={(val: string) =>
                      val.length > 12 ? `${val.substring(0, 12)}...` : val
                    }
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px' }}
                  />
                  <Bar
                    dataKey="examens_total"
                    name="Examens"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-6">
            <h4 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              Tableau de synthèse
            </h4>
            <div className="relative overflow-x-auto">
              <Table data={sortedData as any} columns={columns} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
