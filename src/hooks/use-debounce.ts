import { useEffect, useState } from 'react';

/**
 * Retourne une copie de `value` mise à jour seulement après `delay` ms
 * sans changement. À utiliser pour différer les requêtes API déclenchées
 * par une saisie (barres de recherche, combobox) tout en gardant
 * l'affichage de l'input synchrone.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
