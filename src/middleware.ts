import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

import { INTERNAL_APP_ROLES, ROLES } from '@/lib/authorization';

// Rôles autorisés pour l'application interne
const ALLOWED_ROLES = INTERNAL_APP_ROLES;

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Check if token has expired or has refresh error
    if (token?.error === 'RefreshAccessTokenError') {
      // Redirect to Keycloak signin - NextAuth handles PKCE
      const signInUrl = new URL('/api/auth/signin/keycloak', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Vérifier les rôles de l'utilisateur
    const userRoles = (token?.roles as string[]) || [];

    // Si l'utilisateur est UNIQUEMENT admin (pas d'autre rôle interne), bloquer l'accès
    const hasInternalRole = userRoles.some((role) =>
      ALLOWED_ROLES.includes(role as (typeof ROLES)[keyof typeof ROLES]),
    );

    const isOnlyAdmin = userRoles.includes(ROLES.ADMIN) && !hasInternalRole;

    if (isOnlyAdmin) {
      // Rediriger les admins purs vers la page unauthorized
      const unauthorizedUrl = new URL('/unauthorized', req.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Si l'utilisateur n'a aucun rôle autorisé
    if (!hasInternalRole) {
      const unauthorizedUrl = new URL('/unauthorized', req.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      // Use NextAuth's provider-specific signin route - it handles PKCE automatically
      // This redirects directly to Keycloak without showing NextAuth's signin page
      signIn: '/api/auth/signin/keycloak',
    },
  },
);

// Protect all routes except public ones
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|unauthorized|maintenance).*)',
  ],
};
