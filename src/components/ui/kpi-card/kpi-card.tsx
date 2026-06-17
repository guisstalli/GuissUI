import { ArrowDown, ArrowUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: number;
  className?: string;
  children?: React.ReactNode;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  children,
}: KpiCardProps) {
  const hasTrend = trend !== undefined && trend !== 0;
  const isPositive = (trend ?? 0) > 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
            <Icon className="size-5 text-primary" aria-hidden="true" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {hasTrend && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                isPositive ? 'text-emerald-600' : 'text-destructive',
              )}
              aria-label={`${isPositive ? 'Augmentation' : 'Diminution'} de ${Math.abs(trend ?? 0)}`}
            >
              {isPositive ? (
                <ArrowUp className="size-3" aria-hidden="true" />
              ) : (
                <ArrowDown className="size-3" aria-hidden="true" />
              )}
              {Math.abs(trend ?? 0)}
            </span>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
