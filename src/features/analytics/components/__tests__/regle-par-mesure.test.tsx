import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import { DEFAULT_ANALYTICS_FILTERS } from '../../types/types';
import { AnalyticsFiltersBar } from '../analytics-filters';

// C20 : une règle par mesure (acuité au meilleur œil, le reste œil par œil),
// plus de réglage global « stratégie œil ».

describe('C20 — plus de réglage « stratégie œil »', () => {
  test('les filtres ne proposent plus la stratégie œil', async () => {
    rtlRender(
      <AnalyticsFiltersBar
        draftFilters={DEFAULT_ANALYTICS_FILTERS}
        sites={[]}
        isApplying={false}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    // Les filtres avancés peuvent être repliés : on les ouvre s'ils le sont.
    const plus = screen.queryByRole('button', {
      name: /filtres avancés|plus de filtres/i,
    });
    if (plus) await userEvent.click(plus);
    expect(screen.queryByText('Stratégie œil')).not.toBeInTheDocument();
    expect(screen.getAllByText('Conducteurs').length).toBeGreaterThan(0);
  });

  test('les filtres par défaut ne portent plus eye_strategy', () => {
    expect('eye_strategy' in DEFAULT_ANALYTICS_FILTERS).toBe(false);
  });
});
