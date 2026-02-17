import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

import { INTERNAL_APP_ROLES, ROLES } from '@/lib/authorization';

const ALLOWED_ROLES = INTERNAL_APP_ROLES;

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Routes publiques - laisser passer
    if (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/unauthorized') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Si pas de token, withAuth redirigera automatiquement vers la page signin par défaut
    if (!token) {
      return NextResponse.next();
    }

    // Vérification des rôles
    const userRoles = (token.roles as string[]) || [];
    const hasInternalRole = userRoles.some((role) =>
      ALLOWED_ROLES.includes(role as (typeof ROLES)[keyof typeof ROLES]),
    );
    const isOnlyAdmin = userRoles.includes(ROLES.ADMIN) && !hasInternalRole;

    if (isOnlyAdmin || !hasInternalRole) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Laisser NextAuth gérer l'authentification par défaut
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
