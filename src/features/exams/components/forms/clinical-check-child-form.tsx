'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/form';
import { CLINICAL_CHECK_VALUES } from '@/features/exams/types';

interface ClinicalCheckChildFormProps {
  namePrefix?: string;
}

const LABELS: Record<(typeof CLINICAL_CHECK_VALUES)[number], string> = {
  normal: 'Normal',
  anormal: 'Anormal',
};

/**
 * Clinical Check Child Form Component
 * Child exam ONLY
 *
 * This REPLACES adult biomicroscopy for child exams
 *
 * FIELDS:
 * - Reflet Pupillaire: Normal / Abnormal
 *   → reflet_pupillaire_detail: REQUIRED if anormal
 * - Fond d'œil (FO): Normal / Abnormal
 *   → fo_detail: REQUIRED if anormal
 */
export function ClinicalCheckChildForm({
  namePrefix = '',
}: ClinicalCheckChildFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';

  // Watch for conditional field display
  const refletPupillaire = useWatch({
    control: form.control,
    name: `${prefix}reflet_pupillaire`,
  });

  const fondOeil = useWatch({
    control: form.control,
    name: `${prefix}fond_oeil`,
  });

  // Auto-cleanup: clear detail when normal
  useEffect(() => {
    if (refletPupillaire !== 'anormal') {
      form.setValue(`${prefix}reflet_pupillaire_detail`, null);
    }
  }, [refletPupillaire, form, prefix]);

  useEffect(() => {
    if (fondOeil !== 'anormal') {
      form.setValue(`${prefix}fo_detail`, null);
    }
  }, [fondOeil, form, prefix]);

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Examen Clinique Simplifié
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Contrôle clinique pédiatrique
        </p>
      </div>

      <div className="space-y-6">
        {/* Reflet Pupillaire */}
        <div className="rounded-md border border-border p-4">
          <FormField
            control={form.control}
            name={`${prefix}reflet_pupillaire`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Reflet Pupillaire
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                    className="mt-2 flex gap-6"
                  >
                    {CLINICAL_CHECK_VALUES.map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={value}
                          id={`${prefix}reflet-${value}`}
                        />
                        <label
                          htmlFor={`${prefix}reflet-${value}`}
                          className={`cursor-pointer text-sm ${
                            value === 'anormal' ? 'text-destructive' : ''
                          }`}
                        >
                          {LABELS[value]}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional: reflet_pupillaire_detail */}
          {refletPupillaire === 'anormal' && (
            <FormField
              control={form.control}
              name={`${prefix}reflet_pupillaire_detail`}
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-sm font-medium">
                    Détail de l&apos;anomalie{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Décrivez l'anomalie du reflet pupillaire..."
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Fond d'œil */}
        <div className="rounded-md border border-border p-4">
          <FormField
            control={form.control}
            name={`${prefix}fond_oeil`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Fond d&apos;œil (FO)
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                    className="mt-2 flex gap-6"
                  >
                    {CLINICAL_CHECK_VALUES.map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={value}
                          id={`${prefix}fo-${value}`}
                        />
                        <label
                          htmlFor={`${prefix}fo-${value}`}
                          className={`cursor-pointer text-sm ${
                            value === 'anormal' ? 'text-destructive' : ''
                          }`}
                        >
                          {LABELS[value]}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional: fo_detail */}
          {fondOeil === 'anormal' && (
            <FormField
              control={form.control}
              name={`${prefix}fo_detail`}
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-sm font-medium">
                    Détail de l&apos;anomalie{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Décrivez l'anomalie du fond d'œil..."
                      className="mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </section>
  );
}
