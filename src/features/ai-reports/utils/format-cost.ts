/** Coût stocké en chaîne (DecimalField DRF) → affichage USD à 4 décimales. */
export function formatCost(costUsd: string): string {
  const value = parseFloat(costUsd);
  return Number.isNaN(value) ? '—' : `$${value.toFixed(4)}`;
}
