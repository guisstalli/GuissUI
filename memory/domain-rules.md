# Règles métier critiques — GuissUI

Ces règles ont toutes causé des bugs silencieux ou des régressions. Les vérifier avant toute modification.

## phone_number — toujours optionnel dans les schémas Zod

```typescript
phone_number: z.string().min(8, 'Numéro invalide').optional().or(z.literal('')),
```

Ne jamais mettre `required` sur le label "Téléphone" dans les formulaires conducteur.

## DriverExperience — gérer `null`

Le backend retourne `200 + null` si aucune expérience n'existe encore.
Initialiser le formulaire avec des valeurs vides quand `data === null`.

## Patients — exclure les conducteurs

Toujours passer `is_driver: false` dans les queryParams de `usePatients()` sur la page liste patients.

```typescript
const queryParams = { ..., is_driver: false as const };
```

## Biomicroscopie — champs PRESENCE_LESION optionnels

- `BiomicroscopyAnteriorSchema` et `BiomicroscopyPosteriorSchema` : tous les champs détaillés en `optional().nullable()`
- `RequiredIndicator = () => null` dans les deux formulaires (anterior et posterior)
- Label : "Champs **optionnels** en cas de présence de lésion" (pas "obligatoires")

## Toast z-index — au-dessus des dialogs

Le conteneur toast doit avoir `z-[200]` (les dialogs shadcn utilisent `z-50`).

Fichier : `src/components/ui/notifications/notifications.tsx`

## Erreurs imbriquées DRF

`extractErrorMessage()` dans `src/types/api.ts` utilise `flattenFieldErrors()` récursif.
Il gère les erreurs comme `{patient: {phone_number: ['Ce champ est requis']}}`.
Ne jamais utiliser `String(value)` directement sur un objet d'erreurs.

## Boutons PDF adulte — guard correct

```tsx
{examId !== 'new' && (   // ✅ correct
{isComplete && (          // ❌ masque les boutons sur examens non finalisés
```

## Filtre site — examens adulte

`useSites()` vient de `src/features/sites/api/get-sites.ts`.
Afficher `site.libelle` comme label dans le `<Select>`.
Passer `site: Number(siteFilter)` dans queryParams si sélectionné.
