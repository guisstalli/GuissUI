import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { clientEnv } from '@/config/env';

const API_URL = clientEnv.API_URL;

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${API_URL}/auth/jwt/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return {
      ...token,
      accessToken: data.access,
      // Refresh token rotation: use new refresh if provided, keep old otherwise
      refreshToken: data.refresh ?? token.refreshToken,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const response = await fetch(`${API_URL}/auth/jwt/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();

        return {
          id: String(data.user.id),
          email: data.user.email,
          name:
            `${data.user.profile?.first_name ?? ''} ${data.user.profile?.last_name ?? ''}`.trim() ||
            data.user.email,
          role: data.user.role,
          accessToken: data.access,
          refreshToken: data.refresh,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
        token.expiresAt = Date.now() + 60 * 60 * 1000;
        return token;
      }

      if (Date.now() < (token.expiresAt as number) - 10_000) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as string | undefined;
      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  pages: {
    signIn: '/auth/login',
  },
};
