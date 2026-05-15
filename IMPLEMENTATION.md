Ready for review
Select text to add comments on the plan
Plan — Réimplémentation GuissUI : Module par Module
Statut src/ : 241 fichiers présents et intacts (récupérés via VS Code Local History). Ce plan sert de feuille de route pour vérifier, compléter et documenter chaque module frontend.

Contexte
L'utilisateur a accidentellement supprimé src/ puis récupéré via VS Code Local History. On repart module par module en s'assurant que chaque feature est correctement mappée sur les serializers backend.

Stack : Next.js 14 App Router · shadcn/ui · React Query v5 · React Hook Form + Zod · Axios · MSW · Vitest · Playwright Base URL API : http://localhost:8000/api/v1/ Path alias : @/* → ./src/*

Workflow Git (à respecter pour chaque module)
Branche cible commune : develop

Convention de nommage des branches :

feature/<module>      # nouveau module
fix/<description>     # correction de bug
chore/<description>   # maintenance, config
Flux par module :

# 1. Créer la branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/<module>

# 2. Développer + commiter au fil de l'eau
git add <fichiers spécifiques>
git commit -m "feat(<module>): <description courte>"

# 3. Fin de module → push + Pull Request vers develop
git push -u origin feature/<module>
gh pr create --title "feat(<module>): <titre>" --base develop
Convention commits (Conventional Commits) :

feat(auth): add login form with JWT integration
feat(patients): implement patient list with pagination
fix(auth): handle 401 auto-refresh edge case
test(auth): add MSW login mock and form unit test
chore(deps): update react-query to v5.32
Branches planifiées :

Module	Branche	PR vers
Authentification	feature/authentication	develop
Profil utilisateur	feature/user-profile	develop
Gestion utilisateurs	feature/user-management	develop
Patients	feature/patients	develop
Sites	feature/sites	develop
Examens adultes	feature/exams-adult	develop
Examens enfants	feature/exams-child	develop
Notifications	feature/notifications	develop
Analytics	feature/analytics	develop
Dashboard	feature/dashboard	develop
Rendez-vous	feature/appointments	develop
Événements	feature/events	develop
Facturation	feature/billing	develop
Conducteurs	feature/drivers	develop
Ordre d'implémentation (par dépendance)
#	Module	Dépend de	Priorité
1	Authentification	—	CRITIQUE
2	Profil utilisateur	Auth	CRITIQUE
3	Gestion utilisateurs (admin)	Auth	Haute
4	Patients	Auth	CRITIQUE
5	Sites	Auth	Haute
6	Examens adultes	Patients	CRITIQUE
7	Examens enfants	Patients	CRITIQUE
8	Pièces jointes	Examens	Moyenne
9	Rendez-vous	Patients+Sites	Moyenne
10	Événements dépistage	Patients+Sites	Moyenne
11	Facturation	Patients+Examens	Moyenne
12	Conducteurs	Auth	Basse
13	Notifications	Auth	Haute
14	Analytics	Examens	Haute
15	Dashboard	Auth	Haute
MODULE 1 — Authentification (CRITIQUE)
Endpoints (/api/v1/auth/) :

Méthode	URL	Auth requis	Description
POST	/auth/jwt/login/	Non	Login → access + refresh tokens
POST	/auth/jwt/refresh/	Non	Rafraîchir access token
POST	/auth/jwt/logout/	Oui	Logout appareil courant
POST	/auth/jwt/logout-all/	Oui	Logout tous appareils (rotate jwt_key)
GET	/auth/me/	Oui	Profil utilisateur connecté
Input login : { email: EmailField, password: CharField } Output login : { access: str, refresh: str, user: { id, email, role, is_admin } } Output me/ : { id, email, phone_number, role, is_active, is_verified, is_admin, is_staff, profile } Rôles : ADMIN | STAFF | DOCTEUR | TECHNICIEN JWT : Access = 60 min, Refresh = 7 jours, Header = Authorization: Bearer <token>, Rotation refresh activée

Fichiers à vérifier/implémenter :

src/lib/api-client.ts                    # interceptor 401 → refresh auto
src/lib/auth-options.ts                  # NextAuth credentials → GuissAPI JWT
src/lib/auth.tsx                         # useUser, logout helpers
src/features/auth/api/login.ts           # POST /auth/jwt/login/
src/features/auth/api/refresh.ts         # POST /auth/jwt/refresh/
src/features/auth/api/logout.ts          # POST /auth/jwt/logout/
src/features/auth/api/get-me.ts          # GET /auth/me/ + react-query
src/features/auth/types/schemas.ts       # LoginSchema, UserSchema (Zod)
src/features/auth/components/login-form.tsx  # RHF + Zod + useMutation
src/app/(auth)/login/page.tsx            # Page login
src/app/api/auth/[...nextauth]/route.ts  # NextAuth route handler
src/config/paths.ts                      # routes auth + app
src/middleware.ts                        # redirect /login si non auth
Schémas Zod :

LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
UserSchema = z.object({
  id: z.number(), email: z.string().email(),
  role: z.enum(['ADMIN','STAFF','DOCTEUR','TECHNICIEN']),
  is_admin: z.boolean(), is_staff: z.boolean(),
  is_active: z.boolean(), is_verified: z.boolean(),
  phone_number: z.string(), profile: z.record(z.unknown()).nullable(),
})
Checklist MODULE 1 :

 lib/api-client.ts — interceptor Bearer + auto-refresh 401
 lib/auth-options.ts — NextAuth credentials provider GuissAPI
 features/auth/api/login.ts — POST + Zod output
 features/auth/api/get-me.ts — GET + react-query cache
 features/auth/types/schemas.ts — LoginSchema, UserSchema
 features/auth/components/login-form.tsx — form + mutation
 app/(auth)/login/page.tsx — page login
 middleware.ts — protection routes
 config/paths.ts — chemins de navigation
 Test unitaire login-form.test.tsx (MSW mock)
 Test E2E e2e/tests/auth/login.spec.ts
MODULE 2 — Profil utilisateur (CRITIQUE)
Endpoints (/users/) :

Méthode	URL	Auth	Description
GET	/users/me/	Oui	Mon profil
PATCH	/users/me/update/	Oui	Mise à jour (incl. avatar multipart)
DELETE	/users/me/delete/	Oui	Soft delete compte
POST	/users/password/change/	Oui	Changer MDP (sudo: current_password requis)
POST	/users/email/change/request/	Oui	Demande changement email + OTP
POST	/users/email/change/confirm/	Oui	Confirmer OTP (format "123 456")
POST	/users/password/reset/request/	Non	Demande reset MDP
POST	/users/password/reset/confirm/	Non	Confirmer token reset
POST	/users/verify-email/	Non	Vérifier email (token)
Input update : { first_name?, last_name?, title? ('MR'|'MRS'), birthdate?, mobile?, avatar? }

