# Stack technique — GuissUI

## Dépendances principales

| Package | Version | Rôle |
|---------|---------|------|
| Next.js | 14.2 | Framework (App Router) |
| React | 18.3 | UI |
| @tanstack/react-query | 5.32 | Données serveur, cache |
| react-hook-form | 7.51 | Formulaires |
| zod | 3.23 | Validation schémas |
| axios | 1.16 | Client HTTP |
| zustand | 4.5 | État UI global |
| shadcn/ui + Radix UI | — | Composants UI |
| Tailwind CSS | — | Styles |

## Tests

| Outil | Usage |
|-------|-------|
| Vitest | Runner de tests |
| Testing Library | Rendu composants + assertions |
| MSW | Mock API (jamais mocker fetch/axios directement) |
| Playwright | Tests E2E (`e2e/tests/`) |

```bash
yarn test            # mode watch
yarn test --run      # one-shot
npx tsc --noEmit     # vérification TypeScript
yarn lint
```

## Package manager

**yarn** obligatoire — `yarn.lock` présent. Ne jamais utiliser `npm`.

## Structure src/

```
src/
├── app/           # Routes App Router
├── components/    # UI partagés
│   └── ui/        # Primitives (Button, Dialog, Form…)
├── features/      # Modules fonctionnels (isolation stricte)
├── lib/           # api-client.ts, auth.tsx
├── stores/        # Zustand (notifications…)
├── types/         # Types partagés (api.ts…)
└── testing/       # MSW handlers, test-utils
```

## Règles d'import (ESLint enforced)

- Pas d'import cross-feature (`features/A` → `features/B`)
- Flux unidirectionnel : `shared → features → app`
- Pas de barrel files (`index.ts` qui réexporte tout)
