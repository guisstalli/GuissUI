import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

import { formatDateFr } from '../../utils/format';

export function DateStep({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (d: string) => void;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
        <Calendar className="size-5 text-cyan-500 dark:text-cyan-400" />
        Choisissez une date
      </h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Sélectionnez le jour souhaité pour votre consultation.
      </p>

      <div className="mx-auto max-w-xs">
        <label
          htmlFor="date-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Date souhaitée
        </label>
        <input
          id="date-input"
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => onSelect(e.target.value)}
          className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-medium text-foreground transition-all focus:border-cyan-500/50 focus:bg-background focus:outline-none focus:ring-0"
        />
        {selectedDate && (
          <p className="mt-3 text-center text-sm font-medium capitalize text-cyan-600 dark:text-cyan-400">
            {formatDateFr(selectedDate)}
          </p>
        )}
      </div>
    </div>
  );
}
