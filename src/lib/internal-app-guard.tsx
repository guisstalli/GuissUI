'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { type ReactNode, useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import {
  ROLES,
  canAccessInternalApp,
  isAdminAreaPath,
} from '@/lib/authorization';

function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith('/landing') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/public') ||
    // anciens chemins publics : redirigés vers /public/* par next.config,
    // gardés ici pour couvrir le premier rendu avant redirection.
    pathname.startsWith('/evenements') ||
    pathname.startsWith('/rendez-vous') ||
    pathname.startsWith('/dossier')
  );
}

interface InternalAppGuardProps {
  children: ReactNode;
}

/**
 * Garde d'accès pour l'application interne.
 *
 * Doublon volontaire du middleware : celui-ci protège la navigation serveur,
 * celle-ci le rendu client. Les deux DOIVENT appliquer la même règle — sinon la
 * correction de l'un est annulée par l'autre.
 *
 * Rôles internes (STAFF, DOCTEUR, TECHNICIEN, DATA_ENTRY, SUPERUSER) : accès
 * complet. ADMIN, rôle technique sans accès clinique : uniquement l'espace
 * d'administration. Les autres : /unauthorized.
 */
export function InternalAppGuard({ children }: InternalAppGuardProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const isPublic = isPublicPath(pathname);
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        role: session.user.role ?? '',
      }
    : null;

  // Un ADMIN sur une route d'administration est légitime : on le laisse passer
  // et on le renvoie vers SON tableau de bord ailleurs, plutôt que vers
  // /unauthorized qui lui affirmait ne pas avoir le rôle Administrateur.
  const estAdmin = user?.role === ROLES.ADMIN;
  const hasAccess =
    canAccessInternalApp(user) || (estAdmin && isAdminAreaPath(pathname));

  useEffect(() => {
    if (isPublic || isLoading || !isAuthenticated) return;
    if (!hasAccess) {
      router.replace(
        estAdmin ? '/administration' : paths.unauthorized.getHref(),
      );
    }
  }, [isPublic, isLoading, isAuthenticated, hasAccess, estAdmin, router]);

  // Radix UI Dialog leaves pointer-events:none on body when unmounted during navigation.
  // Clean up on every route change.
  useEffect(() => {
    document.body.style.removeProperty('pointer-events');
  }, [pathname]);

  if (isPublic) return <>{children}</>;

  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" className="justify-self-center" />
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
          <Spinner size="lg" className="justify-self-center" />
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
          <Spinner size="lg" className="justify-self-center" />
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
