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

async function refreshAccessToken(token: any) {
  try {
    const url = `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.KEYCLOAK_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    let roles: string[] = [];
    try {
      const decoded: any = jwtDecode(refreshedTokens.access_token);
      roles = extractRoles(decoded);
    } catch (error) {
      console.error('Erreur décodage JWT lors du rafraîchissement:', error);
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      roles: roles.length > 0 ? roles : token.roles,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',

  providers: [
    KeycloakProvider({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: '',
      issuer: env.KEYCLOAK_ISSUER,
      authorization: {
        url: `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
        params: {
          scope: 'openid email profile',
          audience: 'guiss-depistage-api',
        },
      },
      token: {
        url: `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
        params: { audience: 'guiss-depistage-api' },
      },
      userinfo: `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
      client: {
        token_endpoint_auth_method: 'none',
      },
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, account }) {
      // Connexion initiale
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // account.expires_at est en secondes depuis l'epoch (fourni par Keycloak via OAuth2)
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 300 * 1000;

        try {
          const decoded: any = jwtDecode(account.access_token);
          token.roles = extractRoles(decoded);
          console.debug('[NextAuth] Token roles extracted:', token.roles);
        } catch (error) {
          console.error('[NextAuth] Erreur décodage JWT initial:', error);
          token.roles = [];
        }
        console.debug('[NextAuth] Session initiale établie pour:', token.sub);
        return token;
      }

      // Si le token n'a pas expiré, on le retourne directement
      // On anticipe de 10 secondes pour éviter que le token expire pendant la requête en cours
      if (Date.now() < (token.expiresAt as number) - 10000) {
        return token;
      }

      // Le token a expiré, on le rafraîchit
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.roles = (token.roles as string[]) || [];
      }
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      console.debug(
        '[NextAuth] Session renvoyée au client, token présent:',
        !!session.accessToken,
      );
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Loop protection - log for debug
      console.debug('[NextAuth] Redirecting to:', url, 'BaseURL:', baseUrl);
      if (url.includes('error=')) {
        console.warn('[NextAuth] Error in redirect URL:', url);
        return baseUrl;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  // pages: {
  //   // Redirige directement vers le flux Keycloak en contournant la page par défaut de NextAuth
  //   signIn: '/api/auth/signin/keycloak',
  // },
};