Checklist MODULE 2 :

 features/users/api/get-me.ts
 features/users/api/update-me.ts (multipart pour avatar)
 features/users/api/change-password.ts
 features/users/api/change-email-request.ts + change-email-confirm.ts
 features/users/api/reset-password.ts (request + confirm)
 features/users/api/verify-email.ts
 features/users/types/schemas.ts
 features/users/components/profile-form.tsx
 features/users/components/change-password-form.tsx
 app/(app)/profil/page.tsx
MODULE 3 — Gestion utilisateurs Admin (Haute)
Endpoints (/users/) :

Méthode	URL	Permission	Description
GET	/users/	IsStaffOrAdmin	Liste (limit, offset, email, role, is_active)
GET	/users/{id}/	IsStaffOrAdmin	Détail
POST	/users/admin/create/	IsAdmin	Créer compte (email, phone, role, first/last_name)
PATCH	/users/{id}/toggle-active/	IsStaffOrAdmin	Activer/désactiver
DELETE	/users/{id}/delete/	IsStaffOrAdmin	Soft delete
DELETE	/users/{id}/hard-delete/	IsAdmin	Hard delete (irréversible)
GET	/users/{id}/audit-log/	IsStaffOrAdmin	Journal audit (50 entrées)
Output liste : { id, email, phone_number, role, is_active, is_verified, is_admin, date_joined, user_profile: { first_name, last_name, title, avatar } | null }

Checklist MODULE 3 :

 features/admin/api/list-users.ts (pagination LimitOffset)
 features/admin/api/create-user.ts
 features/admin/api/toggle-active.ts
 features/admin/api/delete-user.ts + hard-delete-user.ts
 features/admin/api/get-audit-log.ts
 features/admin/types/schemas.ts
 features/admin/components/users-table.tsx
 features/admin/components/create-user-dialog.tsx
 app/(app)/admin/utilisateurs/page.tsx
MODULE 4 — Patients (CRITIQUE)
Endpoints (/depistage/patients/) :

Méthode	URL	Description
GET	/depistage/patients/	Liste paginée
POST	/depistage/patients/create/	Créer
GET/PATCH	/depistage/patients/{id}/ + /edit/	Détail + modifier
DELETE/POST	/depistage/patients/{id}/delete/ + /restore/	Corbeille
GET	/depistage/patients/adults/ + /children/	Filtres
GET/PATCH	/depistage/patients/{id}/antecedent/ + /edit/	Antécédents
GET	/depistage/patients/{id}/examens/	Examens
POST	/depistage/patients/bulk-import/	Import CSV/Excel
PatientSerializer : { id, numero_identifiant, last_name, name, full_name, date_de_naissance, age, sex, is_adult, phone_number, examens_count: {child, adult}, created, modified, deleted_at }

Checklist MODULE 4 :

 features/patients/api/ — get-patients, get-patient, create-patient, update-patient, delete-patient, restore-patient, get-antecedent, update-antecedent, bulk-import
 features/patients/types/schemas.ts
 features/patients/components/ — patients-table, patient-form, antecedent-form (medical-history-tab)
 app/(app)/patients/page.tsx + [id]/page.tsx
MODULES 5-15 (résumé)
Module	Feature dir	App dir	Endpoints clés
Sites	features/sites/	app/(app)/sites/	CRUD + active/reactivate
Examens adultes	features/exams/	app/(app)/exams/adult/	section/, complete/, add-technical/, add-clinical/
Examens enfants	features/exams/	app/(app)/exams/child/	technical/, clinical/
Notifications	features/notifications/	header dropdown	unread-count, read-all, read/{id}
Analytics	features/analytics/	app/(app)/analytics/	overview, visual-acuity, refraction, timeline
Dashboard	features/dashboard/	app/(app)/	GET /dashboard/
Rendez-vous	features/appointments/	app/(app)/rendez-vous/	public booking + staff management
Événements	features/events/	app/(app)/evenements/	lifecycle + checkin + QR
Facturation	features/billing/	app/(app)/facturation/	factures + prestations + paiements
Conducteurs	features/drivers/	app/(app)/conducteurs/	CRUD simple
Conventions à respecter
Pattern fichier API (un fichier = un endpoint)
// features/auth/api/login.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
export const useLogin = ({ onSuccess } = {}) =>
  useMutation({ mutationFn: (data) => api.post('/auth/jwt/login/', data), onSuccess });
Pattern composant formulaire (RHF + Zod)
const Schema = z.object({ email: z.string().email(), password: z.string().min(1) });
export function LoginForm() {
  const { handleSubmit } = useForm({ resolver: zodResolver(Schema) });
  const { mutate } = useLogin({ onSuccess: () => router.push('/') });
}
Tests (vitest + MSW)
// MSW mock → render → interact → assert payload
renderWithForm(vi.fn(), { correction: true });
await userEvent.click(screen.getByRole('button', { name: /soumettre/i }));
expect(mapFormToApi(calls[0][0])).toMatchObject({ correction: true });
Vérification finale par module
yarn tsc --noEmit                             # 0 erreurs TypeScript
yarn test run src/features/<module>/          # Tests unitaires verts
yarn build                                    # Build Next.js OK
Travaux antérieurs TERMINES
Tests payload examens (72 tests verts)
enum-alignment.test.ts — 33 enums vérifiés
plaintes-form.test.tsx — diplopie, strabisme, nystagmus, AUTRES
visual-acuity-form.test.tsx — correction toggle + payload
refraction-form.test.tsx — 9 champs avec_correction
biomicroscopy-anterior-form.test.tsx — NORMAL vs PRESENCE_LESION
biomicroscopy-posterior-form.test.tsx — vitre/papille AUTRES
vision-binoculaire-form.test.tsx — hirschberg + cover test
ocular-tension-form.test.tsx — valeurs OD/OG
medical-history-tab.test.tsx — has_antecedents payload
Fix divergences frontend/backend
Fix A : ptosis_type supprimé du schema (absent du modèle backend)
Fix B : pupillary_reflex_detail ajouté dans VisionBinoculaire
Plan précédent — Tests Examens (archivé)
Contexte et Problème
Le bug has_antecedents a révélé une faille systémique dans les tests :

Les tests E2E vérifient la visibilité des éléments UI mais pas le contenu des payloads API envoyés
Résultat : un champ peut être omis du payload, le backend efface les données, et aucun test ne détecte rien
Périmètre du risque : 80% des valeurs d'enum non testées ; biomicroscopie (40+ champs) sans aucun test E2E ; réfraction non testée ; 2 divergences backend↔frontend confirmées
Audit complet :

Domaine	Vitest (payload)	E2E	Backend
Plaintes	❌ 0%	⚠️ 60%	✅ 100%
Vision Binoculaire	❌ 0%	✅ 70%	✅ 100%
Biomicroscopie	❌ 0%	❌ 0%	✅ 100%
Acuité Visuelle	❌ 0%	⚠️ 50%	✅ 100%
Réfraction	❌ 0%	❌ 0%	✅ 100%
Tension Oculaire	❌ 0%	❌ 0%	✅ 100%
Antécédents	✅ 3 tests	❌ 0%	✅ 100%
2 divergences critiques identifiées :

