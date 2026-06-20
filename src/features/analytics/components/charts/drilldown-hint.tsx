import { MousePointerClick } from 'lucide-react';

import { cn } from '@/lib/utils';

type DrilldownHintProps = {
  label?: string;
  className?: string;
};

/**
 * Pastille d'affordance affichée sur les graphes cliquables pour signaler
 * qu'un clic ouvre le panneau cohorte (drill-down).
 */
export const DrilldownHint = ({
  label = 'Cliquez pour explorer la cohorte',
  className,
}: DrilldownHintProps) => (
  <span
    className={cn(
      'inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary',
      className,
    )}
  >
    <MousePointerClick className="size-3" aria-hidden="true" />
    {label}
  </span>
);
