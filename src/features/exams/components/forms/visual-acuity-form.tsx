'use client';

import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
} from '@/components/ui/form';

interface VisualAcuityFormProps {
  namePrefix?: string;
}

/**
 * Visual Acuity Form Component
 * Shared between Child and Adult exams
 *
 * FIELDS (decimal 0–10):
 * - AVSC: OD / OG / ODG (Sans Correction)
 * - AVAC: OD / OG / ODG (Avec Correction)
 *
 * DESIGN: Grid layout 3x2 with clear eye labels
 */
export function VisualAcuityForm({ namePrefix = '' }: VisualAcuityFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';

  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Acuité Visuelle
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Mesures d&apos;acuité visuelle (plage : 0 - 10)
        </p>
      </div>

      {/* Sans correction (AVSC) */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">
          Sans Correction (AVSC)
        </Label>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`${prefix}avsc_od`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">OD (Droit)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="10"
                    placeholder="0 - 10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}avsc_og`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">OG (Gauche)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="10"
                    placeholder="0 - 10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}avsc_odg`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">ODG (Binoculaire)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="10"
                    placeholder="0 - 10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Avec correction (AVAC) */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">
          Avec Correction (AVAC)
        </Label>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`${prefix}avac_od`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">OD (Droit)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="10"
                    placeholder="0 - 10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}avac_og`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">OG (Gauche)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="10"
                    placeholder="0 - 10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}avac_odg`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">ODG (Binoculaire)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="10"
                    placeholder="0 - 10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </section>
  );
}
