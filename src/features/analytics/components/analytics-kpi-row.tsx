import { Activity, Users, FileText, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsOverview } from '../types/types';

type AnalyticsKpiRowProps = {
  data: AnalyticsOverview['population'];
};

export const AnalyticsKpiRow = ({ data }: AnalyticsKpiRowProps) => {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {/* Ce nombre n'est PAS le total des patients enregistrés : la cohorte
              analytique part des examens, donc seuls les patients ayant au
              moins un examen (et correspondant aux filtres) y figurent. Mesuré
              en base : 300 patients pour 290 examinés. Le libellé « Total
              Patients / Dans la base de données » faisait lire deux chiffres
              contradictoires entre cet écran et l'accueil, alors qu'ils
              mesurent deux grandeurs différentes. */}
          <CardTitle className="text-sm font-medium">
            Patients examinés
          </CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.patients_total}</div>
          <p className="text-xs text-muted-foreground">
            Ayant au moins un examen sur la période filtrée
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
