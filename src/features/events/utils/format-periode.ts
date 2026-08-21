import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

/**
 * Libellé de la période d'un événement, sur un ou plusieurs jours.
 *
 * `dateFin` est NULL pour l'immense majorité des événements — c'est la valeur
 * normale de l'historique, pas une donnée manquante. Elle signifie « une seule
 * journée », et le libellé doit alors rester celui d'avant : afficher une
 * plage « du 14 au 14 » serait une régression de lisibilité.
 *
 * Sur plusieurs jours, les heures se rattachent chacune à leur date : un
 * événement peut commencer à 14h et se terminer à 9h, ce qui n'a de sens
 * qu'en montrant les deux dates.
 */
export function formatPeriodeEvenement(
  dateDebut: string,
  heureDebut: string,
  heureFin: string,
  dateFin?: string | null,
): string {
  const debut = dayjs(dateDebut);
  const hDebut = heureDebut?.slice(0, 5) ?? '';
  const hFin = heureFin?.slice(0, 5) ?? '';

  const surPlusieursJours = !!dateFin && !dayjs(dateFin).isSame(debut, 'day');

  if (!surPlusieursJours) {
    return `${debut.format('DD MMM YYYY')} · ${hDebut} – ${hFin}`;
  }

  const fin = dayjs(dateFin);
  return `du ${debut.format('DD MMM')} ${hDebut} au ${fin.format('DD MMM YYYY')} ${hFin}`;
}

/** Vrai si l'événement s'étend sur plus d'une journée. */
export function estSurPlusieursJours(
  dateDebut: string,
  dateFin?: string | null,
): boolean {
  return !!dateFin && !dayjs(dateFin).isSame(dayjs(dateDebut), 'day');
}
