'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Persistance des onglets / sections actifs au rechargement de page.
 *
 * - `usePersistentTabState` : synchronise la valeur dans l'URL (search param)
 *   ET le localStorage. À utiliser pour les onglets « top-level »
 *   (partageables / bookmarkables) : onglet de page, section d'examen.
 * - `usePersistentLocalTabState` : localStorage uniquement. À utiliser pour les
 *   onglets profondément imbriqués (œil OD/OG, segment, rétinoscopie) afin de
 *   garder l'URL lisible tout en restaurant l'état au reload.
 *
 * SSR-safe : aucune lecture de `window`/`localStorage` hors du navigateur.
 */

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // mode privé / quota
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function makeValidator(allowed?: readonly string[]) {
  return (v: string | null | undefined): v is string =>
    !!v && (allowed ? allowed.includes(v) : true);
}

interface PersistentTabOptions {
  /** Nom du search param dans l'URL (ex. 'tab', 'section', 'sub'). */
  paramKey: string;
  /** Clé localStorage namespacée (ex. `guiss.tab.patient.42`). */
  storageKey: string;
  defaultValue: string;
  /** Valeurs autorisées — l'URL et le localStorage ne sont pas fiables. */
  allowed?: readonly string[];
}

/**
 * Onglet persistant dans l'URL + localStorage.
 *
 * Précédence au chargement : param URL valide > localStorage valide > défaut.
 */
export function usePersistentTabState({
  paramKey,
  storageKey,
  defaultValue,
  allowed,
}: PersistentTabOptions): [string, (value: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isValid = makeValidator(allowed);

  const urlValue = searchParams.get(paramKey);
  const [value, setValue] = useState<string>(
    isValid(urlValue) ? urlValue : defaultValue,
  );

  const update = useCallback(
    (next: string) => {
      setValue(next);
      writeStorage(storageKey, next);
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramKey, next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, paramKey, storageKey],
  );

  // Sync si le param URL change de l'extérieur (navigation back/forward).
  useEffect(() => {
    const current = searchParams.get(paramKey);
    if (isValid(current) && current !== value) {
      setValue(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, paramKey]);

  // Au montage : si l'URL n'a pas de param valide, restaurer depuis localStorage.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const current = searchParams.get(paramKey);
    if (isValid(current)) {
      writeStorage(storageKey, current); // garde le localStorage à jour
      return;
    }
    const stored = readStorage(storageKey);
    if (isValid(stored)) {
      update(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, update];
}

/**
 * Reflète une valeur dérivée dans un search param de l'URL (one-way) et
 * renvoie la valeur initiale lue dans l'URL au montage.
 *
 * Utile pour montrer la sous-section active dans l'URL (`?sub=refraction`)
 * sans en faire la source de vérité — la vraie mémoire reste en localStorage.
 * Une chaîne vide supprime le param.
 */
export function useUrlParamMirror(
  paramKey: string,
  value: string,
): string | null {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialRef = useRef<string | null>(null);
  const readRef = useRef(false);
  if (!readRef.current) {
    readRef.current = true;
    initialRef.current = searchParams.get(paramKey);
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (
      params.get(paramKey) === (value || null) ||
      (!value && !params.has(paramKey))
    ) {
      return;
    }
    if (value) {
      params.set(paramKey, value);
    } else {
      params.delete(paramKey);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return initialRef.current;
}

interface PersistentLocalTabOptions {
  storageKey: string;
  defaultValue: string;
  allowed?: readonly string[];
}

/**
 * Onglet persistant dans le localStorage uniquement (URL inchangée).
 * Pour les onglets imbriqués qui ne doivent pas encombrer l'URL.
 */
export function usePersistentLocalTabState({
  storageKey,
  defaultValue,
  allowed,
}: PersistentLocalTabOptions): [string, (value: string) => void] {
  const isValid = makeValidator(allowed);
  const [value, setValue] = useState<string>(defaultValue);

  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const stored = readStorage(storageKey);
    if (isValid(stored) && stored !== value) {
      setValue(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const update = useCallback(
    (next: string) => {
      setValue(next);
      writeStorage(storageKey, next);
    },
    [storageKey],
  );

  return [value, update];
}
