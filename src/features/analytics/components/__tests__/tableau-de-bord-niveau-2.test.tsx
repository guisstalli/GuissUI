import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import type {
  AnalyticsBiomicroscopy,
  AnalyticsOcularTension,
  AnalyticsRefraction,
  AnalyticsRiskFactors,
  AnalyticsSymptoms,
  AnalyticsVisualAcuity,
  AnalyticsVisualField,
} from '../../types/types';
import { AnalyticsKpiRow } from '../analytics-kpi-row';
import { BiomicroscopyLesions } from '../charts/biomicroscopy-lesions';
import { Effectif } from '../charts/effectif';
import { OcularTensionBarChart } from '../charts/ocular-tension-bar-chart';
import { RefractionDetails } from '../charts/refraction-details';
import { RiskFactorsSection } from '../charts/risk-factors-section';
import { SymptomsGroupedBar } from '../charts/symptoms-grouped-bar';
import { VisualAcuityBarChart } from '../charts/visual-acuity-bar-chart';
import { VisualFieldSection } from '../charts/visual-field-section';

// Tableau de bord, niveau 2 du plan (C9 à C19) : une règle d'affichage = un test.

describe('C11 — effectif à côté du pourcentage', () => {
  test('affiche le nombre de cas et le total', () => {
    rtlRender(<Effectif count={3} total={24} unit="œil" unitPlural="yeux" />);
    expect(screen.getByText(/3 yeux sur 24/)).toBeInTheDocument();
    expect(screen.queryByText('effectif faible')).not.toBeInTheDocument();
  });

  test('signale un effectif faible sous 10 cas', () => {
    rtlRender(<Effectif count={1} total={1} unit="œil" unitPlural="yeux" />);
    expect(screen.getByText('effectif faible')).toBeInTheDocument();
  });
});

describe('C12 — patients réellement examinés', () => {
  test('la carte et « Activité » partent des patients examinés', () => {
    rtlRender(
      <AnalyticsKpiRow
        data={{
          patients_total: 1195,
          patients_examined: 1086,
          examens_total: 2172,
          age_mean: 30,
          sex_distribution: {},
        }}
      />,
    );
    expect(screen.getByText('1086')).toBeInTheDocument();
    expect(screen.getByText('2.0')).toBeInTheDocument();
  });
});

const acuite: AnalyticsVisualAcuity = {
  filters: {},
  kpis: {
    av_mean: 8.3,
    av_logmar_mean: 0.137,
    av_logmar_decimal: 7.29,
    av_zero_count: 55,
    pct_av_less_than_10: 38.38,
    pct_av_less_than_5: 12.94,
    pct_av_less_than_3: 6.62,
    count_av_less_than_10: 1845,
    count_av_less_than_5: 622,
    count_av_less_than_3: 318,
    sample_size: 4807,
    patients_count: 2415,
  },
  uncorrected_best_eye: {
    sample_size: 2426,
    av_logmar_mean: 0.114,
    av_logmar_decimal: 7.68,
    av_zero_count: 17,
    count_av_less_than_10: 872,
    pct_av_less_than_10: 35.94,
    count_av_less_than_5: 252,
    pct_av_less_than_5: 10.39,
    count_av_less_than_3: 121,
    pct_av_less_than_3: 4.99,
  },
};

describe('C12, C17, C19 — carte acuité', () => {
  test('donne yeux et patients', () => {
    rtlRender(<VisualAcuityBarChart data={acuite} />);
    expect(screen.getByText(/4\s?807 yeux/)).toBeInTheDocument();
    expect(screen.getByText(/2\s?415 patients/)).toBeInTheDocument();
  });

  test('affiche la moyenne LogMAR et le nombre d’yeux à 0', () => {
    rtlRender(<VisualAcuityBarChart data={acuite} />);
    expect(screen.getByText('7.3 / 10')).toBeInTheDocument();
    expect(screen.getByText(/55 yeux à 0/)).toBeInTheDocument();
  });

  test('affiche le second indicateur sans correction au meilleur œil', () => {
    rtlRender(<VisualAcuityBarChart data={acuite} />);
    expect(
      screen.getByText('Sans correction, meilleur œil'),
    ).toBeInTheDocument();
    expect(screen.getByText(/121 examens sur 2426/)).toBeInTheDocument();
  });
});

