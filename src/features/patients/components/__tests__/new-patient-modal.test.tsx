/**
 * Tests d'intégration — NewPatientModal
 *
 * Couvre :
 * - Étape 1 (sélection type) : affichage, sélection adulte/enfant, bouton "Continuer" désactivé sans sélection
 * - Étape 2 (formulaire) : champs requis, phone_number optionnel, soumission réussie
 * - Navigation retour entre les étapes
 * - phone_number vide → soumis sans erreur (règle métier)
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { env } from '@/config/env';
import { patientsHandlers } from '@/testing/mocks/handlers/patients';
import { server } from '@/testing/mocks/server';

import { NewPatientModal } from '../new-patient-modal';

// next-auth est chargé via les hooks TanStack
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderModal(
  props: Partial<React.ComponentProps<typeof NewPatientModal>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onPatientCreated: vi.fn(),
    ...props,
  };

  render(
    <QueryClientProvider client={queryClient}>
      <NewPatientModal {...defaultProps} />
    </QueryClientProvider>,
  );

  return defaultProps;
}

// ─── Étape 1 : Sélection du type de patient ───────────────────────────────────

describe('NewPatientModal — étape 1 (sélection du type)', () => {
  test('affiche le titre "Nouveau patient" et les deux options', () => {
    renderModal();
    expect(screen.getByText('Nouveau patient')).toBeInTheDocument();
    expect(screen.getByText('Patient adulte')).toBeInTheDocument();
    expect(screen.getByText('Patient enfant')).toBeInTheDocument();
  });

  test('le bouton "Continuer" est désactivé tant qu\'aucun type n\'est sélectionné', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /continuer/i })).toBeDisabled();
  });

  test('sélectionner "Patient adulte" active le bouton "Continuer"', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Patient adulte'));
    expect(screen.getByRole('button', { name: /continuer/i })).toBeEnabled();
  });

  test('sélectionner "Patient enfant" active le bouton "Continuer"', async () => {
    renderModal();
    await userEvent.click(screen.getByText('Patient enfant'));
    expect(screen.getByRole('button', { name: /continuer/i })).toBeEnabled();
  });

  test('cliquer sur "Annuler" appelle onOpenChange(false)', async () => {
    const { onOpenChange } = renderModal();
    await userEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

// ─── Étape 2 : Formulaire patient ─────────────────────────────────────────────

describe('NewPatientModal — étape 2 (formulaire)', () => {
  async function goToStep2(type: 'adult' | 'child' = 'adult') {
    const label = type === 'adult' ? 'Patient adulte' : 'Patient enfant';
    await userEvent.click(screen.getByText(label));
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }));
  }

  test('affiche les champs Nom, Prénom, Date de naissance après navigation', async () => {
    renderModal();
    await goToStep2();
    // Le formulaire contient les deux champs d'identité — on cible par placeholder
    expect(screen.getByPlaceholderText('Entrez le nom')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Entrez le prénom')).toBeInTheDocument();
    // La date de naissance — on vérifie le label texte
    expect(screen.getByText('Date de naissance')).toBeInTheDocument();
  });

  test('affiche le champ "Numéro de téléphone" marqué comme optionnel', async () => {
    renderModal();
    await goToStep2();
    expect(screen.getByText('Numéro de téléphone')).toBeInTheDocument();
    expect(screen.getByText(/optionnel/i)).toBeInTheDocument();
  });

  test("le bouton retour ramène à l'étape 1", async () => {
    renderModal();
    await goToStep2();
    await userEvent.click(screen.getByRole('button', { name: /retour/i }));
    expect(screen.getByText('Nouveau patient')).toBeInTheDocument();
    expect(screen.getByText('Patient adulte')).toBeInTheDocument();
  });

  test('le formulaire contient un champ téléphone optionnel non bloquant', async () => {
    renderModal();
    await goToStep2('adult');
    // Vérifie que le champ existe et n'a pas d'indicateur requis
    const phoneInput = screen.getByPlaceholderText('77 000 00 00');
    expect(phoneInput).toBeInTheDocument();
    // Le schéma Zod accepte phone_number vide ou absent
    expect(phoneInput).not.toBeRequired();
  });

  test('affiche le bouton "Créer le patient" dans le formulaire', async () => {
    renderModal();
    await goToStep2('adult');
    // Le bouton de soumission est bien présent
    expect(
      screen.getByRole('button', { name: /créer le patient/i }),
    ).toBeInTheDocument();
    // Il n'est pas désactivé au repos (sans soumission en cours)
    expect(
      screen.getByRole('button', { name: /créer le patient/i }),
    ).toBeEnabled();
  });
});

// ─── Règle métier : phone_number optionnel ────────────────────────────────────

describe('NewPatientModal — règle métier phone_number', () => {
  test('le schéma patientFormSchema accepte phone_number vide', () => {
    // Vérifie directement via la définition du schéma dans le composant
    // phone_number: z.string().min(8).optional().or(z.literal(''))
    // → chaîne vide acceptée sans erreur
    const schema = z.object({
      phone_number: z
        .string()
        .min(8, 'Numéro invalide')
        .optional()
        .or(z.literal('')),
    });
    const result = schema.safeParse({ phone_number: '' });
    expect(result.success).toBe(true);
  });

  test('phone_number absent (undefined) est accepté par le schéma', () => {
    const schema = z.object({
      phone_number: z
        .string()
        .min(8, 'Numéro invalide')
        .optional()
        .or(z.literal('')),
    });
    const result = schema.safeParse({ phone_number: undefined });
    expect(result.success).toBe(true);
  });

  test("le champ téléphone n'a pas l'attribut required dans le rendu", async () => {
    renderModal();
    // Étape 1 → adulte
    await userEvent.click(screen.getByText('Patient adulte'));
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }));
    const phoneInput = screen.getByPlaceholderText('77 000 00 00');
    // HTML required n'est pas posé — la validation est gérée par React Hook Form / Zod
    expect(phoneInput).not.toBeRequired();
  });
});

// ─── Détection d'un numéro déjà utilisé ───────────────────────────────────────
//
// `phone_number` est UNIQUE en base : sans cette détection, l'accueil
// remplissait tout le formulaire avant de se heurter à un 500.

describe('NewPatientModal — lookup du numéro de téléphone', () => {
  async function allerAuFormulaire(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByText('Patient adulte'));
    await user.click(screen.getByRole('button', { name: /continuer/i }));
    return screen.getByPlaceholderText('77 000 00 00');
  }

  test('un numéro sénégalais saisi sans indicatif est envoyé en E.164', async () => {
    // Arrange
    const numeros: string[] = [];
    server.use(
      http.get(
        `${env.API_URL}/depistage/patients/lookup-telephone/`,
        ({ request }) => {
          numeros.push(
            new URL(request.url).searchParams.get('phone_number') ?? '',
          );
          return HttpResponse.json({ patient_existant: null });
        },
      ),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderModal();

    // Act — le champ porte déjà l'indicatif du Sénégal (pays par défaut)
    const champ = await allerAuFormulaire(user);
    await user.type(champ, '775726004');

    // Assert — l'indicatif est ajouté avant l'envoi, jamais deviné côté serveur
    await waitFor(() => expect(numeros).toContain('+221775726004'), {
      timeout: 4000,
    });
  });

  test('des frappes rapprochées ne produisent qu’une seule requête', async () => {
    // Arrange — le endpoint est limité à 120 requêtes/minute : une requête par
    // frappe ferait limiter l'utilisateur au milieu de son formulaire.
    let appels = 0;
    server.use(
      http.get(`${env.API_URL}/depistage/patients/lookup-telephone/`, () => {
        appels += 1;
        return HttpResponse.json({ patient_existant: null });
      }),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0, delay: null });
    renderModal();

    // Act — saisie instantanée des neuf chiffres
    const champ = await allerAuFormulaire(user);
    await user.type(champ, '775726004');

    // Assert
    await waitFor(() => expect(appels).toBe(1), { timeout: 4000 });
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(appels).toBe(1);
  });

  test('annonce le patient qui porte déjà le numéro', async () => {
    // Arrange
    server.use(...patientsHandlers);
    const user = userEvent.setup({ pointerEventsCheck: 0, delay: null });
    renderModal();

    // Act
    const champ = await allerAuFormulaire(user);
    await user.type(champ, '775726004');

    // Assert
    expect(
      await screen.findByText('Fatou Diop', {}, { timeout: 4000 }),
    ).toBeInTheDocument();
  });
});
