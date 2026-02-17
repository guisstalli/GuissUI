'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { type ReactNode, useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { canAccessInternalApp } from '@/lib/authorization';

interface InternalAppGuardProps {
  children: ReactNode;
}

/**
 * Garde d'accès pour l'application interne
 * Vérifie que l'utilisateur a un rôle autorisé (DOCTOR, TECHNICIAN, DATA_ENTRY, PARTNER_USER)
 * Redirige vers /unauthorized si l'utilisateur est ADMIN ou n'a pas de rôle autorisé
 */
export function InternalAppGuard({ children }: InternalAppGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Construire l'objet user pour les fonctions d'autorisation
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        roles: (session.user as { roles?: string[] }).roles || [],
      }
    : null;

  const hasAccess = canAccessInternalApp(user);

  useEffect(() => {
    // Attendre la fin du chargement
    if (isLoading) return;

    // Si non authentifié, laisser le middleware gérer la redirection
    if (!isAuthenticated) return;

    // Si l'utilisateur n'a pas accès à l'application interne
    if (!hasAccess) {
      router.replace(paths.unauthorized.getHref());
    }
  }, [isLoading, isAuthenticated, hasAccess, router]);

  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher le spinner (le middleware redirigera)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">
            Redirection vers la connexion...
          </p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'a pas accès, afficher un spinner pendant la redirection
  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">
            Vérification des permissions...
          </p>
        </div>
      </div>
    );
  }

  // L'utilisateur a accès, afficher le contenu
  return <>{children}</>;
}
