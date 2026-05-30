'use client';

import { Loader2, Pill, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Input } from '@/components/ui/form/input';
import { cn } from '@/lib/utils';

import {
  type FormeGalenique,
  type Medicament,
  useMedicamentSearch,
} from '../api/get-medicaments';

interface MedicamentSelectorProps {
  /** Valeur affichée dans l'input (nom prescrit) */
  value: string;
  /** Pré-remplit le champ texte (cf. saisie manuelle) */
  onTextChange: (value: string) => void;
  /** Appelé quand un médicament du référentiel est sélectionné */
  onSelect: (medicament: Medicament) => void;
  forme?: FormeGalenique;
  placeholder?: string;
  className?: string;
}

/**
 * Autocomplete médicaments — appuyé sur le pattern ICDSelector.
 *
 * - Debounce 300 ms (suffisamment rapide pour rester réactif, suffisamment
 *   espacé pour éviter de saturer le backend pendant la frappe).
 * - Dropdown ouvert dès >= 3 caractères saisis.
 * - Click sur résultat → onSelect(medicament) (le parent pré-remplit forme/dosage/...)
 * - Le médecin peut quand même saisir un nom libre (onTextChange).
 */
export function MedicamentSelector({
  value,
  onTextChange,
  onSelect,
  forme,
  placeholder = 'Rechercher (DCI ou nom commercial)…',
  className,
}: MedicamentSelectorProps) {
  const [query, setQuery] = useState(value);
  const [debounced, setDebounced] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounce — 300 ms est un bon compromis (suffisamment rapide pour rester
  // réactif, suffisamment espacé pour éviter de saturer le backend pendant la
  // frappe).
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useMedicamentSearch(
    debounced,
    forme,
  );

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // On ouvre le dropdown dès qu'il y a au moins 1 caractère tapé. En dessous
  // de 3 caractères on affiche un message d'aide ("Tapez au moins 3
  // caractères") plutôt que de laisser l'utilisateur dans le vide. Aligné
  // avec le backend qui exige 3 caractères minimum pour interroger RxNorm.
  const showDropdown = open && debounced.trim().length >= 1;
  const tooShort = debounced.trim().length > 0 && debounced.trim().length < 3;

  const handleSelect = (m: Medicament) => {
    onTextChange(m.nom_commercial || m.dci);
    onSelect(m);
    setOpen(false);
  };

  const sortedResults = useMemo(() => results, [results]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            onTextChange(v);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-8"
        />
        {isFetching && (
          <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute inset-x-0 z-[100] mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {tooShort ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Tapez au moins 3 caractères (DCI ou nom commercial)…
            </div>
          ) : isFetching && sortedResults.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Recherche…
            </div>
          ) : sortedResults.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Aucun résultat
            </div>
          ) : (
            <div
              role="listbox"
              aria-label="Résultats de recherche de médicaments"
              className="py-1"
            >
              {sortedResults.map((m, index) => {
                const dciDisplay = m.dci
                  ? m.dci.charAt(0).toUpperCase() + m.dci.slice(1)
                  : m.dci;
                const showNomAffiche =
                  m.nom_affiche &&
                  m.nom_affiche.toLowerCase() !== m.dci.toLowerCase();
                return (
                  <button
                    key={`${m.source}-${m.cis ?? m.id ?? m.dci}-${index}`}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => handleSelect(m)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <Pill className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">
                      <span className="block font-semibold text-foreground">
                        {dciDisplay}
                      </span>
                      {showNomAffiche && (
                        <span className="block text-xs text-muted-foreground">
                          {m.nom_affiche}
                        </span>
                      )}
                      {m.forme_galenique_label && (
                        <span className="block text-[11px] text-muted-foreground">
                          {m.forme_galenique_label}
                          {m.dosage ? ` · ${m.dosage}` : ''}
                          {m.atc_code ? ` · ${m.atc_code}` : ''}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      {m.source === 'local' && (
                        <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-400/20 dark:text-blue-300">
                          Local
                        </span>
                      )}
                      {m.source === 'bdpm' && (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300">
                          BDPM
                        </span>
                      )}
                      {m.source === 'bdpm' && m.enriched && (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-400/20 dark:text-amber-300">
                          Enrichi
                        </span>
                      )}
                      {m.source === 'bdpm_fallback' && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                          BDPM (cache)
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
