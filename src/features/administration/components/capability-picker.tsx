'use client';

import { Check, Minus } from 'lucide-react';
import { useMemo } from 'react';

import { Checkbox } from '@/components/ui/checkbox/checkbox';
import { cn } from '@/utils/cn';

import type { CapabilityRegistryItem } from '../types/schemas';

type CapabilityPickerProps = {
  registry: CapabilityRegistryItem[];
  selected: Set<string>;
  onToggle: (code: string) => void;
};

/** Libellés de catégorie — le registre serveur renvoie des clés techniques. */
const CATEGORIES: Record<string, string> = {
  dossiers: 'Dossiers patients',
  examens: 'Examens',
  activite: 'Activité',
  configuration: 'Configuration',
  analytique: 'Analytique',
  facturation: 'Facturation',
  ia: 'Assistant IA',
  administration: 'Administration',
};

/** Du métier quotidien vers l'administration — pas l'ordre alphabétique. */
const ORDRE = [
  'dossiers',
  'examens',
  'activite',
  'analytique',
  'facturation',
  'ia',
  'configuration',
  'administration',
];

/**
 * Sélecteur de capacités.
 *
 * Trois partis pris.
 *
 * PLUS DE HAUTEUR FIXE. L'ancienne version enfermait le registre dans un
 * `h-64` : avec 23 capacités sur 8 catégories, on n'en voyait qu'un huitième,
 * et il fallait faire défiler pour comprendre ce qu'on accordait. Le contenu
 * s'étale désormais sur deux colonnes dès qu'il y a la place ; c'est le
 * dialogue qui porte le défilement.
 *
 * UNE CASE PAR CATÉGORIE. Accorder « tous les examens » est le geste réel d'un
 * administrateur ; le forcer à cocher quatre lignes une à une est une friction
 * gratuite. L'état indéterminé rend une sélection partielle lisible d'un coup
 * d'œil.
 *
 * LE CODE TECHNIQUE RESTE VISIBLE. C'est lui qui figure dans le journal de
 * sécurité et dans le code : le masquer rendrait tout diagnostic impossible.
 */
export function CapabilityPicker({
  registry,
  selected,
  onToggle,
}: CapabilityPickerProps) {
  const grouped = useMemo(() => {
    const byCategory = new Map<string, CapabilityRegistryItem[]>();
    for (const item of registry) {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    }
    return Array.from(byCategory.entries()).sort(
      (a, b) =>
        (ORDRE.indexOf(a[0]) + 1 || 99) - (ORDRE.indexOf(b[0]) + 1 || 99),
    );
  }, [registry]);

  if (registry.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune capacité disponible. Un <code>migrate</code> est peut-être
        nécessaire pour synchroniser le registre.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-border pb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Capacités accordées
        </span>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {selected.size}
          <span className="text-muted-foreground">/{registry.length}</span>
        </span>
      </div>

      <div className="columns-1 gap-x-6 md:columns-2">
        {grouped.map(([category, items]) => {
          const codes = items.map((i) => i.code);
          const retenus = codes.filter((c) => selected.has(c)).length;
          const toutes = retenus === codes.length;
          const partiel = retenus > 0 && !toutes;
          const titre = CATEGORIES[category] ?? category;

          return (
            <fieldset
              key={category}
              // `break-inside-avoid` : sans cela une catégorie se coupe entre
              // les deux colonnes et sa légende se retrouve orpheline.
              className="mb-5 break-inside-avoid"
            >
              <legend className="mb-1.5 flex w-full items-center justify-between gap-2">
                <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-foreground">
                  {titre}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    // Tout décocher si tout est pris, tout cocher sinon.
                    codes.forEach((code) => {
                      if (toutes ? selected.has(code) : !selected.has(code)) {
                        onToggle(code);
                      }
                    });
                  }}
                  className={cn(
                    'flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.7rem]',
                    'font-mono tabular-nums text-muted-foreground transition-colors',
                    'hover:bg-muted hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                  aria-label={
                    toutes
                      ? `Tout retirer : ${titre}`
                      : `Tout accorder : ${titre}`
                  }
                >
                  {toutes ? (
                    <Check className="size-3" aria-hidden />
                  ) : partiel ? (
                    <Minus className="size-3" aria-hidden />
                  ) : null}
                  {retenus}/{codes.length}
                </button>
              </legend>

              <div className="space-y-px">
                {items.map((item) => {
                  const actif = selected.has(item.code);
                  return (
                    <label
                      key={item.code}
                      className={cn(
                        'flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5',
                        'border-l-2 transition-colors',
                        actif
                          ? 'border-l-primary bg-primary/5'
                          : 'border-l-transparent hover:bg-muted/60',
                      )}
                    >
                      <Checkbox
                        checked={actif}
                        onCheckedChange={() => onToggle(item.code)}
                        className="mt-0.5 shrink-0"
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="text-sm leading-snug text-foreground">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-xs leading-snug text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                        <span className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground/70">
                          {item.code}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