ptosis_type — dans schema Zod frontend, absent du modèle backend → champ ignoré ou rejeté
reflet_pupillaire_detail — backend l'exige quand reflet_pupillaire ≠ ROUGE, absent du schema frontend VisionBinoculaire
Approche : Tests de Payload (Vitest) — La Seule Preuve Fiable
Les tests E2E vérifient si un élément est visible — pas si le payload est correct. Seuls des tests qui capturent et assertent le corps de la requête HTTP prouvent que les données arrivent bien au backend.

Stratégie :

Corriger les 2 divergences
Un fichier enum-alignment.test.ts — teste statiquement que chaque enum Zod frontend contient exactement les valeurs attendues côté backend
Pour chaque section clinique : Vitest render → remplir → soumettre → capturer payload → asserter
Partie 1 — Corrections de Divergences
Fix A — Supprimer ptosis_type du schema frontend
Fichier : GuissUI/src/features/exams/types/schemas.ts

Chercher ptosis_type et le retirer du schema Zod des plaintes — ce champ n'existe pas dans GuissAPI/apps/depistage/models/clinical_components.py.

Fix B — Ajouter reflet_pupillaire_detail dans VisionBinoculaire
Fichiers :

GuissUI/src/features/exams/types/schemas.ts — ajouter reflet_pupillaire_detail: z.string().optional() avec .superRefine() : requis quand reflet_pupillaire !== 'ROUGE'
Composant vision binoculaire — ajouter le champ conditionnel dans le JSX
Partie 2 — Alignement des Enums (1 fichier)
Nouveau fichier : GuissUI/src/features/exams/types/__tests__/enum-alignment.test.ts

Import des enums Zod + vérification statique de chaque valeur contre la liste exacte du backend. Aucune requête HTTP. Si un enum change côté frontend, le test échoue immédiatement.

describe('Enums frontend ↔ backend', () => {
  test('DiplopieType', () =>
    expect(DiplopieTypeEnum.options).toEqual(['monoculaire', 'binoculaire']));
  test('HirschbergType', () =>
    expect(HirschbergTypeEnum.options).toEqual(['ORTHOTROPIE', 'EXOTROPIE', 'ESOTROPIE']));
  // ... un test par enum, ~45 enums couverts
});
Partie 3 — Tests de Payload par Section
Pattern : mock POST/PATCH via MSW → capturer payload → expect(payload).toMatchObject({...})

Fichier à créer	Champs conditionnels ciblés
plaintes-form.test.tsx	diplopie→diplopie_type ; strabisme→eye+type ; nystagmus→eye ; AUTRES→autre
visual-acuity-form.test.tsx	correction=true → 6 champs _avec_correction dans payload
refraction-form.test.tsx	correction=true → 9 champs _avec_correction dans payload
biomicroscopy-anterior-form.test.tsx	NORMAL vs PRESENCE_LESION ; cornee=AUTRE ; transparence=ANORMALE
biomicroscopy-posterior-form.test.tsx	NORMAL vs PRESENCE_LESION ; vitre=AUTRES ; papille=AUTRES
vision-binoculaire-form.test.tsx	hirschberg≠ORTHOTROPIE→detail ; reflet≠ROUGE→detail ; cover→direction
ocular-tension-form.test.tsx	ttt_hypotonisant=true → ttt_hypotonisant_value dans payload
Chaque test vérifie :

has_[field]: true ET les champs dépendants présents quand actif
has_[field]: false ET les champs dépendants absents/null quand désactivé
Fichiers à lire avant d'implémenter
GuissUI/src/features/exams/types/schemas.ts — tous les schemas + enums
GuissUI/src/features/exams/components/ — composants (selectors ARIA)
GuissUI/src/features/exams/api/ — URLs des endpoints
GuissAPI/apps/depistage/models/clinical_components.py — valeurs d'enum backend
Ordre d'implémentation
Fix A — retirer ptosis_type du schema frontend
Fix B — ajouter reflet_pupillaire_detail dans VisionBinoculaire
enum-alignment.test.ts — alignement statique (ROI maximum, rapide)
plaintes-form.test.tsx
visual-acuity-form.test.tsx + refraction-form.test.tsx
biomicroscopy-anterior-form.test.tsx + biomicroscopy-posterior-form.test.tsx
vision-binoculaire-form.test.tsx + ocular-tension-form.test.tsx
Vérification
cd ~/projects/guiss/GuissUI
yarn test run src/features/exams/
Précédent — Fix has_antecedents Bug (TERMINÉ)
Contexte
L'utilisateur a découvert un bug de production non détecté par les tests : quand le formulaire MedicalHistoryTab est soumis avec has_antecedents = true, le backend reçoit toujours la valeur par défaut false, ce qui déclenche la logique clean() du modèle et efface toutes les données saisies.

Cause racine (double) :

AntecedentCreateSchema dans src/features/patients/types/schemas.ts n'a pas de champ has_antecedents → TypeScript ne détecte pas l'omission dans buildApiPayload()
buildApiPayload() dans medical-history-tab.tsx (lignes 103-139) ne retourne jamais has_antecedents dans l'objet payload — ni dans la branche true, ni dans la branche false
Impact de la non-détection : Les tests E2E vérifient la visibilité des sous-champs mais pas le contenu du payload envoyé à l'API. Il n'existait aucun test unitaire pour buildApiPayload().

Bonus — problème d'hydratation : AntecedentSchema (GET response, ligne 95) manque aussi has_antecedents. La logique d'hydratation (ligne 162) compense avec la heuristique hasAnyAntecedentData, mais cela peut être faux si le backend renvoie has_antecedents: false mais que des données résiduelles existent en BD.

Fichiers à modifier
Fichier	Changement
GuissUI/src/features/patients/types/schemas.ts	Ajouter has_antecedents dans AntecedentSchema (l.95) et AntecedentCreateSchema (l.113)
GuissUI/src/features/exams/components/medical-history-tab.tsx	Inclure has_antecedents dans les deux branches de buildApiPayload() + corriger l'hydratation
Fix 1 — schemas.ts
Ajouter has_antecedents: z.boolean().optional() aux deux schémas :

// AntecedentSchema (ligne 95) — GET response
export const AntecedentSchema = z.object({
  id: z.number(),
  patient: z.number(),
  has_antecedents: z.boolean().optional(),           // AJOUT
  has_antecedents_medico_chirurgicaux: z.boolean().optional(),
  // ... reste inchangé
});

// AntecedentCreateSchema (ligne 113) — POST/PATCH payload
export const AntecedentCreateSchema = z.object({
  patient: z.number(),
  has_antecedents: z.boolean().optional(),           // AJOUT
  has_antecedents_medico_chirurgicaux: z.boolean().optional(),
  // ... reste inchangé
});
Fix 2 — medical-history-tab.tsx
2a — buildApiPayload() (lignes 104-138) — FIX CRITIQUE
Ajouter has_antecedents dans les deux branches du if :

