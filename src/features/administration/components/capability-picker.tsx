'use client';

import { useMemo } from 'react';

import { Checkbox } from '@/components/ui/checkbox/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { CapabilityRegistryItem } from '../types/schemas';

type CapabilityPickerProps = {
  registry: CapabilityRegistryItem[];
  selected: Set<string>;
  onToggle: (code: string) => void;
};

/** Sélecteur de capacités, regroupées par catégorie, avec cases à cocher. */
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
    return Array.from(byCategory.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [registry]);

  if (registry.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune capacité disponible.
      </p>
    );
  }

  return (
    <ScrollArea className="h-64 rounded-md border border-input">
      <div className="space-y-4 p-3">
        {grouped.map(([category, items]) => (
          <fieldset key={category} className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {category}
            </legend>
            <div className="space-y-1.5">
              {items.map((item) => (
                <label
                  key={item.code}
                  className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 hover:bg-muted"
                >
                  <Checkbox
                    checked={selected.has(item.code)}
                    onCheckedChange={() => onToggle(item.code)}
                    className="mt-0.5"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm text-foreground">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </ScrollArea>
  );
}
