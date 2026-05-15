import { Badge } from '@/components/ui/badge';

import type { Facture } from '../types/schemas';

interface FactureStatusBadgeProps {
  statut: Facture['statut'];
  statut_display?: string;
}

const STATUT_CLASS: Record<Facture['statut'], string> = {
  brouillon:
    'border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
  emise:
    'border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  payee:
    'border-green-300 bg-green-100 text-green-700 dark:border-green-600 dark:bg-green-900/40 dark:text-green-300',
  annulee:
    'border-red-300 bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-900/40 dark:text-red-300',
};

const STATUT_LABELS: Record<Facture['statut'], string> = {
  brouillon: 'Brouillon',
  emise: 'Émise',
  payee: 'Payée',
  annulee: 'Annulée',
};

export function FactureStatusBadge({
  statut,
  statut_display,
}: FactureStatusBadgeProps) {
  return (
    <Badge variant="outline" className={STATUT_CLASS[statut]}>
      {statut_display ?? STATUT_LABELS[statut]}
    </Badge>
  );
}