describe('C14 — tension par œil', () => {
  test('conclusion œil droit et œil gauche', () => {
    const data: AnalyticsOcularTension = {
      filters: {},
      kpis: {
        to_mean: 14.6,
        pct_to_above_21: 7.17,
        pct_to_above_25: 3.26,
        count_to_above_21: 154,
        count_to_above_25: 70,
        sample_size: 2148,
        patients_count: 1085,
      },
      by_eye: {
        od: {
          to_mean: 14.6,
          count_to_above_21: 74,
          pct_to_above_21: 6.88,
          sample_size: 1076,
        },
        og: {
          to_mean: 14.7,
          count_to_above_21: 80,
          pct_to_above_21: 7.46,
          sample_size: 1072,
        },
      },
    };
    rtlRender(<OcularTensionBarChart data={data} />);
    expect(screen.getByText('Œil droit')).toBeInTheDocument();
    expect(screen.getByText('Œil gauche')).toBeInTheDocument();
    expect(screen.getByText(/74 yeux sur 1076/)).toBeInTheDocument();
  });
});

const refraction: AnalyticsRefraction = {
  filters: { exam_type: 'child' },
  kpis: {
    eqs_mean: -0.45,
    pct_myope: 32.15,
    pct_hypermetrope: 32.38,
    pct_normal: 35.46,
    eqs_mean_od: -0.43,
    eqs_mean_og: -0.47,
    eqs_mean_myopes: -2.84,
    eqs_mean_hypermetropes: 1.42,
    anisometropia_count: 235,
    anisometropia_evaluable: 2265,
    astigmatism_count: 1816,
    astigmatism_evaluable: 5001,
    sample_size: 4771,
  },
  severity: {
    myopie: { legere: 1018, moyenne: 341, forte: 175 },
    hypermetropie: { legere: 1423, moyenne: 109, forte: 13 },
  },
};

describe('C13 — réfraction', () => {
  test('EQS moyen œil droit et œil gauche séparés', () => {
    rtlRender(<RefractionDetails data={refraction} />);
    expect(screen.getByText('-0.43 D')).toBeInTheDocument();
    expect(screen.getByText('-0.47 D')).toBeInTheDocument();
  });

  test('anisométropie et astigmatisme avec leurs effectifs', () => {
    rtlRender(<RefractionDetails data={refraction} />);
    expect(screen.getByText(/235 examens sur 2265/)).toBeInTheDocument();
    expect(screen.getByText(/1816 yeux sur 5001/)).toBeInTheDocument();
  });

  test('mention « sans cycloplégie » chez l’enfant seulement', () => {
    const { unmount } = rtlRender(<RefractionDetails data={refraction} />);
    expect(screen.getByText(/sans cycloplégie/)).toBeInTheDocument();
    unmount();
    rtlRender(<RefractionDetails data={{ ...refraction, filters: {} }} />);
    expect(screen.queryByText(/sans cycloplégie/)).not.toBeInTheDocument();
  });
});

describe('C15 — biomicroscopie : lésions seules', () => {
  test('lésion en % de patients et d’yeux examinés', () => {
    const lesions: NonNullable<AnalyticsBiomicroscopy['lesions']> = {
      cristallin: {
        examined_eyes: 4012,
        examined_patients: 1964,
        items: [
          {
            value: 'OPAQUE',
            eyes: 228,
            eyes_pct: 5.68,
            patients: 135,
            patients_pct: 6.87,
          },
        ],
      },
    };
    rtlRender(<BiomicroscopyLesions lesions={lesions} />);
    expect(screen.getByText('Cataracte')).toBeInTheDocument();
    expect(screen.getByText(/135 patients sur 1964/)).toBeInTheDocument();
    expect(screen.getByText(/228 yeux sur 4012/)).toBeInTheDocument();
    expect(screen.queryByText('Normal')).not.toBeInTheDocument();
  });
});

