'use client';

import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui/form';

interface OcularTensionFormProps {
  namePrefix?: string;
}

/**
 * Ocular Tension Form Component
 * Shared between Child and Adult exams
 *
 * FIELDS:
 * - OD (0–50 mmHg)
 * - OG (0–50 mmHg)
 *
 * IMPORTANT: NO "Traitement hypotonisant" per specs
 *
 * DESIGN: Simple numeric inputs
 */
export function OcularTensionForm({ namePrefix = '' }: OcularTensionFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';

  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Tension Oculaire
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Pression intraoculaire (0-50 mmHg)
        </p>
      </div>

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
                    min="0"
                    max="50"
                    placeholder="0-50"
                    className="pr-12"
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
                    min="0"
                    max="50"
                    placeholder="0-50"
                    className="pr-12"
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
