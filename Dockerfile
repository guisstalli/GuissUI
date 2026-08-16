# =================================================================
# STAGE 1 : deps
# Installe les dependances — layer cache reutilisable si package.json
# ne change pas.
# =================================================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

# --frozen-lockfile : echec si yarn.lock ne correspond pas a package.json
RUN yarn install --frozen-lockfile

# =================================================================
# STAGE 2 : builder
# Compile le TypeScript et genere .next/standalone
# =================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Recuperer node_modules depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copier tout le code source
COPY . .

# Desactiver la telemetrie Next.js (donnees envoyees a Vercel)
ENV NEXT_TELEMETRY_DISABLED=1

# ----------------------------------------------------------------
# Variables NEXT_PUBLIC_* : integrees dans le bundle JS au build.
# Doivent exister ICI — pas seulement au runtime.
# ----------------------------------------------------------------
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL

# Mocking MSW desactive en production
ARG NEXT_PUBLIC_ENABLE_API_MOCKING=false
ENV NEXT_PUBLIC_ENABLE_API_MOCKING=$NEXT_PUBLIC_ENABLE_API_MOCKING

# ----------------------------------------------------------------
# Variables server-only : non baked dans le bundle client, mais
# env.ts les valide a l'import du module pendant `next build`.
# Les valeurs ci-dessous sont des placeholders de build uniquement ;
# les vraies valeurs sont injectees a l'execution du conteneur.
# ----------------------------------------------------------------
ARG NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_URL=$NEXTAUTH_URL

ARG NEXTAUTH_SECRET=build-time-placeholder-not-used-in-production
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

RUN yarn build

# =================================================================
# STAGE 3 : runner
# Image finale allégée — contient uniquement ce qui est necessaire
# pour faire tourner l'application en production.
# =================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Utilisateur non-root pour la securite
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les assets publics
COPY --from=builder /app/public ./public

# Copier le serveur standalone genere par output: 'standalone'
COPY --from=builder --chown=nextjs:nodejs \
     /app/.next/standalone ./

# Copier les assets statiques optimises (JS/CSS)
COPY --from=builder --chown=nextjs:nodejs \
     /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js = mini-serveur Node.js genere par output: 'standalone'
CMD ["node", "server.js"]
