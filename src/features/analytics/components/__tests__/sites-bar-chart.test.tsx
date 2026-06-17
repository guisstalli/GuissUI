import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import { SitesBarChart } from '../charts/sites-bar-chart';
import type { AnalyticsSites } from '../../types';

const mockSitesData: AnalyticsSites['sites'] = [
  {
    site_id: 1,
    site_libelle: 'Dakar - Plateau',
    patients_total: 120,
    examens_total: 160,
    av_mean: 8.5,
    to_mean: 14.2,
  },
  {
    site_id: 2,
    site_libelle: 'Thiès Centre',
    patients_total: 80,
    examens_total: 100,
    av_mean: 7.8,
    to_mean: 13.9,
  },
  {
    site_id: 3,
    site_libelle: 'Ziguinchor',
    patients_total: 45,
    examens_total: 52,
    av_mean: null,
    to_mean: null,
  },
];

describe('SitesBarChart', () => {
  test('renders the card title when data is present', () => {
    rtlRender(<SitesBarChart data={mockSitesData} />);
    expect(
      screen.getByText('Répartition et Statistiques par Sites'),
    ).toBeInTheDocument();
  });

  test('renders the "Volume d\'examens" section heading', () => {
    rtlRender(<SitesBarChart data={mockSitesData} />);
    expect(screen.getByText(/volume d['']examens/i)).toBeInTheDocument();
  });

  test('renders the "Tableau de synthèse" section heading', () => {
    rtlRender(<SitesBarChart data={mockSitesData} />);
    expect(screen.getByText(/tableau de synthèse/i)).toBeInTheDocument();
  });

  test('renders table column headers (Site, Patients, Av moy., TO moy.)', () => {
    rtlRender(<SitesBarChart data={mockSitesData} />);
    expect(screen.getByText('Site')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Av moy.')).toBeInTheDocument();
    expect(screen.getByText('TO moy.')).toBeInTheDocument();
  });

  test('renders a row for each site in the summary table', () => {
    rtlRender(<SitesBarChart data={mockSitesData} />);
    expect(screen.getByText('Dakar - Plateau')).toBeInTheDocument();
    expect(screen.getByText('Thiès Centre')).toBeInTheDocument();
    expect(screen.getByText('Ziguinchor')).toBeInTheDocument();
  });

  test('displays patient counts in the summary table', () => {
    rtlRender(<SitesBarChart data={mockSitesData} />);
    // patients_total values rendered via Cell component
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  test('displays formatted av_mean values', () => {
    rtlRender(<SitesBarChart data={mockSitesData} />);
    // 8.5 formatted as "8.50"
    expect(screen.getByText('8.50')).toBeInTheDocument();
  });

  test('displays "-" when av_mean is null', () => {
    rtlRender(<SitesBarChart data={mockSitesData} />);
    // Ziguinchor has null av_mean and to_mean
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  test('shows empty state message when data is empty', () => {
    rtlRender(<SitesBarChart data={[]} />);
    expect(screen.getByText('Répartition par Sites')).toBeInTheDocument();
    expect(screen.getByText(/aucune donnée site/i)).toBeInTheDocument();
  });

  test('shows empty state message when data is null-like (undefined)', () => {
    // @ts-expect-error — testing defensive null handling
    rtlRender(<SitesBarChart data={undefined} />);
    expect(screen.getByText(/aucune donnée site/i)).toBeInTheDocument();
  });
});
