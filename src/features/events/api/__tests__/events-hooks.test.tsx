import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import {
  mockPublicEvents,
  mockStaffEvents,
  eventsHandlers,
} from '@/testing/mocks/handlers/events';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, waitFor } from '@/testing/test-utils';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

import { useCreateEvent } from '../create-event';
import { usePublicEvents } from '../get-public-events';
import { useStaffEvents } from '../get-staff-events';
import { useRegisterEvent } from '../register-event';

// ---------------------------------------------------------------------------
// Composants légers pour exercer les hooks
// ---------------------------------------------------------------------------

function PublicEventsComponent() {
  const { data, isLoading, isError } = usePublicEvents();
  if (isLoading) return <div>loading events</div>;
  if (isError) return <div>erreur events</div>;
  return (
    <ul>
      {data?.results.map((e) => (
        <li key={e.numero_evenement}>
          {e.titre} — {e.lieu}
        </li>
      ))}
    </ul>
  );
}

function StaffEventsComponent() {
  const { data, isLoading } = useStaffEvents();
  if (isLoading) return <div>loading staff events</div>;
  return (
    <ul>
      {(data as { results?: typeof mockStaffEvents })?.results?.map((e) => (
        <li key={e.id}>{e.titre}</li>
      ))}
    </ul>
  );
}

function RegisterComponent({
  slug,
  onSuccess,
}: {
  slug: string;
  onSuccess: (nr: string) => void;
}) {
  const { mutate, isPending } = useRegisterEvent(slug, {
    onSuccess: (data) => onSuccess(data.numero_inscription),
  });
  return (
    <button
      onClick={() =>
        mutate({
          nom: 'Diop',
          prenom: 'Fatou',
          phone_number: '+221771112233',
          sex: 'F',
          date_de_naissance: '2000-01-01',
        })
      }
      disabled={isPending}
    >
      S&apos;inscrire
    </button>
  );
}

function CreateEventComponent({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateEvent({ onSuccess });
  return (
    <button
      onClick={() =>
        mutate({
          titre: 'Nouveau dépistage',
          date_event: '2024-08-01',
          heure_debut: '08:00',
          heure_fin: '17:00',
          lieu: 'Hôpital de Thiès',
          type_examen: 'adulte',
        })
      }
      disabled={isPending}
    >
      Créer événement
    </button>
  );
}

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function wrap(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return rtlRender(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('events hooks', () => {
  beforeEach(() => {
    server.use(...eventsHandlers);
  });

  // -------------------------------------------------------------------------
  // usePublicEvents
  // -------------------------------------------------------------------------
  describe('usePublicEvents', () => {
    test('charge et affiche les evenements publics', async () => {
      // Arrange & Act
      wrap(<PublicEventsComponent />);

      // Assert
      await screen.findByText(/Campagne de dépistage visuel/);
      expect(screen.getByText(/Journée vision enfants/)).toBeInTheDocument();
    });

    test('affiche les lieux des evenements', async () => {
      // Arrange & Act
      wrap(<PublicEventsComponent />);

      // Assert
      await screen.findByText(/Centre de santé de Thiès/);
      expect(
        screen.getByText(/École Léopold Sédar Senghor/),
      ).toBeInTheDocument();
    });

    test('affiche loading initialement', () => {
      // Arrange & Act
      wrap(<PublicEventsComponent />);

      // Assert
      expect(screen.getByText('loading events')).toBeInTheDocument();
    });

    test("affiche une erreur quand l'API echoue", async () => {
      // Arrange
      server.use(
        http.get(`${env.API_URL}/events/public/`, () => HttpResponse.error()),
      );

      wrap(<PublicEventsComponent />);

      // Assert
      await screen.findByText('erreur events');
    });

    test('filtre par type_examen adulte', async () => {
      // Arrange — override pour retourner seulement les adultes
      server.use(
        http.get(`${env.API_URL}/events/public/`, ({ request }) => {
          const url = new URL(request.url);
          const type = url.searchParams.get('type_examen');
          const results =
            type === 'adulte' ? [mockPublicEvents[0]] : mockPublicEvents;
          return HttpResponse.json({
            count: results.length,
            next: null,
            previous: null,
            results,
          });
        }),
      );

      wrap(<PublicEventsComponent />);

      // Pour tester le filtre, on utilise un composant dédié
      function FilteredEvents() {
        const { data, isLoading } = usePublicEvents({ type_examen: 'adulte' });
        if (isLoading) return <div>loading</div>;
        return (
          <ul>
            {data?.results.map((e) => (
              <li key={e.numero_evenement}>{e.titre}</li>
            ))}
          </ul>
        );
      }

      const queryClient = createQueryClient();
      rtlRender(
        <QueryClientProvider client={queryClient}>
          <FilteredEvents />
        </QueryClientProvider>,
      );

      await screen.findByText(/Campagne de dépistage visuel/);
    });
  });

  // -------------------------------------------------------------------------
  // useStaffEvents
  // -------------------------------------------------------------------------
  describe('useStaffEvents', () => {
    test('charge les evenements staff', async () => {
      // Arrange & Act
      wrap(<StaffEventsComponent />);

      // Assert
      await screen.findByText('Campagne de dépistage visuel — Thiès');
    });
  });

  // -------------------------------------------------------------------------
  // useRegisterEvent
  // -------------------------------------------------------------------------
  describe('useRegisterEvent', () => {
    test('appelle onSuccess avec le numero_inscription apres inscription', async () => {
      // Arrange
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      let capturedNr = '';

      wrap(
        <RegisterComponent
          slug="campagne-depistage-thies-2024"
          onSuccess={(nr) => {
            capturedNr = nr;
          }}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /inscrire/i }));

      // Assert
      await waitFor(() => {
        expect(capturedNr).toBe('INS-2024-001');
      });
    });
  });

  // -------------------------------------------------------------------------
  // useCreateEvent
  // -------------------------------------------------------------------------
  describe('useCreateEvent', () => {
    test('appelle onSuccess apres creation', async () => {
      // Arrange
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      let called = false;

      wrap(
        <CreateEventComponent
          onSuccess={() => {
            called = true;
          }}
        />,
      );

      // Act
      await user.click(
        screen.getByRole('button', { name: /créer événement/i }),
      );

      // Assert
      await waitFor(() => {
        expect(called).toBe(true);
      });
    });
  });
});
