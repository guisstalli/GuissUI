import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import {
  mockMedicaments,
  medicamentsAdminHandlers,
} from '@/testing/mocks/handlers/medicaments-admin';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen } from '@/testing/test-utils';

import { MedicamentsAdminTable } from '../medicaments-admin-table';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

// MedicamentSelector calls /depistage/medicaments/search/ — intercept silently
vi.mock('@/components/medicament-selector/use-medicament-search', () => ({
  useMedicamentSearch: () => ({ data: [], isFetching: false }),
  FormeGalenique: {},
}));

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderTable() {
  const queryClient = createQueryClient();
  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <MedicamentsAdminTable />
    </QueryClientProvider>,
  );
}

describe('MedicamentsAdminTable', () => {
  beforeEach(() => {
    server.use(...medicamentsAdminHandlers);
  });

  test("affiche la liste des medicaments charges depuis l'API", async () => {
    // Arrange & Act
    renderTable();

    // Assert — attend que les DCI apparaissent
    await screen.findByText('timolol');
    expect(screen.getByText('latanoprost')).toBeInTheDocument();
    expect(screen.getByText('prednisolone')).toBeInTheDocument();
  });

  test('affiche les formes galéniques dans le tableau', async () => {
    // Arrange & Act
    renderTable();

    // Assert
    const collyres = await screen.findAllByText('Collyre');
    expect(collyres.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Pommade ophtalmique')).toBeInTheDocument();
  });

  test('affiche le bouton Ajouter', async () => {
    // Arrange & Act
    renderTable();

    // Assert
    expect(
      await screen.findByRole('button', { name: /ajouter/i }),
    ).toBeInTheDocument();
  });

  test('ouvre le dialog de création quand on clique sur Ajouter', async () => {
    // Arrange
    const user = userEvent.setup();
    renderTable();

    // Act
    const addButton = await screen.findByRole('button', { name: /ajouter/i });
    await user.click(addButton);

    // Assert — le dialog de création s'affiche avec le titre attendu
    await screen.findByText('Ajouter un médicament');
  });

  test('affiche un message quand la liste est vide', async () => {
    // Arrange — override pour renvoyer une liste vide
    server.use(
      http.get(`${env.API_URL}/depistage/medicaments/`, () =>
        HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          limit: 20,
          offset: 0,
          results: [],
        }),
      ),
    );

    renderTable();

    // Assert
    await screen.findByText(/Aucun médicament/);
  });

  test('affiche les boutons Modifier et Supprimer pour chaque ligne', async () => {
    // Arrange & Act
    renderTable();

    // Assert — on attend que la table soit rendue
    await screen.findByText('timolol');
    const editButtons = screen.getAllByRole('button', { name: /modifier/i });
    const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
    expect(editButtons.length).toBe(mockMedicaments.length);
    expect(deleteButtons.length).toBe(mockMedicaments.length);
  });

  test('ouvre le dialog de confirmation de suppression au clic sur Supprimer', async () => {
    // Arrange
    const user = userEvent.setup();
    renderTable();

    // Act
    await screen.findByText('timolol');
    const [firstDeleteBtn] = screen.getAllByRole('button', {
      name: /supprimer/i,
    });
    await user.click(firstDeleteBtn);

    // Assert
    await screen.findByText(/supprimer ce médicament/i);
  });

  test('affiche le champ de recherche dans la toolbar', async () => {
    // Arrange & Act
    renderTable();

    // Assert
    expect(
      await screen.findByPlaceholderText(/DCI, nom commercial, ATC/i),
    ).toBeInTheDocument();
  });
});