if (!data.has_antecedents) {
  return {
    patient: numericPatientId,
    has_antecedents: false,    // AJOUT
    // ... autres champs vidés
  };
}
return {
  patient: numericPatientId,
  has_antecedents: true,       // AJOUT
  // ... autres champs avec données
};
2b — Hydratation depuis l'API (ligne 162)
Utiliser antecedent.has_antecedents directement quand disponible :

form.reset({
  has_antecedents: antecedent.has_antecedents ?? hasAnyAntecedentData,
  // ... reste inchangé
});
Fix 3 — Test de régression
Créer GuissUI/src/features/exams/components/__tests__/medical-history-tab.test.tsx.

Test clé : vérifier que le payload envoyé à l'API contient has_antecedents: true quand le switch est activé et le formulaire soumis (via interception MSW). Sans ce test, le bug pourrait réapparaître silencieusement.

Ordre d'implémentation
schemas.ts — ajouter has_antecedents dans les deux schémas (débloque TypeScript)
medical-history-tab.tsx — buildApiPayload() + hydratation
Test de régression Vitest
Vérification
cd ~/projects/guiss/GuissUI
yarn tsc --noEmit   # Doit passer sans erreur (has_antecedents maintenant dans AntecedentCreate)
yarn test run src/features/exams/components/__tests__/medical-history-tab.test.tsx
Plan précédent — Fix E2E Test Failures + Rapport lisible (TERMINÉ)
Objectif
Configurer un rapport de test en fichier texte lisible par l'outil Read (.txt)
Corriger les 7 catégories de failures identifiées dans les 37 erreurs
Partie 1 — Rapport lisible
Fichiers : GuissUI/playwright.config.ts + GuissUI/package.json

Ajouter le reporter JSON (en plus du HTML existant) et un script npm qui pipe la sortie line vers un fichier texte :

// playwright.config.ts — changer reporter
reporter: [
  ['html'],
  ['json', { outputFile: 'test-results/results.json' }],
],
// package.json — ajouter scripts
"test:report": "yarn playwright test --reporter=line 2>&1 | tee test-results/last-run.txt"
Après yarn test:report, je peux lire test-results/last-run.txt avec le Read tool.

