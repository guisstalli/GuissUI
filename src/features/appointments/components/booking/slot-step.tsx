import { Clock } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

import { useDisponibilites } from '../../api/get-disponibilites';
import { formatDateFr } from '../../utils/format';

import { SlotGrid } from './slot-grid';

const SKELETON_KEYS = Array.from({ length: 8 }, (_, i) => `slot-skel-${i}`);

/** Heure (0-23) d'un créneau `'HH:MM'`/`'HH:MM:SS'`, ou `NaN` si malformé. */
function slotHour(slot: string): number {
  return parseInt(slot.split(':')[0], 10);
}

export function SlotStep({
  selectedDate,
  selectedSlot,
  onSelect,
}: {
  selectedDate: string;
  selectedSlot: string | null;
  onSelect: (s: string) => void;
}) {
  const { data: dispos, isLoading } = useDisponibilites(selectedDate);

  const slots = dispos?.slots ?? [];
  const morning = slots.filter((s) => slotHour(s) < 12);
  const afternoon = slots.filter((s) => slotHour(s) >= 12);
  const showLabels = morning.length > 0 && afternoon.length > 0;

  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
        <Clock className="size-5 text-cyan-500 dark:text-cyan-400" />
        Choisissez un créneau
      </h2>
      <p className="mb-6 text-sm capitalize text-muted-foreground">
        {formatDateFr(selectedDate)}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-11 rounded-xl" />
          ))}
        </div>
      ) : !slots.length ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-50 p-6 text-center dark:bg-amber-400/[0.06]">
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            Aucun créneau disponible
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez une autre date.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {morning.length > 0 && (
            <div>
              {showLabels && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  ☀︎ Matin
                </p>
              )}
              <SlotGrid
                slots={morning}
                selectedSlot={selectedSlot}
                onSelect={onSelect}
              />
            </div>
          )}
          {afternoon.length > 0 && (
            <div>
              {showLabels && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  ◑ Après-midi
                </p>
              )}
              <SlotGrid
                slots={afternoon}
                selectedSlot={selectedSlot}
                onSelect={onSelect}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
