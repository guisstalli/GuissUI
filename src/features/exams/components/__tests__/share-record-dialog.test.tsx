import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import { ShareRecordDialog } from '../share-record-dialog';

const SHARE_LINK = {
  token: 'tok-123',
  url: 'http://localhost:3000/dossier/tok-123',
  kind: 'exam_adult',
  expires_at: '2026-07-06T10:00:00Z',
  revoked: false,
  access_count: 0,
  max_access: null,
  created_at: '2026-07-04T10:00:00Z',
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function setup(
  props?: Partial<{
    examType: 'adulte' | 'enfant';
    examId: number;
    document: 'dossier' | 'conclusion';
  }>,
) {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <ShareRecordDialog
        examType={props?.examType ?? 'adulte'}
        examId={props?.examId ?? 42}
        document={props?.document}
      />
    </QueryClientProvider>,
  );
  return user;
}

async function openAndGenerate(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', { name: /partager le dossier/i }),
  );
  await user.click(
    await screen.findByRole('button', { name: /générer le lien/i }),
  );
  await screen.findByDisplayValue(SHARE_LINK.url);
}

describe('ShareRecordDialog — partage de dossier', () => {
  beforeEach(() => {
    useNotifications.setState({ notifications: [] });
  });

  test('avertit si le lien est fermé sans avoir été copié', async () => {
    // Arrange
    server.use(
      http.post(`${env.API_URL}/share/create/`, () =>
        HttpResponse.json(SHARE_LINK, { status: 201 }),
      ),
    );
    const user = setup();

    // Act — générer puis fermer SANS copier
    await openAndGenerate(user);
    await user.click(screen.getByRole('button', { name: /fermer/i }));

    // Assert — l'avertissement « lien non copié » est émis
    const warned = useNotifications
      .getState()
      .notifications.some(
        (n) => n.type === 'warning' && /non copié/i.test(n.title),
      );
    expect(warned).toBe(true);
  });

  test('n’avertit pas si le lien a été copié', async () => {
    // Arrange — presse-papier qui réussit (clipboard est un getter en jsdom)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    server.use(
      http.post(`${env.API_URL}/share/create/`, () =>
        HttpResponse.json(SHARE_LINK, { status: 201 }),
      ),
    );
    const user = setup();

    // Act — générer, copier, puis fermer
    await openAndGenerate(user);
    await user.click(screen.getByRole('button', { name: /copier le lien/i }));
    await user.click(screen.getByRole('button', { name: /fermer/i }));

    // Assert — aucun avertissement « non copié »
    const warned = useNotifications
      .getState()
      .notifications.some((n) => /non copié/i.test(n.title));
    expect(warned).toBe(false);
  });

  test('crée un lien et affiche l’URL générée', async () => {
    // Arrange
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post(`${env.API_URL}/share/create/`, async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(SHARE_LINK, { status: 201 });
      }),
    );
    const user = setup({ examType: 'adulte', examId: 42 });

    // Act — ouvrir le dialog puis générer le lien
    await user.click(
      screen.getByRole('button', { name: /partager le dossier/i }),
    );
    await user.click(
      await screen.findByRole('button', { name: /générer le lien/i }),
    );

    // Assert — l’URL générée s’affiche et le payload cible le bon examen
    expect(
      await screen.findByDisplayValue('http://localhost:3000/dossier/tok-123'),
    ).toBeInTheDocument();
    await waitFor(() => expect(captured).not.toBeNull());
    expect(captured!.exam_type).toBe('adulte');
    expect(captured!.exam_id).toBe(42);
  });

  test('affiche l’erreur du backend quand la création échoue', async () => {
    // Arrange
    server.use(
      http.post(`${env.API_URL}/share/create/`, () =>
        HttpResponse.json({ detail: 'Examen introuvable.' }, { status: 404 }),
      ),
    );
    const user = setup();

    // Act
    await user.click(
      screen.getByRole('button', { name: /partager le dossier/i }),
    );
    await user.click(
      await screen.findByRole('button', { name: /générer le lien/i }),
    );

    // Assert
    expect(await screen.findByText('Examen introuvable.')).toBeInTheDocument();
    expect(
      screen.queryByDisplayValue('http://localhost:3000/dossier/tok-123'),
    ).not.toBeInTheDocument();
  });
});

// =============================================================================
// Partage de la conclusion
// =============================================================================
//
// Même mécanique de lien, document différent : un seul composant paramétré,
// plutôt qu'un dialogue dupliqué dont la durée de validité, le plafond d'accès
// et la notification auraient fini par diverger.

describe('ShareRecordDialog — partage de la conclusion', () => {
  test('le déclencheur annonce la conclusion, pas le dossier', () => {
    setup({ document: 'conclusion' });

    expect(
      screen.getByRole('button', { name: /partager la conclusion/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /partager le dossier/i }),
    ).not.toBeInTheDocument();
  });

  test('sans propriété, reste le partage de dossier', () => {
    // Les deux appels existants ne passent rien : leur comportement ne doit
    // pas changer.
    setup();

    expect(
      screen.getByRole('button', { name: /partager le dossier/i }),
    ).toBeInTheDocument();
  });

  test('transmet document=conclusion au serveur', async () => {
    let recu: Record<string, unknown> | null = null;
    server.use(
      http.post(`${env.API_URL}/share/create/`, async ({ request }) => {
        recu = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(SHARE_LINK, { status: 201 });
      }),
    );

    const user = setup({ document: 'conclusion' });
    await user.click(
      screen.getByRole('button', { name: /partager la conclusion/i }),
    );
    await user.click(
      await screen.findByRole('button', { name: /générer le lien/i }),
    );

    await waitFor(() => expect(recu).not.toBeNull());
    expect(recu!.document).toBe('conclusion');
  });
});
