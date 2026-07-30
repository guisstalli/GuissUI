import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import {
  administrationHandlers,
  mockPermissionGroups,
} from '@/testing/mocks/handlers/administration';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import { PermissionGroupsManager } from '../permission-groups-manager';

// =============================================================================
// Helpers
// =============================================================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderManager() {
  return rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <PermissionGroupsManager />
    </QueryClientProvider>,
  );
}

// NOTE: PermissionGroupFormDialog is always mounted (dialog prop `open` may be
// false but the hooks still fire), so ALL tests need handlers for:
//   GET /users/permission-groups/
//   GET /users/capabilities/   ← used by CapabilityPicker inside the dialog
//   GET /users/               ← used by UserMultiSelect inside the dialog
// The administrationHandlers array covers all three.

// =============================================================================
// Tests
// =============================================================================

describe('PermissionGroupsManager', () => {
  test('lists group names from the mocked API response', async () => {
    server.use(...administrationHandlers);

    renderManager();

    await screen.findByText('Administrateurs IA');
    expect(screen.getByText('Système interne')).toBeInTheDocument();
  });

  test('shows group description when present', async () => {
    server.use(...administrationHandlers);

    renderManager();

    await screen.findByText('Accès complet aux fonctionnalités IA.');
  });

  test('shows "Système" badge on is_system groups', async () => {
    server.use(...administrationHandlers);

    renderManager();

    await screen.findByText('Système interne');

    const systemBadges = screen.getAllByText('Système');
    expect(systemBadges.length).toBeGreaterThan(0);
  });

  test('hides the delete button for is_system groups', async () => {
    server.use(...administrationHandlers);

    renderManager();

    await screen.findByText('Système interne');

    expect(
      screen.queryByRole('button', {
        name: /supprimer système interne/i,
      }),
    ).not.toBeInTheDocument();
  });

  test('shows the delete button for non-system groups', async () => {
    server.use(...administrationHandlers);

    renderManager();

    await screen.findByText('Administrateurs IA');

    expect(
      screen.getByRole('button', {
        name: /supprimer administrateurs ia/i,
      }),
    ).toBeInTheDocument();
  });

  test('shows empty state when no groups exist', async () => {
    // Use all administration handlers (needed for capabilities/ and users/)
    // then override just the groups endpoint.
    server.use(...administrationHandlers);
    server.use(
      http.get(`${env.API_URL}/users/permission-groups/`, () =>
        HttpResponse.json([]),
      ),
    );

    renderManager();

    await screen.findByText(/aucun groupe de permissions/i);
  });

  test('shows error state and retry button when the groups API fails', async () => {
    // Override groups endpoint to error; keep capabilities/ and users/ handlers.
    server.use(...administrationHandlers);
    server.use(
      http.get(`${env.API_URL}/users/permission-groups/`, () =>
        HttpResponse.error(),
      ),
    );

    renderManager();

    await screen.findByText(/impossible de charger les groupes/i);
    expect(
      screen.getByRole('button', { name: /réessayer/i }),
    ).toBeInTheDocument();
  });

  test('clicking "Nouveau groupe" opens the create dialog with a Nom field', async () => {
    const user = userEvent.setup();
    server.use(...administrationHandlers);

    renderManager();

    await screen.findByText('Administrateurs IA');

    await user.click(screen.getByRole('button', { name: /nouveau groupe/i }));

    await screen.findByRole('dialog');
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
  });

  test('create-group flow fires a POST with the entered name', async () => {
    const user = userEvent.setup();

    // Set up base handlers, then add POST capture on top so it wins.
    server.use(...administrationHandlers);

    let postedBody: Record<string, unknown> | null = null;
    server.use(
      http.post(
        `${env.API_URL}/users/permission-groups/`,
        async ({ request }) => {
          postedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            {
              id: 99,
              name: postedBody.name as string,
              description: '',
              is_system: false,
              capabilities: [],
              user_ids: [],
              created_at: new Date().toISOString(),
            },
            { status: 201 },
          );
        },
      ),
    );

    renderManager();

    await screen.findByText('Administrateurs IA');

    // Open create dialog
    await user.click(screen.getByRole('button', { name: /nouveau groupe/i }));
    await screen.findByRole('dialog');

    // Fill the name field and submit
    await user.type(screen.getByLabelText('Nom'), 'Analystes');
    await user.click(screen.getByRole('button', { name: /créer/i }));

    // On n'attend QUE l'arrivée de la requête ; l'assertion sur son contenu
    // vient après. Deux assertions dans un `waitFor` masquent laquelle a
    // échoué et font retenter la seconde inutilement.
    await waitFor(() => {
      expect(postedBody).not.toBeNull();
    });
    // `toMatchObject` plutôt que `postedBody?.name` : hors du `waitFor`, le
    // rétrécissement de type de TypeScript ramène la variable à `null`
    // (elle n'est affectée que dans une closure).
    expect(postedBody).toMatchObject({ name: 'Analystes' });
  });

  test('delete confirmation dialog appears when delete button is clicked', async () => {
    const user = userEvent.setup();
    server.use(...administrationHandlers);

    renderManager();

    await screen.findByText('Administrateurs IA');

    await user.click(
      screen.getByRole('button', { name: /supprimer administrateurs ia/i }),
    );

    // The ConfirmationDialog title should appear
    await screen.findByText(/supprimer ce groupe/i);
    // The confirm button inside the dialog
    expect(
      screen.getByRole('button', { name: /^supprimer$/i }),
    ).toBeInTheDocument();
  });

  test('confirming delete fires the DELETE request for the group', async () => {
    const user = userEvent.setup();

    server.use(...administrationHandlers);
    // Add a specific DELETE handler on top that captures the call.
    let deleteWasCalled = false;
    server.use(
      http.delete(
        `${env.API_URL}/users/permission-groups/${mockPermissionGroups[0].id}/`,
        () => {
          deleteWasCalled = true;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    renderManager();

    await screen.findByText('Administrateurs IA');

    // Open confirmation dialog
    await user.click(
      screen.getByRole('button', { name: /supprimer administrateurs ia/i }),
    );

    // Click confirm
    const confirmButton = await screen.findByRole('button', {
      name: /^supprimer$/i,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(deleteWasCalled).toBe(true);
    });
  });
});
