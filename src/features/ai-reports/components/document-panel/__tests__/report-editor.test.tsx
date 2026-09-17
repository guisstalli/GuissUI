import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import type { ReportDetail } from '../../../types';
import { ReportEditor } from '../report-editor';

/**
 * La relecture se faisait dans un traitement de texte : le médecin
 * téléchargeait le DOCX, le corrigeait, approuvait — et la correction quittait
 * la plateforme. On perdait la seule donnée qui dise ce qu'est un bon rapport.
 */
const rapport = (overrides: Partial<ReportDetail> = {}): ReportDetail =>
  ({
    id: 7,
    status: 'DRAFT',
    markdown: '## Contexte\n\nLa campagne a examiné 80 patients.',
    markdown_original: null,
    error_message: null,
    ...overrides,
  }) as unknown as ReportDetail;

function rendre(report: ReportDetail) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  rtlRender(
    <QueryClientProvider client={client}>
      <ReportEditor report={report} />
    </QueryClientProvider>,
  );
}

describe('Corriger un rapport dans le panneau', () => {
  test('un brouillon peut être corrigé sur place', async () => {
    let envoye: string | undefined;
    server.use(
      http.patch(
        `${env.API_URL}/ai-reports/:id/markdown/`,
        async ({ request }) => {
          envoye = ((await request.json()) as { markdown: string }).markdown;
          return HttpResponse.json({ ...rapport(), markdown: envoye });
        },
      ),
    );
    rendre(rapport());
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: /Corriger le rapport/ }),
    );
    const zone = screen.getByLabelText(/Texte du rapport/);
    await user.clear(zone);
    await user.type(zone, 'Texte corrigé par le médecin.');
    await user.click(
      screen.getByRole('button', { name: /Enregistrer la correction/ }),
    );

    await waitFor(() => expect(envoye).toBe('Texte corrigé par le médecin.'));
  });

  test('un rapport approuvé ne propose pas de correction', () => {
    rendre(rapport({ status: 'APPROVED' } as Partial<ReportDetail>));

    expect(
      screen.queryByRole('button', { name: /Corriger le rapport/ }),
    ).not.toBeInTheDocument();
  });

  test('un rapport déjà corrigé le signale et permet de revoir le texte généré', async () => {
    rendre(
      rapport({
        markdown: '## Contexte\n\nVersion du médecin.',
        markdown_original: '## Contexte\n\nVersion du modèle.',
      } as Partial<ReportDetail>),
    );
    const user = userEvent.setup();

    expect(screen.getByText(/corrigé après génération/)).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /Voir le texte généré/ }),
    );

    expect(screen.getByText(/Version du modèle/)).toBeInTheDocument();
  });

  test('une correction vide ne peut pas être enregistrée', async () => {
    rendre(rapport());
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: /Corriger le rapport/ }),
    );
    await user.clear(screen.getByLabelText(/Texte du rapport/));

    expect(
      screen.getByRole('button', { name: /Enregistrer la correction/ }),
    ).toBeDisabled();
  });

  test('annuler restaure le texte sans rien envoyer', async () => {
    let appele = false;
    server.use(
      http.patch(`${env.API_URL}/ai-reports/:id/markdown/`, () => {
        appele = true;
        return HttpResponse.json(rapport());
      }),
    );
    rendre(rapport());
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: /Corriger le rapport/ }),
    );
    await user.type(screen.getByLabelText(/Texte du rapport/), ' modification');
    await user.click(screen.getByRole('button', { name: /^Annuler$/ }));

    expect(
      screen.getByText(/La campagne a examiné 80 patients/),
    ).toBeInTheDocument();
    expect(appele).toBe(false);
  });
});
