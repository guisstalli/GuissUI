'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { type ReactNode, useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { canAccessInternalApp } from '@/lib/authorization';

function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/evenements') ||
    pathname.startsWith('/rendez-vous')
  );
}

interface InternalAppGuardProps {
  children: ReactNode;
}

/**
 * Garde d'accès pour l'application interne
 * Vérifie que l'utilisateur a un rôle autorisé (STAFF, DOCTEUR, TECHNICIEN)
 * Redirige vers /unauthorized si l'utilisateur est ADMIN ou n'a pas de rôle autorisé
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

  const hasAccess = canAccessInternalApp(user);

  useEffect(() => {
    if (isPublic || isLoading || !isAuthenticated) return;
    if (!hasAccess) {
      router.replace(paths.unauthorized.getHref());
    }
  }, [isPublic, isLoading, isAuthenticated, hasAccess, router]);

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
