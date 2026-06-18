import { cn } from '@/lib/utils';

import { formatSlot } from '../../utils/format';

export function SlotGrid({
  slots,
  selectedSlot,
  onSelect,
}: {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {slots.map((slot) => (
        <button
          type="button"
          key={slot}
          onClick={() => onSelect(slot)}
          className={cn(
            'rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-150',
            selectedSlot === slot
              ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:border-cyan-400/60 dark:bg-cyan-400/[0.15] dark:text-cyan-300'
              : 'border-border bg-background text-muted-foreground hover:border-border/60 hover:bg-muted/50 hover:text-foreground dark:border-white/[0.10] dark:bg-white/[0.03] dark:hover:border-white/[0.25] dark:hover:bg-white/[0.07]',
          )}
          style={
            selectedSlot === slot
              ? { boxShadow: '0 0 14px rgba(34,211,238,0.1)' }
              : undefined
          }
        >
          {formatSlot(slot)}
        </button>
      ))}
    </div>
  );
}
