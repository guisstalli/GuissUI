import { Activity, Users, FileText, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsOverview } from '../types';

type AnalyticsKpiRowProps = {
  data: AnalyticsOverview['population'];
};

export const AnalyticsKpiRow = ({ data }: AnalyticsKpiRowProps) => {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.patients_total}</div>
          <p className="text-xs text-muted-foreground">
            Dans la base de données
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Examens</CardTitle>
          <FileText className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.examens_total}</div>
          <p className="text-xs text-muted-foreground">
            Consultations enregistrées
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Âge Moyen</CardTitle>
          <Clock className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.age_mean ? `${Math.round(data.age_mean)} ans` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            Sur l&apos;échantillon complet
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activité</CardTitle>
          <Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.patients_total > 0
              ? (data.examens_total / data.patients_total).toFixed(1)
              : '0'}
          </div>
          <p className="text-xs text-muted-foreground">Examens par patient</p>
        </CardContent>
      </Card>
    </div>
  );
};
