import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { appointmentsHandlers } from '@/testing/mocks/handlers/appointments';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, waitFor } from '@/testing/test-utils';

import { useBookAppointment } from '../book-appointment';
import { useDisponibilites } from '../get-disponibilites';
import { useRdvList } from '../get-rdv-list';
import { useRdvStats } from '../get-rdv-stats';

// next-auth/react est déjà mocké globalement dans setup-tests.ts.

function RdvListComponent() {
  const { data, isLoading, isError } = useRdvList();
  if (isLoading) return <div>loading</div>;
  if (isError) return <div>erreur liste rdv</div>;
  return (
    <ul>
      {data?.results.map((rdv) => (
        <li key={rdv.id}>
          {rdv.patient_nom} {rdv.patient_prenom} — {rdv.statut}
        </li>
      ))}
    </ul>
  );
}

function RdvStatsComponent() {
  const { data, isLoading, isError } = useRdvStats();
  if (isLoading) return <div>loading</div>;
  if (isError) return <div>erreur stats</div>;
  return (
    <div>
      <span>en_attente: {data?.en_attente}</span>
      <span>confirme: {data?.confirme}</span>
    </div>
  );
}

function BookingComponent({ onSuccess }: { onSuccess: (nr: string) => void }) {
  const { mutate, isPending } = useBookAppointment({
    onSuccess: (data) => onSuccess(data.numero_rdv),
  });
  return (
    <button
      onClick={() =>
        mutate({
          date: '2024-06-25',
          heure_debut: '14:00',
          patient_nom: 'Test',
          patient_prenom: 'Patient',
          patient_phone: '+221770000000',
          // Obligatoire depuis que le modèle WhatsApp de confirmation l'attend
          // comme variable : Meta refuse un modèle à variable vide.
          motif: 'Consultation nouveau malade',
          want_reminder: true,
        })
      }
      disabled={isPending}
    >
      Réserver
    </button>
  );
}

function DisponibilitesComponent({ date }: { date: string | null }) {
  const { data, isLoading } = useDisponibilites(date);
  if (isLoading) return <div>loading slots</div>;
  return (
    <ul>
      {(data?.slots ?? []).map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
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

describe('appointments hooks', () => {
  beforeEach(() => {
    server.use(...appointmentsHandlers);
  });

  // -------------------------------------------------------------------------
  // useRdvList
  // -------------------------------------------------------------------------
  describe('useRdvList', () => {
    test('charge et affiche la liste des rendez-vous', async () => {
      // Arrange & Act
      wrap(<RdvListComponent />);

      // Assert
      await screen.findByText(/Diallo Aminata/i);
      expect(screen.getByText(/Sow Ibrahima/i)).toBeInTheDocument();
    });

    test('affiche les statuts des rendez-vous', async () => {
      // Arrange & Act
      wrap(<RdvListComponent />);

      // Assert
      await screen.findByText(/en_attente/);
      expect(screen.getByText(/confirme/)).toBeInTheDocument();
    });

    test("affiche une erreur quand l'API echoue", async () => {
      // Arrange
      server.use(
        http.get(`${env.API_URL}/rendez-vous/`, () => HttpResponse.error()),
      );

      wrap(<RdvListComponent />);

      // Assert
      expect(await screen.findByText(/erreur liste rdv/i)).toBeInTheDocument();
    });

    test('affiche le chargement initialement', () => {
      // Arrange & Act
      wrap(<RdvListComponent />);

      // Assert
      expect(screen.getByText('loading')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // useRdvStats
  // -------------------------------------------------------------------------
  describe('useRdvStats', () => {
    test('charge et affiche les statistiques', async () => {
      // Arrange & Act
      wrap(<RdvStatsComponent />);

      // Assert
      await screen.findByText(/en_attente: 5/);
      expect(screen.getByText(/confirme: 3/)).toBeInTheDocument();
    });

    test("affiche une erreur quand l'API echoue", async () => {
      // Arrange
      server.use(
        http.get(`${env.API_URL}/rendez-vous/statistiques/`, () =>
          HttpResponse.error(),
        ),
      );

      wrap(<RdvStatsComponent />);

      // Assert
      expect(await screen.findByText(/erreur stats/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // useBookAppointment
  // -------------------------------------------------------------------------
  describe('useBookAppointment', () => {
    test('appelle onSuccess avec le numero_rdv apres reservation', async () => {
      // Arrange
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      let capturedNr = '';

      wrap(
        <BookingComponent
          onSuccess={(nr) => {
            capturedNr = nr;
          }}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /réserver/i }));

      // Assert
      await waitFor(() => {
        expect(capturedNr).toBe('RDV-2024-099');
      });
    });
  });

  // -------------------------------------------------------------------------
  // useDisponibilites
  // -------------------------------------------------------------------------
  describe('useDisponibilites', () => {
    test('charge les creneaux disponibles pour une date donnee', async () => {
      // Arrange & Act
      wrap(<DisponibilitesComponent date="2024-06-25" />);

      // Assert
      await screen.findByText('09:00');
      expect(screen.getByText('14:00')).toBeInTheDocument();
    });

    test('ne fait pas de requete quand la date est null', () => {
      // Arrange & Act
      wrap(<DisponibilitesComponent date={null} />);

      // Assert — pas de slots, pas de loading non plus (disabled query)
      expect(screen.queryByText('loading slots')).not.toBeInTheDocument();
      expect(screen.queryByText('09:00')).not.toBeInTheDocument();
    });
  });
});
