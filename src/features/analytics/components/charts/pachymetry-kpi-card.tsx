import { Layers } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AnalyticsPachymetry } from '../../types';

type PachymetryKpiProps = {
  data: AnalyticsPachymetry;
};

export const PachymetryKpiCard = ({ data }: PachymetryKpiProps) => {
  const kpis = data?.kpis;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          Pachymétrie (Cornée)
          <Layers className="size-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {kpis && kpis.sample_size > 0 ? (
          <div className="flex h-full flex-col justify-between">
            <div className="mb-4">
              <span className="text-3xl font-bold">
                {kpis.pachymetry_mean != null
                  ? Math.round(kpis.pachymetry_mean)
                  : '-'}
              </span>
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                µm
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Épaisseur moyenne de la cornée.</p>
              <p className="mt-2">Basé sur {kpis.sample_size} mesures.</p>
            </div>
          </div>
        ) : (
          <div className="flex h-[100px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Aucune donnée de pachymétrie.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
