import { AlertCircle, FileX2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className || ''}`} />
);

export const AnalyticsLoadingState = () => {
  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-12">
        <Skeleton className="h-[400px] w-full rounded-xl md:col-span-8" />
        <Skeleton className="h-[400px] w-full rounded-xl md:col-span-4" />
      </div>
      <div className="grid gap-4 md:grid-cols-12">
        <Skeleton className="h-[350px] w-full rounded-xl md:col-span-4" />
        <Skeleton className="h-[350px] w-full rounded-xl md:col-span-4" />
        <Skeleton className="h-[350px] w-full rounded-xl md:col-span-4" />
      </div>
    </div>
  );
};

export const AnalyticsErrorState = ({
  message = 'Une erreur est survenue lors du chargement des analytiques.',
  onRetry,
  isRetrying,
}: {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) => {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="bg-destructive/10 mb-4 rounded-full p-3">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Erreur de chargement</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            disabled={isRetrying}
            className="min-w-[120px]"
          >
            {isRetrying ? 'Réessai...' : 'Réessayer'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const AnalyticsEmptyState = ({
  title = 'Aucune donnée disponible',
  description = 'Modifiez vos filtres pour voir les résultats.',
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <FileX2 className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
