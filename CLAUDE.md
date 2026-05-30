# GuissUI — CLAUDE.md

Frontend de la plateforme Guiss-Talli. Next.js 14 App Router, architecture **Bulletproof React**.

@memory/stack.md

@memory/agents-skills.md

@memory/domain-rules.md

---

## Bulletproof React — règles d'architecture (OBLIGATOIRES)

### Structure feature

```text
src/features/<name>/
├── api/         # Hooks TanStack Query + fetchers
├── components/  # Composants scoped à cette feature
├── hooks/       # Hooks scoped à cette feature
├── types/       # Types + schémas Zod
└── utils/       # Utilitaires scoped
```

### Règles d'import (ESLint enforced)

- **Jamais** d'import cross-feature (`features/A` → `features/B`)
- Flux unidirectionnel : `shared → features → app`
- Pas de barrel files (`index.ts` qui réexporte tout)

### API layer

Un fichier par endpoint dans `src/features/<name>/api/`. Chaque fichier expose :

1. Le type de réponse (inféré de Zod ou déclaré)
2. La fonction fetcher (`api.get(...)`)
3. Le hook TanStack Query (`useQuery` / `useMutation`)

```typescript
export const usePatients = (options) =>
  useQuery({ queryKey: ['patients', options], queryFn: () => api.get('/patients/', { params: options }) });
```

### Formulaires

- Toujours `React Hook Form` + `zodResolver` + schéma Zod dans `types/schemas.ts`
- `phone_number` → `.optional().or(z.literal(''))` (jamais required)

### État

| Type            | Outil                     |
|-----------------|---------------------------|
| Données serveur | TanStack Query            |
| État UI local   | `useState` / `useReducer` |
| État UI global  | Zustand (`src/stores/`)   |
| URL / filtres   | `useSearchParams`         |

## Conventions de tests

- Fichiers co-localisés : `src/features/<name>/components/__tests__/`
- Priorité : Tests intégration > E2E > Unitaires
- MSW obligatoire pour mocker l'API (jamais mocker `fetch` / `axios` directement)
- Coverage minimum : **80% par feature**
