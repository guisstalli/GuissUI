import { describe, expect, test, vi } from 'vitest';

import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import {
  AnalyticsLoadingState,
  AnalyticsErrorState,
  AnalyticsEmptyState,
} from '../analytics-states';

describe('AnalyticsLoadingState', () => {
  test('renders skeleton placeholders', () => {
    const { container } = rtlRender(<AnalyticsLoadingState />);
    // The loading state renders animate-pulse skeleton divs
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('AnalyticsErrorState', () => {
  test('renders the "Erreur de chargement" heading', () => {
    rtlRender(<AnalyticsErrorState />);
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  test('renders the default error message', () => {
    rtlRender(<AnalyticsErrorState />);
    expect(
      screen.getByText(
        'Une erreur est survenue lors du chargement des analytiques.',
      ),
    ).toBeInTheDocument();
  });

  test('renders a custom error message when provided', () => {
    rtlRender(<AnalyticsErrorState message="Erreur réseau." />);
    expect(screen.getByText('Erreur réseau.')).toBeInTheDocument();
  });

  test('does not render a retry button when onRetry is not provided', () => {
    rtlRender(<AnalyticsErrorState />);
    expect(
      screen.queryByRole('button', { name: /réessayer/i }),
    ).not.toBeInTheDocument();
  });

  test('renders a retry button when onRetry is provided', () => {
    rtlRender(<AnalyticsErrorState onRetry={() => {}} />);
    expect(
      screen.getByRole('button', { name: /réessayer/i }),
    ).toBeInTheDocument();
  });

  test('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();
    rtlRender(<AnalyticsErrorState onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: /réessayer/i }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  test('shows "Réessai..." text and disables button when isRetrying is true', () => {
    rtlRender(<AnalyticsErrorState onRetry={() => {}} isRetrying />);
    const button = screen.getByRole('button', { name: /réessai/i });
    expect(button).toBeDisabled();
  });
});

describe('AnalyticsEmptyState', () => {
  test('renders the default empty state title', () => {
    rtlRender(<AnalyticsEmptyState />);
    expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument();
  });

  test('renders the default empty state description', () => {
    rtlRender(<AnalyticsEmptyState />);
    expect(
      screen.getByText('Modifiez vos filtres pour voir les résultats.'),
    ).toBeInTheDocument();
  });

  test('renders a custom title when provided', () => {
    rtlRender(<AnalyticsEmptyState title="Pas de données pour ce site." />);
    expect(
      screen.getByText('Pas de données pour ce site.'),
    ).toBeInTheDocument();
  });

  test('renders a custom description when provided', () => {
    rtlRender(
      <AnalyticsEmptyState description="Essayez une autre période." />,
    );
    expect(screen.getByText('Essayez une autre période.')).toBeInTheDocument();
  });
});
