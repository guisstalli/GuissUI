import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import type { Facture } from '../../types/schemas';
import { FacturesTable } from '../factures-table';

const mockFacture: Facture = {
  id: 1,
  numero: 'FAC-2026-001',
  site_id: 1,
  site_libelle: 'Centre Nord',
  rendez_vous_id: null,
  rendez_vous_numero: null,
  patient_nom: 'Dupont',
  patient_prenom: 'Alice',
  patient_phone: '+223 70 00 00 01',
  date_emission: '2026-05-10T08:00:00Z',
  statut: 'emise',
  statut_display: 'Émise',
  montant_total: '25000.00',
  montant_total_display: '25 000 FCFA',
  montant_paye: '0.00',
  reste_a_payer: '25000.00',
  notes: '',
  created: '2026-05-10T08:00:00Z',
  modified: '2026-05-10T08:00:00Z',
  lignes: [],
  paiements: [],
};

const mockFacture2: Facture = {
  ...mockFacture,
  id: 2,
  numero: 'FAC-2026-002',
  patient_nom: 'Martin',
  patient_prenom: 'Bob',
  statut: 'payee',
  statut_display: 'Payée',
};

describe('FacturesTable', () => {
  test('renders the table column headers', () => {
    rtlRender(<FacturesTable factures={[]} />);
    expect(screen.getByText('Numéro')).toBeInTheDocument();
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Site')).toBeInTheDocument();
    expect(screen.getByText('Montant')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  test('renders a row for each facture', () => {
    rtlRender(<FacturesTable factures={[mockFacture, mockFacture2]} />);
    expect(screen.getByText('FAC-2026-001')).toBeInTheDocument();
    expect(screen.getByText('FAC-2026-002')).toBeInTheDocument();
  });

  test('displays the patient full name in each row', () => {
    rtlRender(<FacturesTable factures={[mockFacture]} />);
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
  });

  test('displays the phone number when present', () => {
    rtlRender(<FacturesTable factures={[mockFacture]} />);
    expect(screen.getByText('+223 70 00 00 01')).toBeInTheDocument();
  });

  test('displays the site libelle', () => {
    rtlRender(<FacturesTable factures={[mockFacture]} />);
    expect(screen.getByText('Centre Nord')).toBeInTheDocument();
  });

  test('displays the formatted total amount', () => {
    rtlRender(<FacturesTable factures={[mockFacture]} />);
    expect(screen.getByText('25 000 FCFA')).toBeInTheDocument();
  });

  test('renders the status badge for each row', () => {
    rtlRender(<FacturesTable factures={[mockFacture, mockFacture2]} />);
    expect(screen.getByText('Émise')).toBeInTheDocument();
    expect(screen.getByText('Payée')).toBeInTheDocument();
  });

  test('renders an "Ouvrir" link for each row pointing to the right path', () => {
    rtlRender(<FacturesTable factures={[mockFacture]} />);
    const link = screen.getByRole('link', { name: /ouvrir/i });
    expect(link).toHaveAttribute('href', '/facturation/1');
  });

  test('renders an empty table body when no factures are provided', () => {
    rtlRender(<FacturesTable factures={[]} />);
    expect(
      screen.queryByRole('link', { name: /ouvrir/i }),
    ).not.toBeInTheDocument();
  });
});
