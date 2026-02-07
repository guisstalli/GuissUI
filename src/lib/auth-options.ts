import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

import { env } from '@/config/env';

// Extend the built-in types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    roles: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    roles?: string[];
    error?: string;
  }
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: env.KEYCLOAK_CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken,
        }),
      },
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

/**
 * Extract roles from Keycloak token
 */
function extractRoles(token: any): string[] {
  const roles: string[] = [];

  // Extract realm roles
  if (token?.realm_access?.roles) {
    roles.push(...token.realm_access.roles);
  }

  // Extract client-specific roles if needed
  if (token?.resource_access) {
    Object.values(token.resource_access).forEach((resource: any) => {
      if (resource?.roles) {
        roles.push(...resource.roles);
      }
    });
  }

  return roles;
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: env.KEYCLOAK_CLIENT_ID,
      // For public clients with PKCE, clientSecret can be empty
      clientSecret: env.KEYCLOAK_CLIENT_SECRET || '',
      issuer: env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      // Enable PKCE for public clients
      checks: ['pkce', 'state'],
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        // Decode the access token to extract roles
        const decodedToken = JSON.parse(
          Buffer.from(account.access_token!.split('.')[1], 'base64').toString(),
        );

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at! * 1000,
          roles: extractRoles(decodedToken),
          id: user.id,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as string | undefined;
      session.user = {
        ...session.user,
        id: token.sub as string,
        roles: (token.roles as string[]) || [],
      };
      return session;
    },
    // Redirect callback to handle sign-in redirects
    async redirect({ url, baseUrl }) {
      // If trying to go to the signin page, redirect directly to Keycloak
      if (url.includes('/api/auth/signin') || url.includes('/auth/signin')) {
        // Extract callback URL if present
        const urlObj = new URL(url, baseUrl);
        const callbackUrl = urlObj.searchParams.get('callbackUrl') || baseUrl;

        // Build Keycloak auth URL directly
        const keycloakAuthUrl = new URL(
          `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
        );
        keycloakAuthUrl.searchParams.set('client_id', env.KEYCLOAK_CLIENT_ID);
        keycloakAuthUrl.searchParams.set(
          'redirect_uri',
          `${baseUrl}/api/auth/callback/keycloak`,
        );
        keycloakAuthUrl.searchParams.set('response_type', 'code');
        keycloakAuthUrl.searchParams.set('scope', 'openid email profile');
        keycloakAuthUrl.searchParams.set(
          'state',
          encodeURIComponent(callbackUrl),
        );

        return keycloakAuthUrl.toString();
      }

      // If the url is relative, prepend the base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If the url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    // Page personnalisée qui redirige automatiquement vers Keycloak
    signIn: '/auth/signin',
    error: '/unauthorized',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signOut({ token }) {
      // Logout from Keycloak when signing out
      if (token?.refreshToken) {
        try {
          await fetch(`${env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: env.KEYCLOAK_CLIENT_ID,
              refresh_token: token.refreshToken as string,
            }),
          });
        } catch (error) {
          console.error('Error logging out from Keycloak:', error);
        }
      }
    },
  },
};
