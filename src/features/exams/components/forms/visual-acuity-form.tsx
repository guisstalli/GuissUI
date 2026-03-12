'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const PARINAUD_VALUES = [
  '1.5',
  '2',
  '2.5',
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
  '14',
];

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

  const correction = useWatch({
    control: form.control,
    name: `${prefix}correction`,
  });

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Acuité Visuelle
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Mesures d&apos;acuité visuelle et de correction
        </p>
      </div>

      {/* Parinaud & Correction Options */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`${prefix}parinaud`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parinaud (Vision de près)</FormLabel>
              <Select
                onValueChange={(val) =>
                  field.onChange(val ? Number(val) : null)
                }
                value={field.value?.toString() ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PARINAUD_VALUES.map((val) => (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}correction`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Surcorrection / Avec Correction</FormLabel>
                <FormDescription>
                  Activer pour saisir les valeurs avec surcorrection
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Section Sans correction (AVSC) */}
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

      {/* CHAMPS AVEC CORRECTION CONDITIONNELS */}
      {correction && (
        <div className="border-medical-info/20 bg-medical-info/5 space-y-6 rounded-lg border p-4">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-medical-info">
              Sans Correction + Avec Surcorrection (AVSC avec correction)
            </Label>
            <div className="grid grid-cols-3 gap-4">
              {['od', 'og', 'odg'].map((eye) => (
                <FormField
                  key={`avsc_${eye}_avec_correction`}
                  control={form.control}
                  name={`${prefix}avsc_${eye}_avec_correction`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase">
                        {eye} + Corr
                      </FormLabel>
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
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold text-medical-info">
              Avec Correction + Avec Surcorrection (AVAC avec correction)
            </Label>
            <div className="grid grid-cols-3 gap-4">
              {['od', 'og', 'odg'].map((eye) => (
                <FormField
                  key={`avac_${eye}_avec_correction`}
                  control={form.control}
                  name={`${prefix}avac_${eye}_avec_correction`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase">
                        {eye} + Corr
                      </FormLabel>
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
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
