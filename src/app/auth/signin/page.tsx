'use client';

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

/**
 * Page de connexion qui redirige automatiquement vers Keycloak
 * Gère les erreurs pour éviter les boucles infinies
 */
function SignInContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const [hasAttempted, setHasAttempted] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Si déjà connecté, rediriger vers la page demandée
    if (status === 'authenticated') {
      router.replace(callbackUrl);
      return;
    }

    // Si non authentifié et pas d'erreur et pas encore tenté
    if (status === 'unauthenticated' && !error && !hasAttempted) {
      setHasAttempted(true);
      signIn('keycloak', { callbackUrl });
    }
  }, [status, callbackUrl, router, error, hasAttempted]);

  // Fonction pour réessayer la connexion
  const handleRetry = async () => {
    setIsRetrying(true);
    // D'abord, se déconnecter pour nettoyer les tokens corrompus
    await signOut({ redirect: false });
    // Puis rediriger vers Keycloak
    signIn('keycloak', { callbackUrl: '/' });
  };

  // Si erreur, afficher un message avec bouton de retry
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex max-w-md flex-col items-center gap-6 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Erreur de connexion
            </h1>
            <p className="text-sm text-muted-foreground">
              {error === 'keycloak'
                ? "La connexion au serveur d'authentification a échoué. Votre session a peut-être expiré."
                : `Une erreur est survenue: ${error}`}
            </p>
          </div>

          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Reconnexion en cours...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Réessayer la connexion
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Afficher un loader pendant la redirection
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Redirection vers la page de connexion...
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
