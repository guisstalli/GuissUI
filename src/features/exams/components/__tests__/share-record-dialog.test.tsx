import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

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
  props?: Partial<{ examType: 'adulte' | 'enfant'; examId: number }>,
) {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <ShareRecordDialog
        examType={props?.examType ?? 'adulte'}
        examId={props?.examId ?? 42}
      />
    </QueryClientProvider>,
  );
  return user;
}

describe('ShareRecordDialog — partage de dossier', () => {
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
