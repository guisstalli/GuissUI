import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { clientEnv } from '@/config/env';

const API_URL = clientEnv.API_URL;

/**
 * URL utilisee par CE serveur pour joindre l'API.
 *
 * `clientEnv.API_URL` est publique (`NEXT_PUBLIC_*`) : le navigateur s'en sert
 * aussi, c'est donc l'adresse EXTERNE. Un appel serveur-a-serveur qui l'emprunte
 * ressort par Traefik, qui ajoute un saut a `X-Forwarded-For` — Django lit alors
 * l'adresse de sortie de Next.js et journalisait la passerelle Docker pour
 * CHAQUE connexion.
 *
 * En passant par le reseau interne il n'y a plus de proxy intermediaire : la
 * chaine qu'on envoie arrive intacte. On y gagne aussi un aller-retour reseau.
 *
 * Repli sur l'URL publique si la variable n'est pas posee : le comportement
 * reste alors celui d'avant, degrade mais fonctionnel — jamais une panne
 * d'authentification.
 */
const API_URL_INTERNE = process.env.INTERNAL_API_URL || API_URL;

/**
 * IP reelle du client, extraite des en-tetes recus par CE serveur.
 *
 * Meme regle que `apps/core/request_ip.py` cote serveur : avec des proxys qui
 * *ajoutent* a la chaine, la seule entree non falsifiable est la DERNIERE,
 * celle qu'a observee le proxy de confiance. Prendre l'entree la plus a gauche
 * laisserait un client envoyer `X-Forwarded-For: 6.6.6.6` et signer ses
 * connexions sous une fausse adresse dans le journal de securite.
 */
function clientIpDepuisEnTetes(
  headers: Record<string, string> | undefined,
): string | null {
  if (!headers) return null;

  const xff = headers['x-forwarded-for'] ?? headers['X-Forwarded-For'];
  if (xff) {
    const adresses = xff
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (adresses.length > 0) return adresses[adresses.length - 1];
  }

  return headers['x-real-ip'] ?? null;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    // Egalement serveur-a-serveur : meme raison de passer par le reseau interne.
    const response = await fetch(`${API_URL_INTERNE}/auth/jwt/refresh/`, {
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
  } catch (error) {
    console.error('[auth] Token refresh failed:', error);
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const ipClient = clientIpDepuisEnTetes(req?.headers);

        const response = await fetch(`${API_URL_INTERNE}/auth/jwt/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // La requete part de CE serveur, pas du navigateur : sans cet
            // en-tete le journal de securite enregistrait la passerelle Docker
            // pour toute connexion, alors que les consultations d'examen —
            // qui vont du navigateur droit a l'API — portaient la vraie IP.
            // Deux origines incoherentes dans le meme journal.
            ...(ipClient ? { 'X-Forwarded-For': ipClient } : {}),
          },
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
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
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
      // Le refresh token reste dans le JWT httpOnly : ne jamais l'exposer
      // à la session lisible côté client (surface XSS).
      session.error = token.error as string | undefined;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Comparaison stricte d'origine : `startsWith` laisserait passer
      // https://app.example.com.evil.com (open redirect).
      try {
        const target = new URL(url, baseUrl);
        return target.origin === new URL(baseUrl).origin
          ? target.toString()
          : baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },

  pages: {
    signIn: '/auth/login',
  },
};
