'use client';

import { type UseFormReturn } from 'react-hook-form';

import {
  Checkbox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui/form';
import {
  type ClinicalExamFormValues,
  PBO_VALUES,
} from '@/features/exams/types/schemas';

const PBO_LABELS: Record<(typeof PBO_VALUES)[number], string> = {
  NORMAL: 'Normal',
  SCOTOME_CENTRAL: 'Scotome central',
  SCOTOME_PERIPHERIQUE: 'Scotome périphérique',
  AMPUTATION: 'Amputation',
};

interface PerimetrySectionProps {
  form: UseFormReturn<ClinicalExamFormValues>;
}

export function PerimetrySection({ form }: PerimetrySectionProps) {
  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Examens complémentaires
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Examen du champ visuel binoculaire
        </p>
      </div>

      {/* PBO Multi-select */}
      <FormField
        control={form.control}
        name="perimetry.pbo"
        render={() => (
          <FormItem>
            <FormLabel>
              Périmétrie binoculaire <span className="text-destructive">*</span>
            </FormLabel>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
              {PBO_VALUES.map((value) => (
                <FormField
                  key={value}
                  control={form.control}
                  name="perimetry.pbo"
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
                                currentValue.filter((v) => v !== value),
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

      {/* Limites */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <FormField
          control={form.control}
          name="perimetry.limite_superieure"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Limite supérieure (°)</FormLabel>
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
          name="perimetry.limite_inferieure"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Limite inférieure (°)</FormLabel>
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
          name="perimetry.limite_temporale_droit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Limite temporale droite (°)
              </FormLabel>
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
          name="perimetry.limite_temporale_gauche"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Limite temporale gauche (°)
              </FormLabel>
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="perimetry.etendue_horizontal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Étendue horizontale (°)</FormLabel>
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
          name="perimetry.score_esternmen"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                Score d&apos;Esterman (%)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
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
    </section>
  );
}
