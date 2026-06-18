import { useNotifications } from '@/components/ui/notifications';

import type { CohortPatientItem } from '../types/types';

const CSV_HEADERS = [
  'Nom',
  'Sexe',
  'Âge',
  'Conducteur',
  'Dernier examen',
] as const;

const escapeCsvCell = (value: string): string => {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const toCsvRow = (item: CohortPatientItem): string =>
  [
    item.full_name,
    item.sex,
    String(item.age),
    item.is_driver ? 'Oui' : 'Non',
    item.last_exam_date ?? '',
  ]
    .map(escapeCsvCell)
    .join(',');

// BOM UTF-8 pour qu'Excel reconnaisse les accents
const UTF8_BOM = '\uFEFF';

const buildCsvContent = (rows: CohortPatientItem[]): string => {
  const header = CSV_HEADERS.join(',');
  const body = rows.map(toCsvRow).join('\n');
  return `${UTF8_BOM}${header}\n${body}`;
};

/**
 * Génère un CSV client-side de la cohorte (colonnes = écran, aucune PII
 * supplémentaire) et déclenche le téléchargement. Émet un toast de succès.
 */
export const downloadCohortCsv = (rows: CohortPatientItem[]): void => {
  const { addNotification } = useNotifications.getState();

  if (rows.length === 0) {
    addNotification({
      type: 'warning',
      title: 'Export impossible',
      message: 'Aucun patient sélectionné.',
    });
    return;
  }

  const content = buildCsvContent(rows);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `cohorte-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  addNotification({
    type: 'success',
    title: 'Export réussi',
    message: `${rows.length} patient(s) exporté(s) au format CSV.`,
  });
};
