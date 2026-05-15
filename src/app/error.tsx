'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="size-12 text-destructive" />
      <div>
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message ||
            'Veuillez réessayer ou contacter le support si le problème persiste.'}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Code : {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} size="sm" className="gap-2">
        <RefreshCw className="size-4" />
        Réessayer
      </Button>
    </div>
  );
}
