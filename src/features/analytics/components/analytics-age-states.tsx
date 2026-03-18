'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AnalyticsAgeLoadingState() {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-2 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AnalyticsAgeEmptyState() {
  return (
    <Card role="status" aria-live="polite">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertCircle
          className="size-8 text-muted-foreground"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-foreground">
            Aucune donnée disponible
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Aucun examen n’a été trouvé avec les filtres sélectionnés.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsAgeErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}) {
  return (
    <Card role="alert" aria-live="assertive" className="border-destructive/30">
      <CardContent className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 size-5 text-destructive"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-destructive">
              Erreur de chargement analytics
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCw className="mr-2 size-4" aria-hidden="true" />
          Réessayer
        </Button>
      </CardContent>
    </Card>
  );
}
