import { jwtDecode } from 'jwt-decode';
import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

import { env } from '@/config/env';

function extractRoles(decoded: any): string[] {
  const roles: string[] = [];

  if (decoded?.realm_access?.roles) {
    roles.push(...decoded.realm_access.roles);
  }

  if (decoded?.resource_access) {
    Object.values(decoded.resource_access).forEach((resource: any) => {
      if (resource?.roles) {
        roles.push(...resource.roles);
      }
    });
  }

  return roles;
}

// CRITIQUE: Cookies non sécurisés en développement pour localhost HTTP
const useSecureCookies = process.env.NODE_ENV === 'production';
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',

  providers: [
    KeycloakProvider({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: '', // Public client = chaîne vide obligatoire
      issuer: env.KEYCLOAK_ISSUER,
      checks: ['pkce', 'state'],
      client: {
        token_endpoint_auth_method: 'none', // Force le mode public
      },
    }),
  ],

  // CRITIQUE: Configuration des cookies pour localhost (HTTP)
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
        secure: useSecureCookies,
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
        secure: useSecureCookies,
      },
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        try {
          const decoded: any = jwtDecode(account.access_token);
          token.roles = extractRoles(decoded);
        } catch (error) {
          console.error('Erreur décodage JWT:', error);
          token.roles = [];
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.roles = (token.roles as string[]) || [];
      }
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch {
        // URL invalide
      }
      return baseUrl;
    },
  },

  // Utiliser les pages par défaut de NextAuth
  // pages: {} - NextAuth utilisera /api/auth/signin avec le bouton Keycloak
};
