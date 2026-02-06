'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  Checkbox,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui/form';
import {
  DIPLOPIE_TYPES,
  EYE_OPTIONS,
  EYE_SYMPTOMS,
} from '@/features/exams/types';

interface PlaintesFormProps {
  namePrefix?: string;
}

const SYMPTOM_LABELS: Record<(typeof EYE_SYMPTOMS)[number], string> = {
  AUCUN: 'Aucun',
  BAV: 'Baisse Acuité Visuelle',
  ROUGEUR: 'Rougeur',
  DOULEUR: 'Douleur',
  DIPLOPIE: 'Diplopie',
  STRABISME: 'Strabisme',
  NYSTAGMUS: 'Nystagmus',
  PTOSIS: 'Ptosis',
  PURIT_OCULAIRE: 'Prurit oculaire',
  LARMOIEMENT: 'Larmoiement',
  SECRETIONS: 'Sécrétions',
  AUTRES: 'Autres',
};

const EYE_LABELS: Record<(typeof EYE_OPTIONS)[number], string> = {
  od: 'OD (Droit)',
  og: 'OG (Gauche)',
  odg: 'ODG (Les deux)',
};

/**
 * Plaintes Form Component
 * Adult exam ONLY
 *
 * FIELDS:
 * - Symptoms (multi-select)
 * - Other (required if "AUTRES")
 *
 * CONDITIONAL BOOLEANS:
 * - Diplopie → Type required
 * - Strabisme → Eye required
 * - Nystagmus → Eye required
 * - Ptosis → Eye required
 *
 * DESIGN: Toggle switches, Warning indicators when positive
 */
export function PlaintesForm({ namePrefix = '' }: PlaintesFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';

  // Watchers for conditional fields
  const eyeSymptoms = useWatch({
    control: form.control,
    name: `${prefix}eye_symptom`,
  });
  const diplopie = useWatch({
    control: form.control,
    name: `${prefix}diplopie`,
  });
  const strabisme = useWatch({
    control: form.control,
    name: `${prefix}strabisme`,
  });
  const nystagmus = useWatch({
    control: form.control,
    name: `${prefix}nystagmus`,
  });
  const ptosis = useWatch({ control: form.control, name: `${prefix}ptosis` });

  // Auto-cleanup conditional fields
  useEffect(() => {
    if (!eyeSymptoms?.includes('AUTRES')) {
      form.setValue(`${prefix}autre`, null);
    }
  }, [eyeSymptoms, form, prefix]);

  useEffect(() => {
    if (!diplopie) {
      form.setValue(`${prefix}diplopie_type`, null);
    }
  }, [diplopie, form, prefix]);

  useEffect(() => {
    if (!strabisme) {
      form.setValue(`${prefix}strabisme_eye`, null);
    }
  }, [strabisme, form, prefix]);

  useEffect(() => {
    if (!nystagmus) {
      form.setValue(`${prefix}nystagmus_eye`, null);
    }
  }, [nystagmus, form, prefix]);

  useEffect(() => {
    if (!ptosis) {
      form.setValue(`${prefix}ptosis_eye`, null);
    }
  }, [ptosis, form, prefix]);

  const ConditionalBooleanField = ({
    name,
    label,
    description,
    showEyeSelect = true,
    showTypeSelect = false,
  }: {
    name: string;
    label: string;
    description: string;
    showEyeSelect?: boolean;
    showTypeSelect?: boolean;
  }) => {
    const isActive = useWatch({
      control: form.control,
      name: `${prefix}${name}`,
    });

    return (
      <div className="space-y-3 rounded-md border border-border p-4">
        <FormField
          control={form.control}
          name={`${prefix}${name}`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2">
                  {label}
                  {field.value && (
                    <AlertTriangle className="size-4 text-warning" />
                  )}
                </FormLabel>
                <FormDescription className="text-xs">
                  {description}
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

        {isActive && showTypeSelect && (
          <FormField
            control={form.control}
            name={`${prefix}${name}_type`}
            render={({ field }) => (
              <FormItem className="ml-4">
                <FormLabel>
                  Type <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIPLOPIE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isActive && showEyeSelect && (
          <FormField
            control={form.control}
            name={`${prefix}${name}_eye`}
            render={({ field }) => (
              <FormItem className="ml-4">
                <FormLabel>
                  Œil concerné <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EYE_OPTIONS.map((eye) => (
                      <SelectItem key={eye} value={eye}>
                        {EYE_LABELS[eye]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  };

  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Plaintes / Symptômes
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Sélectionnez les symptômes du patient (minimum 1 requis)
        </p>
      </div>

      {/* Symptoms multi-select */}
      <FormField
        control={form.control}
        name={`${prefix}eye_symptom`}
        render={() => (
          <FormItem>
            <FormLabel>
              Symptômes oculaires <span className="text-destructive">*</span>
            </FormLabel>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {EYE_SYMPTOMS.map((symptom) => (
                <FormField
                  key={symptom}
                  control={form.control}
                  name={`${prefix}eye_symptom`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(symptom)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, symptom]);
                            } else {
                              field.onChange(
                                currentValue.filter(
                                  (v: string) => v !== symptom,
                                ),
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {SYMPTOM_LABELS[symptom]}
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

      {/* Conditional "Autre" field */}
      {eyeSymptoms?.includes('AUTRES') && (
        <FormField
          control={form.control}
          name={`${prefix}autre`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Précisez le symptôme <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Décrivez le symptôme..."
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Conditional boolean fields */}
      <div className="space-y-3">
        <ConditionalBooleanField
          name="diplopie"
          label="Diplopie"
          description="Vision double"
          showEyeSelect={false}
          showTypeSelect={true}
        />
        <ConditionalBooleanField
          name="strabisme"
          label="Strabisme"
          description="Déviation des yeux"
        />
        <ConditionalBooleanField
          name="nystagmus"
          label="Nystagmus"
          description="Mouvements oculaires involontaires"
        />
        <ConditionalBooleanField
          name="ptosis"
          label="Ptosis"
          description="Chute de la paupière supérieure"
        />
      </div>
    </section>
  );
}
