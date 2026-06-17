import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { MedicamentSelector } from '../medicament-selector';
import { type Medicament, useMedicamentSearch } from '../use-medicament-search';

// The search hook hits /depistage/medicaments/search/ — mock it so the
// component renders deterministic results without a QueryClient or network.
vi.mock('../use-medicament-search', () => ({
  useMedicamentSearch: vi.fn(),
}));

const mockedUseMedicamentSearch = vi.mocked(useMedicamentSearch);

const paracetamol: Medicament = {
  source: 'local',
  id: 1,
  cis: null,
  dci: 'paracetamol',
  nom_affiche: 'Paracétamol',
  atc_code: 'N02BE01',
  atc_libelle: '',
  nom_commercial: 'Doliprane',
  titulaire: '',
  forme_galenique: 'COMPRIMES',
  forme_galenique_label: 'Comprimés',
  voies_administration: [],
  dosage: '500mg',
  posologie_defaut: '',
  duree_defaut_jours: null,
  enriched: false,
};

function mockResults(data: Medicament[], isFetching = false) {
  mockedUseMedicamentSearch.mockReturnValue({
    data,
    isFetching,
  } as unknown as ReturnType<typeof useMedicamentSearch>);
}

beforeEach(() => {
  mockedUseMedicamentSearch.mockReset();
});

describe('MedicamentSelector', () => {
  test('renders the search input', () => {
    mockResults([]);
    render(
      <MedicamentSelector value="" onTextChange={vi.fn()} onSelect={vi.fn()} />,
    );
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  test('shows a "type at least 3 characters" hint for short queries', async () => {
    mockResults([]);
    const user = userEvent.setup();
    render(
      <MedicamentSelector value="" onTextChange={vi.fn()} onSelect={vi.fn()} />,
    );

    await user.type(screen.getByPlaceholderText(/rechercher/i), 'pa');

    expect(
      await screen.findByText(/au moins 3 caractères/i),
    ).toBeInTheDocument();
  });

  test('lists results and selects one, propagating onSelect + onTextChange', async () => {
    mockResults([paracetamol]);
    const onSelect = vi.fn();
    const onTextChange = vi.fn();
    const user = userEvent.setup();
    render(
      <MedicamentSelector
        value=""
        onTextChange={onTextChange}
        onSelect={onSelect}
      />,
    );

    await user.type(screen.getByPlaceholderText(/rechercher/i), 'para');

    const option = await screen.findByRole('option', { name: /paracetamol/i });
    await user.click(option);

    expect(onSelect).toHaveBeenCalledWith(paracetamol);
    // onTextChange is called on each keystroke AND on select; last call = commercial name
    expect(onTextChange).toHaveBeenLastCalledWith('Doliprane');
  });

  test('shows "Aucun résultat" when the search returns nothing', async () => {
    mockResults([]);
    const user = userEvent.setup();
    render(
      <MedicamentSelector value="" onTextChange={vi.fn()} onSelect={vi.fn()} />,
    );

    await user.type(screen.getByPlaceholderText(/rechercher/i), 'xyzzy');

    expect(await screen.findByText(/aucun résultat/i)).toBeInTheDocument();
  });
});
