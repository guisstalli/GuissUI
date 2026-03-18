'use client';

import { useMemo } from 'react';

import { AnalyticsDetailDashboard } from '@/features/analytics/components';
import { buildPatientAnalyticsFilters } from '@/features/analytics/utils';

type PatientAnalyticsTabProps = {
  patientId: number;
};

export function PatientAnalyticsTab({ patientId }: PatientAnalyticsTabProps) {
  const hasValidPatientId = Number.isFinite(patientId) && patientId > 0;

  const filters = useMemo(
    () =>
      buildPatientAnalyticsFilters(patientId, {
        exam_scope: 'all',
        eye_strategy: 'separate',
      }),
    [patientId],
  );

  return (
    <AnalyticsDetailDashboard
      title="Analytiques du patient"
      subtitle="Vue consolidée sur tous les examens du patient."
      filters={filters}
      enabled={hasValidPatientId}
    />
  );
}
