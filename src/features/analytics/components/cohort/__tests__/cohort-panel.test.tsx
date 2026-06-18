import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { mockCohortResponse } from '@/testing/mocks/handlers/analytics';
import { server } from '@/testing/mocks/server';

// Prevent next-auth from firing async fetch calls that error in jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

import { DEFAULT_ANALYTICS_FILTERS } from '../../../types/types';
import type { CohortCriterion } from '../../../types/types';
import { CohortPanel } from '../cohort-panel';

const COHORT_URL = `${env.API_URL}/analytics/cohort/`;

const criterion: CohortCriterion = {
  type: 'acuity',
  value: 'malvoyance',
  label: 'Acuité < 3/10 (Malvoyance)',
};

function renderPanel(
  overrides: Partial<ComponentProps<typeof CohortPanel>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const onClose = vi.fn();
  const onAnalyze = vi.fn();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const utils = render(
    <CohortPanel
      criterion={criterion}
      appliedFilters={DEFAULT_ANALYTICS_FILTERS}
      onClose={onClose}
      onAnalyze={onAnalyze}
      {...overrides}
    />,
    { wrapper: Wrapper },
  );

  return { ...utils, onClose, onAnalyze };
}

describe('CohortPanel', () => {
  beforeEach(() => {
    server.use(
      http.get(COHORT_URL, () => HttpResponse.json(mockCohortResponse)),
    );
  });

  test('renders the criterion label and the patient list', async () => {
    renderPanel();

    expect(
      await screen.findByText('Acuité < 3/10 (Malvoyance)'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Amadou Diallo')).toBeInTheDocument();
    expect(screen.getByText('Fatou Ndiaye')).toBeInTheDocument();
    expect(screen.getByText('Moussa Sarr')).toBeInTheDocument();
  });

  test('selecting a patient updates the action bar count', async () => {
    const user = userEvent.setup();
    renderPanel();

    await screen.findByText('Amadou Diallo');

    // analyze button starts disabled (0 selected)
    const analyzeButton = screen.getByRole('button', {
      name: /Analyser la cohorte/i,
    });
    expect(analyzeButton).toBeDisabled();

    const checkbox = screen.getByRole('checkbox', {
      name: /Sélectionner Amadou Diallo/i,
    });
    await user.click(checkbox);

    expect(
      screen.getByRole('button', { name: /Analyser la cohorte \(1\)/i }),
    ).toBeEnabled();
    expect(screen.getByText('1 patient(s) sélectionné(s)')).toBeInTheDocument();
  });

  test('exporting CSV triggers a client-side download', async () => {
    const user = userEvent.setup();
    // jsdom does not implement these blob URL methods — define them so we can
    // spy. We keep the real URL constructor so MSW/api-client can still resolve
    // request URLs with `new URL(...)`.
    URL.createObjectURL = URL.createObjectURL ?? (() => 'blob:mock');
    URL.revokeObjectURL = URL.revokeObjectURL ?? (() => undefined);
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock');
    const revokeObjectURL = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    renderPanel();

    await screen.findByText('Amadou Diallo');
    await user.click(
      screen.getByRole('checkbox', { name: /Sélectionner Amadou Diallo/i }),
    );

    const exportButton = screen.getByRole('button', { name: /Exporter CSV/i });
    await user.click(exportButton);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  test('analyzing the cohort calls onAnalyze with the selected ids', async () => {
    const user = userEvent.setup();
    const { onAnalyze } = renderPanel();

    await screen.findByText('Amadou Diallo');
    await user.click(
      screen.getByRole('checkbox', { name: /Sélectionner Fatou Ndiaye/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /Analyser la cohorte/i }),
    );

    expect(onAnalyze).toHaveBeenCalledWith([2]);
  });

  test('select-all checkbox selects every patient on the page', async () => {
    const user = userEvent.setup();
    renderPanel();

    await screen.findByText('Amadou Diallo');

    const table = screen.getByRole('table');
    const selectAll = within(table).getByRole('checkbox', {
      name: /Tout sélectionner/i,
    });
    await user.click(selectAll);

    expect(
      screen.getByRole('button', { name: /Analyser la cohorte \(3\)/i }),
    ).toBeEnabled();
  });

  test('the close button clears the selection and calls onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderPanel();

    await screen.findByText('Amadou Diallo');
    await user.click(
      screen.getByRole('button', { name: /Fermer le panneau cohorte/i }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