describe('C16 — antécédents', () => {
  test('couverture, non renseigné et détail « autre »', () => {
    const data: AnalyticsRiskFactors = {
      filters: {},
      sample_size: 999,
      coverage: {
        patients_examined: 3196,
        with_record: 999,
        not_recorded: 2197,
        coverage_pct: 31.26,
      },
      screen_usage: {
        uses_screen_pct: 37.8,
        mean_hours_per_day: 6.2,
        screen_users_count: 378,
      },
      family_history: {
        has_familial_pct: 59,
        cecite_pct: 3.5,
        gpao_pct: 8,
        other_pct: 50,
        other_categories: [{ name: 'Amétropie', count: 390, pct: 39.04 }],
      },
      medical_antecedents: {
        has_medical_pct: 45,
        has_ophthalmic_pct: 31,
        top_ophthalmic: [],
        top_medical: [{ name: 'Hypertension essentielle', count: 112 }],
      },
      addiction: {
        has_addiction_pct: 0,
        type_distribution: { TABAGISME_pct: 0, ALCOOL_pct: 0, AUTRES_pct: 0 },
      },
    };
    rtlRender(<RiskFactorsSection data={data} />);
    expect(screen.getByText(/999 patients sur 3196/)).toBeInTheDocument();
    expect(
      screen.getByText(/Non renseigné : 2197 patients/),
    ).toBeInTheDocument();
    expect(screen.getByText('Amétropie')).toBeInTheDocument();
    expect(screen.getByText('Hypertension essentielle')).toBeInTheDocument();
  });
});

describe('C9 — diagnostics sans score d’Esterman', () => {
  const data: AnalyticsSymptoms = {
    filters: { exam_type: 'child' },
    kpis: {
      symptoms: {},
      top_diagnostics: [['9D00.2 - ASTIGMATISME', 3]],
      all_diagnostics: [
        ['9D00.2 - ASTIGMATISME', 3],
        ['9D00.0 - MYOPIE', 1],
      ],
      diagnostics_exam_count: 4,
      esterman_mean: null,
      esterman_sample_size: 0,
    },
  };

  test('la carte s’affiche sans Esterman', () => {
    rtlRender(<SymptomsGroupedBar data={data} />);
    expect(
      screen.getByText('Symptômes et diagnostics (top 10)'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Score Esterman Moyen')).not.toBeInTheDocument();
  });

  test('la liste complète s’ouvre sur demande', async () => {
    rtlRender(<SymptomsGroupedBar data={data} />);
    await userEvent.click(
      screen.getByRole('button', { name: /voir les 2 diagnostics/i }),
    );
    expect(screen.getByText('9D00.0 - MYOPIE')).toBeInTheDocument();
  });
});

describe('C10 — champ visuel des conducteurs', () => {
  test('nombre de conducteurs avec un déficit > 13 %', () => {
    const data: AnalyticsVisualField = {
      filters: {},
      sample_size: 419,
      esterman_mean: 4.6,
      drivers_count: 350,
      drivers_deficit_count: 34,
      defect_distribution: [],
      mean_field_extents: {
        superieure_mean: null,
        inferieure_mean: null,
        horizontal_mean: null,
      },
    };
    rtlRender(<VisualFieldSection data={data} />);
    expect(screen.getByText('Champ visuel — conducteurs')).toBeInTheDocument();
    expect(screen.getByText(/34 conducteurs sur 350/)).toBeInTheDocument();
  });
});
