'use client';

import { Badge } from '@/components/ui/badge';

const formatLastUpdate = (value?: number) => {
  if (!value) {
    return 'Non disponible';
  }

  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export function AnalyticsAgeHeader({
  lastUpdatedAt,
}: {
  lastUpdatedAt?: number;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Analytics Âge
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue populationnelle des indicateurs d’activité et de profil patient.
        </p>
      </div>

      <Badge variant="secondary" className="w-fit">
        Mise à jour: {formatLastUpdate(lastUpdatedAt)}
      </Badge>
    </div>
  );
}
