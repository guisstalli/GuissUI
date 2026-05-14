import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import { FactureStatusBadge } from '../facture-status-badge';

describe('FactureStatusBadge', () => {
  test('displays the fallback label for statut "brouillon"', () => {
    rtlRender(<FactureStatusBadge statut="brouillon" />);
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
  });

  test('displays the fallback label for statut "emise"', () => {
    rtlRender(<FactureStatusBadge statut="emise" />);
    expect(screen.getByText('Émise')).toBeInTheDocument();
  });

  test('displays the fallback label for statut "payee"', () => {
    rtlRender(<FactureStatusBadge statut="payee" />);
    expect(screen.getByText('Payée')).toBeInTheDocument();
  });

  test('displays the fallback label for statut "annulee"', () => {
    rtlRender(<FactureStatusBadge statut="annulee" />);
    expect(screen.getByText('Annulée')).toBeInTheDocument();
  });

  test('prefers statut_display over the built-in fallback label', () => {
    rtlRender(
      <FactureStatusBadge
        statut="emise"
        statut_display="Facture émise (personnalisé)"
      />,
    );
    expect(
      screen.getByText('Facture émise (personnalisé)'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Émise')).not.toBeInTheDocument();
  });

  test('renders all four statut values without throwing', () => {
    const statuts = ['brouillon', 'emise', 'payee', 'annulee'] as const;
    for (const statut of statuts) {
      const { container } = rtlRender(<FactureStatusBadge statut={statut} />);
      expect(container).not.toBeEmptyDOMElement();
    }
  });
});
