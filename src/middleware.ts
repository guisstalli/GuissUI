import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

import {
  INTERNAL_APP_ROLES,
  ROLES,
  isAdminAreaPath,
} from '@/lib/authorization';
import { estHoteVitrine } from '@/lib/vitrine';

/**
 * Sur le domaine racine, `/` sert la vitrine au lieu du tableau de bord.
 *
 * `rewrite` et non `redirect` : l'URL affichée reste `guisstalli.com`, sans
 * `/landing` visible dans la barre d'adresse ni dans les liens partagés.
 *
 * Ce middleware ne traite QUE la racine. Le renvoi des autres chemins du
 * domaine racine vers `app.guisstalli.com` est fait par Traefik, et c'est
 * volontaire : le `matcher` ci-dessous exclut `/public`, `/auth` et les
 * autres chemins publics — précisément pour qu'ils échappent à
 * l'authentification. L'élargir pour y glisser une redirection ferait passer
 * les pages publiques par `withAuth` et enverrait les visiteurs vers l'écran
 * de connexion. Un routage par domaine se règle à la couche de routage.
 *
 * Pourquoi renvoyer plutôt que servir : `NEXT_PUBLIC_API_URL` est figé au
 * build sur `api.guisstalli.com`, donc le navigateur appelle l'API en
 * inter-origine. Le CORS n'autorise que `app.guisstalli.com` ; servir
 * `/public/rendez-vous` depuis le domaine racine donnerait une page qui
 * s'affiche et dont chaque appel échoue — une panne silencieuse, côté client.
 */
function reecrireVitrine(req: NextRequest) {
  if (!estHoteVitrine(req.headers.get('host'))) return null;
  if (req.nextUrl.pathname !== '/') return null;

  const url = req.nextUrl.clone();
  url.pathname = '/landing';
  return NextResponse.rewrite(url);
}

const withAuthMiddleware = withAuth(
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

export default function middleware(req: NextRequest) {
  // La vitrine passe AVANT l'authentification : sans cela, un visiteur non
  // connecté arrivant sur guisstalli.com serait envoyé vers /auth/login —
  // exactement ce que la page publique doit éviter.
  const vitrine = reecrireVitrine(req);
  if (vitrine) return vitrine;

  return (
    withAuthMiddleware as unknown as (
      r: NextRequest,
    ) => ReturnType<typeof NextResponse.next>
  )(req);
}

export const config = {
  matcher: [
    '/((?!api/auth|auth|unauthorized|landing|public|evenements|rendez-vous|dossier|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
