# Agents et Skills — GuissUI (Frontend)

## Agents disponibles

| Tâche | Agent |
|-------|-------|
| Architecture d'une nouvelle feature | `react-feature-architect` |
| Review code React / Next.js | `react-reviewer` |
| Tests Vitest + Testing Library + MSW | `react-tdd-assistant` |
| Gestion d'erreurs, error boundaries | `react-error-handler` |

## Skills disponibles

| Skill | Usage |
|-------|-------|
| `react-auth` | Auth frontend, JWT cookies, useUser |
| `react-new-feature` | Scaffolding feature Bulletproof React |
| `react-testing` | Tests Vitest / Testing Library / MSW |
| `frontend-design` | Design UI, composants shadcn |
| `frontend-patterns` | Patterns React : composition, state, API layer |
| `frontend-slides` | Génération de slides |

## Workflow recommandé

1. **Architecture** → `react-feature-architect` pour concevoir la feature (dossiers, interfaces, data flow)
2. **Implémentation** → selon le skill adapté (`react-new-feature`, `frontend-patterns`)
3. **Tests** → `react-tdd-assistant`
4. **Review** → `react-reviewer`
5. **Erreurs** → `react-error-handler` si la feature touche les erreurs API / toasts
