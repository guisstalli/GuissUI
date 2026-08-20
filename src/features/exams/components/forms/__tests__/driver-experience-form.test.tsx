/**
 * Tests — DriverExperienceForm (expérience de conduite)
 *
 * Formulaire sans aucune couverture jusqu'ici, alors qu'il porte quatre
 * branches conditionnelles. Le risque propre à ce genre de formulaire :
 * une valeur saisie puis MASQUÉE reste soumise.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const upsert = vi.fn();

vi.mock('@/features/exams/api/adult/driver-experience', () => ({
  useDriverExperience: () => ({ data: undefined, isLoading: false }),
  useUpsertDriverExperience: () => ({ mutate: upsert, isPending: false }),
}));

import { DriverExperienceForm } from '../driver-experience-form';

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <DriverExperienceForm examId={7} />
    </QueryClientProvider>,
  );
}

/** Choisit une valeur dans le sélecteur « État du conducteur ». */
async function choisirEtat(libelle: string) {
  const user = userEvent.setup();
  const combos = screen.getAllByRole('combobox');
  await user.click(combos[0]);
  await user.click(await screen.findByRole('option', { name: libelle }));
}

beforeEach(() => upsert.mockClear());

describe('champs conditionnels — affichage', () => {
  test('la cause du décès n apparaît que pour un conducteur décédé', async () => {
    renderForm();
    expect(screen.queryByLabelText(/cause du décès/i)).not.toBeInTheDocument();

    await choisirEtat('Décédé');

    expect(await screen.findByLabelText(/cause du décès/i)).toBeInTheDocument();
  });

  test('la cause d inactivité n apparaît que pour un conducteur inactif', async () => {
    renderForm();
    await choisirEtat('Inactif');

    expect(
      await screen.findByLabelText(/cause de l'inactivité|cause d'inactivité/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/cause du décès/i)).not.toBeInTheDocument();
  });
});

describe('champs conditionnels — nettoyage à la bascule', () => {
  test('RÉGRESSION : une cause de décès saisie ne survit pas au retour en « Actif »', async () => {
    // Le champ disparaît de l'écran, mais `handleSubmit` soumet TOUTES les
    // valeurs du formulaire. Sans nettoyage, on enregistre une cause de décès
    // pour un conducteur vivant.
    const user = userEvent.setup();
    renderForm();

    await choisirEtat('Décédé');
    await user.type(
      await screen.findByLabelText(/cause du décès/i),
      'Accident de la route',
    );
    await choisirEtat('Actif');

    await user.click(screen.getByRole('button', { name: /sauvegarder/i }));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    const { data } = upsert.mock.calls[0][0];
    expect(data.etat_conducteur).toBe('ACTIF');
    expect(data.deces_cause ?? '').toBe('');
  });

  test('RÉGRESSION : une cause d inactivité ne survit pas au passage en « Décédé »', async () => {
    const user = userEvent.setup();
    renderForm();

    await choisirEtat('Inactif');
    await user.type(
      await screen.findByLabelText(/cause de l'inactivité|cause d'inactivité/i),
      'Retraite',
    );
    await choisirEtat('Décédé');

    await user.click(screen.getByRole('button', { name: /sauvegarder/i }));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    const { data } = upsert.mock.calls[0][0];
    expect(data.inactif_cause ?? '').toBe('');
  });
});
