'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface PachymetryFormProps {
  namePrefix?: string;
}

/**
 * Pachymetry Form Component
 * Partage entre les examens ADULTE (donc conducteurs) et ENFANT
 *
 * FIELDS:
 * - OD / OG (microns)
 * - TO OD / TO OG : tension oculaire, 0–100 mmHg
 *
 * DESIGN: Highlight abnormal values (<400 or >600) — sur l'EPAISSEUR
 */
export function PachymetryForm({ namePrefix = '' }: PachymetryFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';

  const ctoOd = useWatch({ control: form.control, name: `${prefix}cto_od` });
  const ctoOg = useWatch({ control: form.control, name: `${prefix}cto_og` });

  const isAbnormal = (value: number | null | undefined) => {
    if (value === null || value === undefined) return false;
    return value <= 100 || value > 0;
  };

  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">Pachymétrie</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Épaisseur cornéenne centrale (microns)
        </p>
      </div>

      {/* Pachymetry values */}
      <div className="grid w-full grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name={`${prefix}od`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>OD (Droit)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="300"
                    max="800"
                    placeholder="0-100"
                    className="pr-10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    µm
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}og`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>OG (Gauche)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="300"
                    max="800"
                    placeholder="0-100"
                    className="pr-10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    µm
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Tension oculaire (TO) — mmHg, distincte de l'épaisseur ci-dessus. */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">
          Tension Oculaire (TO) — 0 à 100 mmHg
        </p>
        <div className="grid w-full grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name={`${prefix}cto_od`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>TO OD</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      className={cn(
                        'pr-10',
                        isAbnormal(ctoOd) &&
                          'border-destructive focus-visible:ring-destructive/50',
                      )}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      mmHg
                    </span>
                  </div>
                </FormControl>
                {isAbnormal(ctoOd) && (
                  <p className="text-xs text-destructive">Valeur anormale</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}cto_og`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>TO OG</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      className={cn(
                        'pr-10',
                        isAbnormal(ctoOg) &&
                          'border-destructive focus-visible:ring-destructive/50',
                      )}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      mmHg
                    </span>
                  </div>
                </FormControl>
                {isAbnormal(ctoOg) && (
                  <p className="text-xs text-destructive">Valeur anormale</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </section>
  );
}
