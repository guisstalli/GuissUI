import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

import {
  INTERNAL_APP_ROLES,
  ROLES,
  isAdminAreaPath,
} from '@/lib/authorization';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (!token) {
      return NextResponse.next();
    }

    const userRole = token.role as string | undefined;
    const hasInternalRole =
      userRole !== undefined &&
      INTERNAL_APP_ROLES.includes(
        userRole as (typeof ROLES)[keyof typeof ROLES],
      );

    if (hasInternalRole) {
      return NextResponse.next();
    }

    // ADMIN : rôle technique, exclu des écrans cliniques mais légitime dans
    // l'espace d'administration. Hors de cet espace on le renvoie vers SON
    // tableau de bord, pas vers /unauthorized : le compte est valide, seule la
    // destination ne l'est pas — et /unauthorized affirmait à tort « votre
    // compte n'a pas le rôle Administrateur ».
    if (userRole === ROLES.ADMIN) {
      return isAdminAreaPath(req.nextUrl.pathname)
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/administration', req.url));
    }

    return NextResponse.redirect(new URL('/unauthorized', req.url));
  },
  {
    pages: {
      signIn: '/auth/login',
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    '/((?!api/auth|auth|unauthorized|landing|public|evenements|rendez-vous|dossier|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