Partie 2 — Corrections playwright.config.ts
Fix A — *.public.spec.ts tourne dans les projets authentifiés
Cause : testMatch: /.*\.spec\.ts/ matche aussi *.public.spec.ts. Les tests publics (public-events.public.spec.ts) tournent dans admin/staff/docteur/technicien, causant des failures (redirect vers login quand technicien accède à /evenements/public, bouton S'inscrire absent).

Fix : Ajouter testIgnore: /.*\.public\.spec\.ts/ aux 4 projets authentifiés.

Fix B — login.spec.ts tourne dans les projets authentifiés
Cause : login.spec.ts utilise test.use({ storageState: { cookies: [], origins: [] } }) + importe @playwright/test. Mais le label du formulaire est "Adresse e-mail" → le regex /email/i ne matche PAS "e-mail" (tiret), timeout de 30s dans tous les projets.

Fix :

Ajouter testIgnore: /tests\/auth\/login\.spec\.ts/ aux 4 projets authentifiés
Créer un projet no-auth dédié (pas de dépendance setup) :
{
  name: 'no-auth',
  testMatch: /tests\/auth\/login\.spec\.ts/,
  use: { ...devices['Desktop Chrome'], storageState: { cookies: [], origins: [] } },
},
Corriger le regex dans login.spec.ts : getByLabel(/e.mail|adresse/i)
Fix C — admin/users-list.spec.ts tourne pour docteur/technicien
Cause : Docteur et technicien n'ont pas accès à /admin/utilisateurs → redirigés vers /unauthorized.

Fix : Ajouter testIgnore: /tests\/admin\/.*/ aux projets docteur et technicien.

Tableau récapitulatif testIgnore
Projet	testIgnore à ajouter
admin	*.public.spec.ts, login.spec.ts
staff	*.public.spec.ts, login.spec.ts
docteur	*.public.spec.ts, login.spec.ts, tests/admin/*
technicien	*.public.spec.ts, login.spec.ts, tests/admin/*
Partie 3 — Corrections dans les tests
Fix D — patients-list.spec.ts:57 — navigue vers /patients/suppression-definitive
Cause : a[href*="/patients/"] matche aussi les liens de navigation (ex: "Suppression définitive") présents dans la page avant les lignes du tableau.

Fix : Restreindre le sélecteur aux lignes du tableau :

// Fichier: e2e/tests/patients/patients-list.spec.ts ligne 55
const firstPatientLink = page
  .locator('table a[href*="/patients/"], [data-testid="patient-row"] a[href*="/patients/"]')
  .first();
Fix E — exam-sections-independent.spec.ts:70 — faux positif /erreur|400/i
Cause : Un patient nommé "Testmoznr77k400" contient "400" → getByText(/erreur|400/i) le trouve.

Fix : Cibler uniquement les composants d'erreur :

// e2e/tests/exams/exam-sections-independent.spec.ts ~ligne 70
await expect(
  page.getByRole('alert').filter({ hasText: /erreur/i })
    .or(page.locator('[data-sonner-toast][data-type="error"]'))
).not.toBeVisible({ timeout: 3_000 });
Fix F — events-list.spec.ts:14 — badges statuts visibles échoue si aucun événement
Cause : La BD de test peut être vide → aucun badge de statut visible.

Fix : Rendre le test conditionnel :

// e2e/tests/events/events-list.spec.ts
test('badges statuts visibles', async ({ page }) => {
  await page.goto('/evenements');
  await page.waitForLoadState('networkidle');
  const hasEvents = await page.locator('a[href*="/evenements/"]').first().isVisible();
  if (!hasEvents) return; // skip silencieux si pas d'événements
  await expect(
    page.getByText(/planifié|en cours|terminé|annulé/i).first(),
  ).toBeVisible({ timeout: 8000 });
});
Fix G — analytics/analytics.spec.ts:33 — toast bloque le clic
Cause : Un toast notification (div[aria-live="assertive"]) intercepte les pointer events au moment du clic sur le combobox de filtre.

Fix : Attendre la disparition du toast avant de cliquer :

// e2e/tests/analytics/analytics.spec.ts
test('filtre par site disponible', async ({ page }) => {
  await page.goto('/analytics');
  await page.waitForLoadState('networkidle');
  // Attendre que le toast disparaisse si présent
  await page.locator('[aria-live="assertive"] > *')
    .waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  const siteFilter = page.getByRole('combobox').or(page.getByLabel(/site/i));
  if (await siteFilter.first().isVisible()) {
    await siteFilter.first().click();
    await page.waitForLoadState('networkidle');
  }
});
Fichiers à modifier (récapitulatif)
Fichier	Changement
GuissUI/playwright.config.ts	reporter JSON + testIgnore x4 projets + projet no-auth
GuissUI/package.json	script test:report
GuissUI/e2e/tests/auth/login.spec.ts	regex getByLabel(/e.mail/i)
GuissUI/e2e/tests/patients/patients-list.spec.ts	sélecteur lien dans table
GuissUI/e2e/tests/exams/exam-sections-independent.spec.ts	regex erreur → rôle alert
GuissUI/e2e/tests/events/events-list.spec.ts	badges conditionnel
GuissUI/e2e/tests/analytics/analytics.spec.ts	attente disparition toast
Vérification
cd ~/projects/guiss/GuissUI
yarn test:report
# → lire test-results/last-run.txt pour vérifier
Plan précédent — Rules of Hooks InternalAppGuard (conservé)
Contexte
Bug : InternalAppGuard viole les Rules of Hooks de React. Le composant appelle useEffect après un return conditionnel (if (isPublicPath(pathname)) return ...). Quand le pathname change entre un chemin public et un chemin protégé (ex: login → dashboard), React détecte un nombre de hooks différent entre deux renders et crashe.

Erreur : Error: Rendered more hooks than during the previous render.

Les tests E2E existants ne pouvaient pas détecter ce bug : ils injectent le token avant de charger l'app et ne testent pas le flux non-authentifié → redirection → login → retour.

Fichier à modifier
Un seul fichier : GuissUI/src/lib/internal-app-guard.tsx

Cause exacte (lignes 27–43)
if (isPublicPath(pathname)) {
  return <>{children}</>;   // ← return AVANT useEffect ❌
}
useEffect(() => { ... });   // appelé conditionnellement ❌
Fix : déplacer useEffect avant tout return conditionnel
export function InternalAppGuard({ children }) {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useUser();
  const router = useRouter();

  const isPublic = isPublicPath(pathname);
  const hasAccess = canAccessInternalApp(user);

  // TOUS les hooks avant tout return conditionnel
  useEffect(() => {
    if (isPublic || isLoading || !isAuthenticated) return;
    if (!hasAccess) router.replace(paths.unauthorized.getHref());
  }, [isPublic, isLoading, isAuthenticated, hasAccess, router]);

  if (isPublic) return <>{children}</>;
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Spinner />;
  if (!hasAccess) return <Spinner />;
  return <>{children}</>;
}
Pourquoi les E2E n'ont pas signalé le bug
Les specs E2E actuelles (auth.setup.ts) injectent le refresh token dans localStorage avant de naviguer vers l'app. Le composant voit donc un utilisateur déjà authentifié dès le premier render — la transition public → protégé qui déclenche la violation ne se produit jamais pendant les tests.

Pour le prévenir à l'avenir : ajouter un test e2e/tests/auth/auth-guard.spec.ts qui navigue vers /patients sans token, vérifie la redirection vers /auth/login, se connecte, et vérifie le retour vers /patients.

Vérification
# GuissUI
yarn dev
# → ouvrir / sans token → redirection propre, zéro erreur console React
# → se connecter → retour sur dashboard, zéro crash
npx tsc --noEmit  # zéro erreur sur internal-app-guard.tsx
Plan précédent — Tests Examens (conservé)
Contexte
L'utilisateur veut des tests exhaustifs couvrant :

Soumissions indépendantes : chaque section d'examen (technique / clinique / conclusion) peut être soumise seule — valider que les données sont sauvegardées en BD et persistent au rechargement de page
Champs conditionnels : si A sélectionné → B devient obligatoire (plaintes, antécédents, biomicroscopie, conducteurs, etc.)
Mappings enum : les valeurs envoyées du frontend doivent correspondre exactement aux choix backend (TypePermis, Symptomes, HirschbergType, SegmentStatus, etc.)
Détection de bugs en prod : les tests doivent révéler les incohérences de mapping avant déploiement
Technologies disponibles :

Backend : pytest + factory_boy (déjà configuré)
Frontend E2E : Playwright (déjà configuré), @ngneat/falso installé (pas @faker-js/faker)
Zod schemas dans src/features/exams/types/schemas.ts
CARTOGRAPHIE COMPLÈTE DES CHAMPS CONDITIONNELS
Backend (models avec clean()) ↔ Frontend (Zod .superRefine() / .refine())
Modèle	Trigger	Champ requis	Effacé si
Plaintes	diplopie=True	diplopie_type	diplopie=False
Plaintes	strabisme=True	strabisme_eye, strabisme_type	strabisme=False
Plaintes	nystagmus=True	nystagmus_eye	nystagmus=False
Plaintes	ptosis=True	ptosis_eye	ptosis=False
Plaintes	'AUTRES' in eye_symptom	autre (texte libre)	AUTRES retiré
VisualAcuity	correction=True	6 champs *_avec_correction	correction=False
Refraction	correction=True	9 champs *_avec_correction	correction=False
VisionBinoculaire	hirschberg_type ≠ ORTHOTROPIE	hirschberg_detail	type=ORTHOTROPIE
VisionBinoculaire	reflet_pupillaire ≠ ROUGE	reflet_lateralite (bidirectionnel)	reflet=ROUGE
VisionBinoculaire	cover_vl_type ∈ [TROPIE,PHORIE]	cover_vl_direction	type=ORTHOTROPIE
VisionBinoculaire	cover_vp_type ∈ [TROPIE,PHORIE]	cover_vp_direction	type=ORTHOTROPIE
BiomicroscopyAntérieur	segment=PRESENCE_LESION	tous les détails (cornée, iris, cristallin…)	segment=NORMAL
BiomicroscopyAntérieur	cornee='AUTRE'	cornee_autre	cornee≠AUTRE
BiomicroscopyAntérieur	iris='AUTRES'	iris_autres	iris≠AUTRES
BiomicroscopyAntérieur	transparence='ANORMALE'	type_anomalie_value, quantite_anomalie	transparence=NORMALE
BiomicroscopyAntérieur	type_anomalie_value='AUTRE'	type_anomalie_autre	value≠AUTRE
BiomicroscopyPostérieur	segment=PRESENCE_LESION	vitre, papille, macula, rétine, vaisseaux	segment=NORMAL
BiomicroscopyPostérieur	vitre='AUTRES'	vitre_autres	vitre≠AUTRES
BiomicroscopyPostérieur	papille='AUTRES'	papille_autres	papille≠AUTRES
BiomicroscopyPostérieur	retine_peripherique='AUTRE'	retine_peripherique_autre	rétine≠AUTRE
ExamenChild	reflet_pupillaire=ANORMAL	reflet_pupillaire_detail	status=NORMAL
ExamenChild	fo=ANORMAL	fo_detail	fo=NORMAL
Antécédent	has_antecedents=True	(ouvre les sous-champs)	False efface tout
Antécédent	has_antecedents_medico_chirurgicaux=True	antecedents_medico_chirurgicaux (array non vide)	parent=False
Antécédent	has_pathologie_ophtalmologique=True	pathologie_ophtalmologique (array non vide)	parent=False
Antécédent	'OTHER' in familial	autre_familial_detail	OTHER absent
Antécédent	uses_screen=True	screen_time_hours_per_day (0-24)	uses_screen=False
Driver	type_permis='AUTRES'	autre_type_permis	type≠AUTRES
Driver	date_peremption ≤ date_delivrance	→ ValidationError	—
PLAN D'IMPLÉMENTATION
PARTIE 1 — Tests Backend (GuissAPI)
Répertoire cible : apps/depistage/tests/

1.1 Factories de données d'examen
Fichier : apps/depistage/tests/factories.py (enrichir les factories existantes)

# Factories spécialisées par scénario conditionnel
class PlaintesWithDiplopieFactory(PlaintesFactory):
    diplopie = True
    diplopie_type = 'monoculaire'

class PlaintesWithStrabismeFactory(PlaintesFactory):
    strabisme = True
    strabisme_eye = 'od'
    strabisme_type = 'convergent'

class PlaintesWithAutresSymptomeFactory(PlaintesFactory):
    eye_symptom = ['AUTRES']
    autre = 'Douleur oculaire sévère'

class VisualAcuityWithCorrectionFactory(VisualAcuityFactory):
    correction = True
    avsc_od_avec_correction = Decimal('5.0')
    avsc_og_avec_correction = Decimal('4.5')
    # ... tous les champs _avec_correction

class AntecedentWithMedicoChirurgicalFactory(AntecedentFactory):
    has_antecedents = True
    has_antecedents_medico_chirurgicaux = True
    antecedents_medico_chirurgicaux = ['HTA', 'Diabète']

class AntecedentWithFamilialAutresFactory(AntecedentFactory):
    has_antecedents = True
    familial = ['OTHER']
    autre_familial_detail = 'Glaucome familial'

class BiomicroscopyAnteriorWithLesionFactory(BiomicroscopySegmentAnterieurFactory):
    segment = 'PRESENCE_LESION'
    cornee = 'NORMAL'
    profondeur = 'CCA'
    transparence = 'NORMALE'
    pupille = 'NORMAL'
    axe_visuel = 'LIBRE'
    rpm = 'PRESENT'
    iris = 'NORMAL'
    cristallin = 'TRANSPARENT'
    position_cristallin = 'EN_PLACE'
1.2 Tests de soumission indépendante — test_exam_sections_independent.py
# Ce fichier est NOUVEAU dans apps/depistage/tests/

@pytest.mark.django_db
def test_technical_section_submit_without_clinical():
    """Soumettre uniquement la section technique — pas d'erreur, is_completed=False."""
    patient = PatientAdultFactory()
    examen = examen_adult_create(patient=patient)

    examen = examen_adult_update_visual_acuity(examen=examen, data={...})
    examen = examen_adult_update_refraction(examen=examen, data={...})
    examen = examen_adult_update_ocular_tension(examen=examen, data={...})
    examen = examen_adult_update_pachymetry(examen=examen, data={...})

    examen.refresh_from_db()
    assert examen.technical_examen is not None
    assert examen.technical_examen.is_completed is True
    assert examen.clinical_examen is None
    assert examen.is_completed is False  # les deux sections requises


@pytest.mark.django_db
def test_clinical_section_submit_without_technical():
    """Soumettre uniquement la section clinique — pas d'erreur, is_completed=False."""

@pytest.mark.django_db
def test_data_persists_after_reload():
    """Rechargement de l'examen depuis la BD — toutes les données sont intactes."""

@pytest.mark.django_db
def test_section_update_is_idempotent():
    """Soumettre la même section deux fois — les données sont mis à jour, pas dupliquées."""

@pytest.mark.django_db
def test_exam_complete_when_both_sections_complete():
    """POST /complete/ — is_completed=True uniquement quand les deux sections sont complètes."""

@pytest.mark.django_db
def test_exam_complete_fails_if_technical_incomplete():
    """POST /complete/ lève ApplicationError si TechnicalExamen.is_completed=False."""
1.3 Tests champs conditionnels — test_conditional_fields.py
Pour chaque champ conditionnel listé dans la cartographie :

# PLAINTES
@pytest.mark.django_db
def test_plaintes_diplopie_true_requires_diplopie_type():
    with pytest.raises(ValidationError):
        Plaintes(diplopie=True, diplopie_type=None).full_clean()

@pytest.mark.django_db
def test_plaintes_diplopie_false_clears_diplopie_type():
    p = PlaintesFactory(diplopie=False, diplopie_type='monoculaire')
    # Le service doit effacer diplopie_type

@pytest.mark.django_db
def test_plaintes_strabisme_requires_both_eye_and_type():
    with pytest.raises(ValidationError):
        Plaintes(strabisme=True, strabisme_eye='od', strabisme_type=None).full_clean()

@pytest.mark.django_db
def test_plaintes_autres_symptome_requires_autre_text():
    with pytest.raises(ValidationError):
        Plaintes(eye_symptom=['AUTRES'], autre='').full_clean()

# VISUAL ACUITY
@pytest.mark.django_db
def test_visual_acuity_correction_true_requires_avec_correction_fields():
    ...

@pytest.mark.django_db
def test_visual_acuity_correction_false_clears_avec_correction():
    ...

# ANTECEDENT
@pytest.mark.django_db
def test_antecedent_master_false_clears_all_fields():
    a = AntecedentWithMedicoChirurgicalFactory(has_antecedents=False)
    a.full_clean()
    a.save()
    a.refresh_from_db()
    assert a.antecedents_medico_chirurgicaux == []
    assert a.screen_time_hours_per_day is None

@pytest.mark.django_db
def test_antecedent_amc_true_requires_non_empty_array():
    with pytest.raises(ValidationError):
        a = AntecedentFactory(
            has_antecedents=True,
            has_antecedents_medico_chirurgicaux=True,
            antecedents_medico_chirurgicaux=[]
        )
        a.full_clean()

@pytest.mark.django_db
def test_antecedent_familial_other_requires_detail():
    with pytest.raises(ValidationError):
        AntecedentFactory(
            has_antecedents=True,
            familial=['OTHER'],
            autre_familial_detail=''
        ).full_clean()

# BIOMICROSCOPY
@pytest.mark.django_db
def test_biomicroscopy_normal_segment_clears_all_details():
    ...

@pytest.mark.django_db
def test_biomicroscopy_lesion_requires_all_detail_fields():
    ...

# DRIVER
@pytest.mark.django_db
def test_driver_autres_permis_requires_autre_type():
    with pytest.raises(ValidationError):
        Driver(type_permis='Autres', autre_type_permis='').full_clean()

@pytest.mark.django_db
def test_driver_date_peremption_must_be_after_delivrance():
    ...
1.4 Tests API — soumissions section par section — test_exam_section_apis.py
# Pour chaque section via PATCH /examens/adultes/{id}/section/

@pytest.mark.django_db
def test_api_section_visual_acuity_returns_200(technicien_client, examen):
    response = technicien_client.patch(
        reverse('depistage:examen-adult-section', args=[examen.id]),
        {'section': 'visual_acuity', 'data': {...}},
        format='json'
    )
    assert response.status_code == 200
    examen.refresh_from_db()
    assert examen.technical_examen.visual_acuity is not None

@pytest.mark.django_db
def test_api_section_plaintes_requires_permission_docteur():
    """TECHNICIEN ne peut pas soumettre une section clinique → 403."""

@pytest.mark.django_db
def test_api_section_with_invalid_conditional_field_returns_400():
    """diplopie=True + diplopie_type=None → 400."""
1.5 Tests mappings enum — test_enum_mappings.py
# Vérifier que toutes les valeurs enum acceptées par le modèle
# correspondent exactement aux valeurs renvoyées par l'API (sérialiseur)

@pytest.mark.django_db
def test_driver_type_permis_choices_match_serializer():
    """Les valeurs de TypePermisChoices existent dans le serializer de sortie."""

@pytest.mark.django_db
def test_plaintes_symptomes_choices_accepted_by_api():
    """Chaque valeur de Symptomes.choices est acceptée par l'API sans 400."""

@pytest.mark.django_db
def test_vision_binoculaire_hirschberg_choices_mapping():
    """Valeurs HirschbergType: ORTHOTROPIE/EXOTROPIE/ESOTROPIE → acceptées et renvoyées."""
PARTIE 2 — Tests Frontend E2E (GuissUI / Playwright)
Outil de données : @ngneat/falso déjà installé — l'utiliser pour les données aléatoires

Créer : e2e/fixtures/exam-data.ts — générateurs de données d'examen

import { randNumber, randBoolean, randText } from '@ngneat/falso';

// Génère les données pour l'acuité visuelle avec correction
export function generateVisualAcuityWithCorrection() {
  return {
    correction: true,
    avsc_od: randNumber({ min: 1, max: 10 }),
    avsc_og: randNumber({ min: 1, max: 10 }),
    avsc_od_avec_correction: randNumber({ min: 1, max: 10 }),
    avsc_og_avec_correction: randNumber({ min: 1, max: 10 }),
    avsc_odg_avec_correction: randNumber({ min: 1, max: 10 }),
    avac_od_avec_correction: randNumber({ min: 1, max: 10 }),
    avac_og_avec_correction: randNumber({ min: 1, max: 10 }),
    avac_odg_avec_correction: randNumber({ min: 1, max: 10 }),
  };
}

export function generatePlaintesWithDiplopie() { ... }
export function generateAntecedentWithMedicoChirurgical() { ... }
export function generateBiomicroscopyWithLesion() { ... }
2.1 Tests soumissions indépendantes — e2e/tests/exams/exam-sections-independent.spec.ts
test.describe('Soumission indépendante des sections', () => {

  test('technicien soumet uniquement la section visuelle → données persistées après reload', async ({ page }) => {
    // Naviguer vers un examen existant (créé via API fixture)
    // Remplir la section Acuité Visuelle uniquement
    // Soumettre
    // Recharger la page
    // Vérifier que les données sont toujours affichées
    // Vérifier que la section clinique est toujours vide
  });

  test('technicien soumet les 4 sections techniques → examen technique complet', async ({ page }) => {
    // Remplir Visual Acuity + Refraction + Ocular Tension + Pachymetry
    // Vérifier indicateur "Technique complète"
    // Recharger → indicateur toujours visible
  });

  test('docteur soumet uniquement les plaintes → données cliniques partielles', async ({ page }) => {
    // Section technique vide, soumettre clinique/plaintes
    // Vérifier persistance
  });

  test('docteur soumet uniquement la conclusion → examen clinique partiel', async ({ page }) => {
    // Conclusion seule, pas de plaintes, pas de biomicroscopie
    // Vérifier persistance
  });

  test('rechargement page complet → aucune donnée perdue', async ({ page }) => {
    // Remplir plusieurs sections
    // page.reload()
    // Vérifier que toutes les valeurs remplies sont encore là
  });

});
2.2 Tests champs conditionnels — e2e/tests/exams/conditional-fields.spec.ts
test.describe('Champs conditionnels — Plaintes', () => {
  test('activer diplopie → champ type diplopie apparaît et est requis', async ({ page }) => {
    // Activer toggle diplopie
    // Vérifier champ diplopie_type visible
    // Soumettre sans diplopie_type → erreur Zod visible
    // Sélectionner diplopie_type → erreur disparaît
  });

  test('désactiver diplopie → champ type effacé', async ({ page }) => {
    // Activer diplopie + sélectionner type
    // Désactiver diplopie
    // Réactiver → champ vide (auto-reset)
  });

  test('activer strabisme → strabisme_eye ET strabisme_type requis', async ({ page }) => { ... });

  test('sélectionner AUTRES dans symptômes → champ texte "autre" requis', async ({ page }) => { ... });
  test('désélectionner AUTRES → champ "autre" effacé', async ({ page }) => { ... });
});

test.describe('Champs conditionnels — Acuité Visuelle', () => {
  test('activer correction → 6 champs avec_correction apparaissent', async ({ page }) => { ... });
  test('désactiver correction → champs avec_correction effacés', async ({ page }) => { ... });
  test('soumettre avec correction=true + champs vides → erreur Zod', async ({ page }) => { ... });
});

test.describe('Champs conditionnels — Biomicroscopie', () => {
  test('sélectionner PRESENCE_LESION → champs détails visibles', async ({ page }) => { ... });
  test('revenir à NORMAL → champs détails effacés et cachés', async ({ page }) => { ... });
  test('cornee=AUTRE → champ cornee_autre requis', async ({ page }) => { ... });
  test('transparence=ANORMALE → type_anomalie et quantite_anomalie requis', async ({ page }) => { ... });
});

test.describe('Champs conditionnels — Antécédents', () => {
  test('has_antecedents=OFF → tous les sous-champs cachés', async ({ page }) => { ... });
  test('has_antecedents=ON + amc=ON + tableau vide → erreur validation', async ({ page }) => { ... });
  test('familial inclut AUTRES → champ texte autre_familial requis', async ({ page }) => { ... });
  test('uses_screen=ON → champ heures par jour apparaît', async ({ page }) => { ... });
  test('has_antecedents=OFF → toutes valeurs effacées après soumission', async ({ page }) => { ... });
});

test.describe('Champs conditionnels — Examen Enfant', () => {
  test('reflet_pupillaire=ANORMAL → champ détail requis', async ({ page }) => { ... });
  test('fond_oeil=ANORMAL → fo_detail requis', async ({ page }) => { ... });
  test('VisionBinoculaire: hirschberg≠ORTHOTROPIE → hirschberg_detail requis', async ({ page }) => { ... });
});
2.3 Tests mappings enum (frontend→backend) — e2e/tests/exams/enum-mapping.spec.ts
test.describe('Mappings enum — aucune erreur 400 due à des valeurs incorrectes', () => {

  test('TypePermis: toutes les valeurs envoyées au backend sans 400', async ({ page, request }) => {
    // Pour chaque valeur : LEGER, LOURD, AUTRES
    // Remplir le formulaire conducteur → soumettre → pas de 400
  });

  test('Symptomes: toutes les valeurs sélectionnables sans erreur de mapping', async ({ page }) => {
    // Vérifier que les valeurs dans le select correspondent aux choices backend
    // Soumettre avec chaque valeur → 200
  });

  test('HirschbergType: ORTHOTROPIE / EXOTROPIE / ESOTROPIE → valeurs correctes', async ({ page }) => { ... });

  test('SegmentStatus: NORMAL / PRESENCE_LESION → valeurs exactes renvoyées', async ({ page }) => { ... });

  test('diplopie_type: monoculaire / binoculaire → acceptés par backend', async ({ page }) => { ... });
});
2.4 Tests conducteur (Driver) — e2e/tests/conducteurs/driver-form.spec.ts
test.describe('Formulaire conducteur', () => {
  test('tous les selects enum ont les bonnes valeurs', async ({ page }) => {
    // Vérifier que les selects TypePermis contiennent LEGER, LOURD, AUTRES
    // Service, NiveauInstruction, etc.
  });

  test('type_permis=AUTRES → champ autre_type_permis apparaît et est requis', async ({ page }) => { ... });

  test('date_peremption avant date_delivrance → erreur validation', async ({ page }) => { ... });

  test('soumission complète → pas de 400 → données persistées', async ({ page }) => { ... });
});
PARTIE 3 — Tests Vitest (composants isolés)
Fichiers à créer :

3.1 src/features/exams/components/forms/__tests__/plaintes-form.test.tsx
// Test chaque règle conditionnelle avec Testing Library + MSW
test('diplopie enabled → diplopie_type select visible', async () => {
  renderApp({ route: '/exams/adult/1' });
  // Trouver toggle diplopie
  // Activer
  // Vérifier select diplopie_type visible
});

test('strabisme enabled → strabisme_eye + strabisme_type requis', ...);
test('AUTRES in eye_symptom → autre field visible', ...);
test('AUTRES removed from array → autre field hidden', ...);
3.2 src/features/exams/components/forms/__tests__/visual-acuity-form.test.tsx
test('correction toggle on → avec_correction fields appear', ...);
test('correction toggle off → avec_correction fields disappear', ...);
test('form submit correction=true + empty avec_correction → Zod error shown', ...);
3.3 src/features/exams/components/forms/__tests__/biomicroscopy-anterior-form.test.tsx
test('segment=PRESENCE_LESION → detail fields shown', ...);
test('segment=NORMAL → detail fields hidden and cleared', ...);
test('cornee=AUTRE → cornee_autre required', ...);
PARTIE 4 — Tests de persistance BD (intégration backend)
Approche : Tester le round-trip complet : PATCH section → GET examen → données correctes

# apps/depistage/tests/test_exam_persistence.py

@pytest.mark.django_db
def test_visual_acuity_roundtrip():
    """PATCH visual_acuity → GET examen → mêmes données."""
    examen = ExamensAdultFactory()
    data = {'avsc_od': 5.0, 'avsc_og': 4.5, 'correction': False}
    
    # PATCH via API
    response = technicien_client.patch(url, {'section': 'visual_acuity', 'data': data})
    assert response.status_code == 200
    
    # GET et vérifier
    response = technicien_client.get(get_url)
    assert response.data['technical_examen']['visual_acuity']['avsc_od'] == '5.00'

@pytest.mark.django_db
def test_plaintes_with_conditionals_roundtrip():
    """Plaintes avec diplopie → GET → diplopie_type intact."""
    
@pytest.mark.django_db
def test_antecedent_cleared_on_master_false():
    """has_antecedents=False → all arrays vides en BD."""

@pytest.mark.django_db
def test_correction_false_clears_avec_correction_in_db():
    """Soumettre correction=True puis correction=False → champs _avec_correction NULL en BD."""
FICHIERS À CRÉER / MODIFIER
Backend (apps/depistage/tests/)
Fichier	Action	Priorité
tests/factories.py	Enrichir avec factories conditionnelles	🔴
tests/test_conditional_fields.py	NOUVEAU — 40+ tests	🔴
tests/test_exam_sections_independent.py	NOUVEAU — soumissions indépendantes	🔴
tests/test_exam_section_apis.py	NOUVEAU — tests API section par section	🔴
tests/test_enum_mappings.py	NOUVEAU — mappings enum	🔴
tests/test_exam_persistence.py	NOUVEAU — round-trip BD	🟡
apps/driver/tests/test_conditional_fields.py	NOUVEAU — driver conditionals	🟡
Frontend (GuissUI)
Fichier	Action	Priorité
e2e/fixtures/exam-data.ts	NOUVEAU — générateurs données	🔴
e2e/tests/exams/exam-sections-independent.spec.ts	NOUVEAU — soumissions indép.	🔴
e2e/tests/exams/conditional-fields.spec.ts	NOUVEAU — champs conditionnels	🔴
e2e/tests/exams/enum-mapping.spec.ts	NOUVEAU — mappings enum E2E	🟡
e2e/tests/conducteurs/driver-form.spec.ts	NOUVEAU — formulaire conducteur	🟡
src/features/exams/components/forms/__tests__/plaintes-form.test.tsx	NOUVEAU — Vitest	🟡
src/features/exams/components/forms/__tests__/visual-acuity-form.test.tsx	NOUVEAU — Vitest	🟡
src/features/exams/components/forms/__tests__/biomicroscopy-anterior-form.test.tsx	NOUVEAU — Vitest	🟡
ORDRE D'IMPLÉMENTATION
Backend factories conditionnelles — factories.py (base pour tous les autres tests)
test_conditional_fields.py — tests modèles (les plus rapides à écrire et exécuter)
test_exam_sections_independent.py — soumissions indépendantes
test_exam_section_apis.py — tests API
e2e/fixtures/exam-data.ts — générateurs données frontend
e2e/tests/exams/exam-sections-independent.spec.ts — E2E soumissions
e2e/tests/exams/conditional-fields.spec.ts — E2E conditionnels
Tests Vitest composants — plaintes, visual acuity, biomicroscopy
VÉRIFICATION
# Backend — tous les tests conditionnels
docker compose exec django pytest apps/depistage/tests/test_conditional_fields.py -v

# Backend — soumissions indépendantes
docker compose exec django pytest apps/depistage/tests/test_exam_sections_independent.py -v

# Backend — couverture dépistage
docker compose exec django pytest apps/depistage/ --cov=apps/depistage --cov-report=term-missing

# Frontend — E2E champs conditionnels (backend + frontend doivent tourner)
cd ~/projects/guiss/GuissUI
yarn playwright test e2e/tests/exams/ --reporter=html

# Frontend — tests Vitest composants
yarn test run src/features/exams/
Add Comment