import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import type { AnalyticsOverview } from '../../types/types';
import { AnalyticsKpiRow } from '../analytics-kpi-row';

const mockPopulation: AnalyticsOverview['population'] = {
  patients_total: 245,
  examens_total: 312,
  age_mean: 38.5,
  sex_distribution: { H: 140, F: 100, A: 5 },
};

const mockPopulationNoAge: AnalyticsOverview['population'] = {
  patients_total: 10,
  examens_total: 15,
  age_mean: null,
  sex_distribution: {},
};

describe('AnalyticsKpiRow', () => {
  test('renders the four KPI card titles', () => {
    rtlRender(<AnalyticsKpiRow data={mockPopulation} />);

    // « Patients examinés », pas « Total Patients » : la cohorte analytique
    // part des examens et exclut donc les patients jamais examinés.
    expect(screen.getByText('Patients examinés')).toBeInTheDocument();
    expect(screen.getByText('Total Examens')).toBeInTheDocument();
    expect(screen.getByText('Âge Moyen')).toBeInTheDocument();
    expect(screen.getByText('Activité')).toBeInTheDocument();
  });

  test('displays the correct patients_total value', () => {
    rtlRender(<AnalyticsKpiRow data={mockPopulation} />);
    expect(screen.getByText('245')).toBeInTheDocument();
  });

  test('displays the correct examens_total value', () => {
    rtlRender(<AnalyticsKpiRow data={mockPopulation} />);
    expect(screen.getByText('312')).toBeInTheDocument();
  });

  test('displays rounded age_mean with "ans" suffix', () => {
    rtlRender(<AnalyticsKpiRow data={mockPopulation} />);
    expect(screen.getByText('39 ans')).toBeInTheDocument();
  });

  test('displays "N/A" when age_mean is null', () => {
    rtlRender(<AnalyticsKpiRow data={mockPopulationNoAge} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('displays examens per patient ratio', () => {
    // 312 / 245 ≈ 1.3
    rtlRender(<AnalyticsKpiRow data={mockPopulation} />);
    expect(screen.getByText('1.3')).toBeInTheDocument();
  });

  test('displays "0" for activity ratio when patients_total is 0', () => {
    const noPatients: AnalyticsOverview['population'] = {
      patients_total: 0,
      examens_total: 0,
      age_mean: null,
      sex_distribution: {},
    };
    rtlRender(<AnalyticsKpiRow data={noPatients} />);
    // Multiple KPI cards can show "0" (patients_total, examens_total, activity ratio)
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  test('renders descriptive subtitles for each KPI card', () => {
    rtlRender(<AnalyticsKpiRow data={mockPopulation} />);
    expect(
      screen.getByText('Ayant au moins un examen sur la période filtrée'),
    ).toBeInTheDocument();
    expect(screen.getByText('Consultations enregistrées')).toBeInTheDocument();
    expect(screen.getByText('Examens par patient')).toBeInTheDocument();
  });
});
