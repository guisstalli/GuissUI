'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function GestionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <div>
        <h2 className="text-lg font-semibold">Erreur de chargement</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || 'Impossible de charger cette section.'}
        </p>
      </div>
      <Button onClick={reset} size="sm" variant="outline" className="gap-2">
        <RefreshCw className="size-4" />
        Réessayer
      </Button>
    </div>
  );
}
