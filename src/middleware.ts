import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

import { INTERNAL_APP_ROLES, ROLES } from '@/lib/authorization';

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

    if (!hasInternalRole) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
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
    '/((?!api/auth|auth|unauthorized|evenements|rendez-vous|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
