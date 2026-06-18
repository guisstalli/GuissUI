import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { CohortSeverity } from '../../types/types';

type CohortSeverityBadgeProps = {
  severity: CohortSeverity;
  label?: string;
  className?: string;
};

const SEVERITY_STYLES: Record<CohortSeverity, string> = {
  high: 'bg-destructive/10 text-destructive border-transparent',
  medium:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent',
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-transparent',
};

const SEVERITY_LABELS: Record<CohortSeverity, string> = {
  high: 'Sévérité élevée',
  medium: 'Sévérité modérée',
  low: 'Sévérité faible',
};

export const CohortSeverityBadge = ({
  severity,
  label,
  className,
}: CohortSeverityBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(SEVERITY_STYLES[severity], className)}
    >
      {label ?? SEVERITY_LABELS[severity]}
    </Badge>
  );
};
