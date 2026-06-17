'use client';

import { type UseFormReturn } from 'react-hook-form';

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
} from '@/components/ui/form';
import { type ClinicalExamFormValues, DIPLOPIE_TYPES, EYE_OPTIONS, EYE_SYMPTOMS } from '@/features/exams/types/schemas';

// Labels pour les symptômes
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

interface PlaintesSectionProps {
  form: UseFormReturn<ClinicalExamFormValues>;
  eyeSymptoms: ClinicalExamFormValues['plaintes']['eye_symptom'] | undefined;
  diplopie: boolean | undefined;
  strabisme: boolean | undefined;
  nystagmus: boolean | undefined;
  ptosis: boolean | undefined;
}

export function PlaintesSection({
  form,
  eyeSymptoms,
  diplopie,
  strabisme,
  nystagmus,
  ptosis,
}: PlaintesSectionProps) {
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

      {/* Symptômes oculaires - Multi-select */}
      <FormField
        control={form.control}
        name="plaintes.eye_symptom"
        render={() => (
          <FormItem>
            <FormLabel>
              Symptômes oculaires{' '}
              <span className="text-destructive">*</span>
            </FormLabel>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {EYE_SYMPTOMS.map((symptom) => (
                <FormField
                  key={symptom}
                  control={form.control}
                  name="plaintes.eye_symptom"
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
                                currentValue.filter((v) => v !== symptom),
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

      {/* Champ Autre - conditionnel */}
      {eyeSymptoms?.includes('AUTRES') && (
        <FormField
          control={form.control}
          name="plaintes.autre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Précisez le symptôme{' '}
                <span className="text-destructive">*</span>
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

      {/* Diplopie */}
      <div className="space-y-3 rounded-md border border-border p-4">
        <FormField
          control={form.control}
          name="plaintes.diplopie"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Diplopie</FormLabel>
                <FormDescription>Vision double</FormDescription>
              </div>
            </FormItem>
          )}
        />
        {diplopie && (
          <FormField
            control={form.control}
            name="plaintes.diplopie_type"
            render={({ field }) => (
              <FormItem className="ml-6">
                <FormLabel>
                  Type de diplopie{' '}
                  <span className="text-destructive">*</span>
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
      </div>

      {/* Strabisme */}
      <div className="space-y-3 rounded-md border border-border p-4">
        <FormField
          control={form.control}
          name="plaintes.strabisme"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Strabisme</FormLabel>
                <FormDescription>Déviation des yeux</FormDescription>
              </div>
            </FormItem>
          )}
        />
        {strabisme && (
          <FormField
            control={form.control}
            name="plaintes.strabisme_type"
            render={({ field }) => (
              <FormItem className="ml-6">
                <FormLabel>
                  Type de strabisme{' '}
                  <span className="text-destructive">*</span>
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
                    {['CONVERGEANT', 'DIVERGEANT'].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
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

      {/* Nystagmus */}
      <div className="space-y-3 rounded-md border border-border p-4">
        <FormField
          control={form.control}
          name="plaintes.nystagmus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Nystagmus</FormLabel>
                <FormDescription>
                  Mouvements oculaires involontaires
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        {nystagmus && (
          <FormField
            control={form.control}
            name="plaintes.nystagmus_eye"
            render={({ field }) => (
              <FormItem className="ml-6">
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

      {/* Ptosis */}
      <div className="space-y-3 rounded-md border border-border p-4">
        <FormField
          control={form.control}
          name="plaintes.ptosis"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Ptosis</FormLabel>
                <FormDescription>
                  Chute de la paupière supérieure
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        {ptosis && (
          <FormField
            control={form.control}
            name="plaintes.ptosis_eye"
            render={({ field }) => (
              <FormItem className="ml-6">
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
    </section>
  );
}
