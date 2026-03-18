import { Download, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type AnalyticsHeaderProps = {
  lastUpdatedAt?: number;
  onRefresh?: () => void;
  isRefetching?: boolean;
};

export const AnalyticsHeader = ({
  lastUpdatedAt,
  onRefresh,
  isRefetching,
}: AnalyticsHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Aperçu global de la population examinée. Dernière mise à jour à{' '}
          {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString() : '...'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled>
          <Download className="mr-2 size-4" />
          Exporter
        </Button>
        <Button
          variant="default"
          onClick={onRefresh}
          disabled={isRefetching || !onRefresh}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isRefetching ? 'animate-spin' : ''}`}
          />
          Actualiser
        </Button>
      </div>
    </div>
  );
};
