import { AlertTriangle, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { KpiCard } from '@/components/ui/kpi-card/kpi-card';

import type { CohortSeverity } from '../../types/types';

const ANIMATION_DURATION_MS = 600;

/**
 * Compteur animé léger (rAF, pas de lib). Anime de 0 vers `target`
 * quand `target` change.
 */
const useAnimatedCount = (target: number): number => {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / ANIMATION_DURATION_MS, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target]);

  return value;
};

type CohortKpiHeaderProps = {
  total: number;
  severity: CohortSeverity;
};

const SEVERITY_SUBTITLE: Record<CohortSeverity, string> = {
  high: 'Critère à sévérité élevée',
  medium: 'Critère à sévérité modérée',
  low: 'Critère à sévérité faible',
};

export const CohortKpiHeader = ({ total, severity }: CohortKpiHeaderProps) => {
  const animatedTotal = useAnimatedCount(total);

  return (
    <div className="grid grid-cols-2 gap-3">
      <KpiCard
        title="Patients"
        value={animatedTotal}
        subtitle="dans la cohorte"
        icon={Users}
      />
      <KpiCard
        title="Sévérité"
        value={
          severity === 'high'
            ? 'Élevée'
            : severity === 'medium'
              ? 'Modérée'
              : 'Faible'
        }
        subtitle={SEVERITY_SUBTITLE[severity]}
        icon={AlertTriangle}
      />
    </div>
  );
};
