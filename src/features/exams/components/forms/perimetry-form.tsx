'use client';

import { useFormContext } from 'react-hook-form';

import {
  Checkbox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui/form';
import { PBO_VALUES } from '@/features/exams/types';

interface PerimetryFormProps {
  namePrefix?: string;
}

const PBO_LABELS: Record<(typeof PBO_VALUES)[number], string> = {
  NORMAL: 'Normal',
  SCOTOME_CENTRAL: 'Scotome central',
  SCOTOME_PERIPHERIQUE: 'Scotome periphérique',
  AMPUTATION: 'Amputation',
};

/**
 * Perimetry Form Component
 * Adult exam ONLY
 *
 * FIELDS:
 * - Binocular (multi-select)
 * - Limits:
 *   - Up / Down (0–90)
 *   - Left / Right (0–120)
 *   - Horizontal (0–180)
 * - Esterman Score (0–100%)
 */
export function PerimetryForm({ namePrefix = '' }: PerimetryFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';

  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">Périmétrie</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Champ visuel binoculaire
        </p>
      </div>

      {/* PBO Multi-select */}
      <FormField
        control={form.control}
        name={`${prefix}pbo`}
        render={() => (
          <FormItem>
            <FormLabel>
              Champ visuel binoculaire{' '}
              <span className="text-destructive">*</span>
            </FormLabel>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
              {PBO_VALUES.map((value) => (
                <FormField
                  key={value}
                  control={form.control}
                  name={`${prefix}pbo`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(value)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, value]);
                            } else {
                              field.onChange(
                                currentValue.filter((v: string) => v !== value),
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {PBO_LABELS[value]}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Limits */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">
          Limites du champ visuel
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <FormField
            control={form.control}
            name={`${prefix}limite_superieure`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Supérieure (°)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="90"
                    placeholder="0-90"
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
            name={`${prefix}limite_inferieure`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Inférieure (°)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="90"
                    placeholder="0-90"
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
            name={`${prefix}limite_temporale_droit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Temporale Droit (°)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    placeholder="0-120"
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
            name={`${prefix}limite_temporale_gauche`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Temporale Gauche (°)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    placeholder="0-120"
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

        <div className="grid max-w-md grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`${prefix}etendue_horizontal`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  Étendue horizontale (°)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="180"
                    placeholder="0-180"
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
            name={`${prefix}score_esternmen`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Score Esterman (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100%"
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
