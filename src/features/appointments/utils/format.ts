import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/** `'14:30:00'` → `'14:30'`. */
export function formatSlot(slot: string): string {
  return slot.slice(0, 5);
}

/**
 * `'2024-06-25'` → `'mardi 25 juin 2024'`. Utilise `parseISO` pour parser la
 * date en heure locale (et non en UTC, ce que ferait `new Date('2024-06-25')`
 * — décalage d'un jour dans les fuseaux positifs).
 */
export function formatDateFr(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE d MMMM yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}
