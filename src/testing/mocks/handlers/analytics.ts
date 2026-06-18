import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type {
  AnalyticsOverview,
  AnalyticsSites,
  CohortResponse,
} from '@/features/analytics/types/types';

export const mockAnalyticsOverview: AnalyticsOverview = {
  filters: {
    analytics_scope: 'population',
    exam_type: 'all',
    age_band: 'all',
    eye_strategy: 'separate',
    exam_scope: 'all',
  },
  population: {
    patients_total: 245,
    examens_total: 312,
    age_mean: 38.5,
    sex_distribution: { H: 140, F: 100, A: 5 },
  },
};

export const mockAnalyticsSites: AnalyticsSites = {
  filters: {
    analytics_scope: 'population',
    exam_type: 'all',
    age_band: 'all',
    eye_strategy: 'separate',
    exam_scope: 'all',
  },
  sites: [
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
  ],
};

export const mockCohortResponse: CohortResponse = {
  limit: 20,
  offset: 0,
  count: 3,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      full_name: 'Amadou Diallo',
      sex: 'H',
      age: 52,
      is_driver: true,
      last_exam_date: '2024-03-15',
    },
    {
      id: 2,
      full_name: 'Fatou Ndiaye',
      sex: 'F',
      age: 47,
      is_driver: false,
      last_exam_date: '2024-02-10',
    },
    {
      id: 3,
      full_name: 'Moussa Sarr',
      sex: 'H',
      age: 61,
      is_driver: true,
      last_exam_date: null,
    },
  ],
  summary: {
    count: 3,
    criterion_label: 'Acuité < 3/10 (Malvoyance)',
    severity: 'high',
  },
};

export const analyticsHandlers = [
  // Cohort drill-down
  http.get(`${env.API_URL}/analytics/cohort/`, () =>
    HttpResponse.json(mockCohortResponse),
  ),

  // Overview
  http.get(`${env.API_URL}/analytics/overview/`, () =>
    HttpResponse.json(mockAnalyticsOverview),
  ),

  // Sites analytics
  http.get(`${env.API_URL}/analytics/sites/`, () =>
    HttpResponse.json(mockAnalyticsSites),
  ),

  // Timeline — minimal stub
  http.get(`${env.API_URL}/analytics/timeline/`, () =>
    HttpResponse.json({
      filters: {
        analytics_scope: 'population',
        exam_type: 'all',
        age_band: 'all',
        eye_strategy: 'separate',
        exam_scope: 'all',
      },
      timeline: [],
    }),
  ),

  // Visual acuity
  http.get(`${env.API_URL}/analytics/visual-acuity/`, () =>
    HttpResponse.json({
      filters: {
        analytics_scope: 'population',
        exam_type: 'all',
        age_band: 'all',
        eye_strategy: 'separate',
        exam_scope: 'all',
      },
      kpis: {
        av_mean: 7.5,
        pct_av_less_than_10: 0.35,
        pct_av_less_than_5: 0.1,
        pct_av_less_than_3: 0.05,
        sample_size: 245,
      },
    }),
  ),

  // Ocular tension
  http.get(`${env.API_URL}/analytics/ocular-tension/`, () =>
    HttpResponse.json({
      filters: {
        analytics_scope: 'population',
        exam_type: 'all',
        age_band: 'all',
        eye_strategy: 'separate',
        exam_scope: 'all',
      },
      kpis: {
        to_mean: 14.5,
        pct_to_above_21: 0.08,
        pct_to_above_25: 0.03,
        sample_size: 230,
      },
    }),
  ),

  // Refraction
  http.get(`${env.API_URL}/analytics/refraction/`, () =>
    HttpResponse.json({
      filters: {
        analytics_scope: 'population',
        exam_type: 'all',
        age_band: 'all',
        eye_strategy: 'separate',
        exam_scope: 'all',
      },
      kpis: {
        eqs_mean: -0.5,
        pct_myope: 0.25,
        pct_hypermetrope: 0.15,
        pct_normal: 0.6,
        sample_size: 200,
      },
    }),
  ),
];
