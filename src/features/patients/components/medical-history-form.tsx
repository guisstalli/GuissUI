'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui/form';
import { ICDSelector } from '@/components/ui/icd-selector/icd-selector';
import { Switch } from '@/components/ui/switch';
import { useAntecedent, useUpdateAntecedent } from '@/features/patients/api';
import {
  FAMILIAL_LABELS,
  TYPE_ADDICTION_LABELS,
  TypeAddictionEnum,
} from '@/features/patients/types/schemas';
import { cn } from '@/lib/utils';

// =============================================================================
// SCHEMA
// =============================================================================

const FamilialEnum = z.enum(['CECITE', 'GPAO', 'OTHER']);

const medicalHistorySchema = z
  .object({
    has_antecedents: z.boolean().default(false),
    has_antecedents_medico_chirurgicaux: z.boolean(),
    antecedents_medico_chirurgicaux: z.array(z.string().max(255)),
    has_pathologie_ophtalmologique: z.boolean(),
    pathologie_ophtalmologique: z.array(z.string().max(255)),
    familial: z.array(FamilialEnum),
    autre_familial_detail: z.string().max(255).nullable().optional(),
    uses_screen: z.boolean().nullable(),
    screen_time_hours_per_day: z
      .number()
      .int()
      .min(0)
      .max(24)
      .nullable()
      .optional(),
    // Addictions (conducteurs)
    addiction: z.boolean().default(false),
    type_addiction: z.array(TypeAddictionEnum),
    autre_addiction_detail: z.string().max(255).nullable().optional(),
    tabagisme_detail: z.string().max(50).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.familial.includes('OTHER')) {
        return (
          data.autre_familial_detail &&
          data.autre_familial_detail.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Veuillez préciser l'antécédent familial",
      path: ['autre_familial_detail'],
    },
  );

type MedicalHistoryFormValues = z.infer<typeof medicalHistorySchema>;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface MedicalHistoryFormProps {
  patientId: number;
  hasDriver?: boolean;
}

export function MedicalHistoryForm({
  patientId,
  hasDriver = false,
}: MedicalHistoryFormProps) {
  const { data: antecedent, isLoading } = useAntecedent({
    patientId,
    enabled: !!patientId,
  });

  const updateAntecedentMutation = useUpdateAntecedent();

  // Détermine si c'est une création (pas d'antécédents existants)
  const isNewRecord = !antecedent;

  const form = useForm<MedicalHistoryFormValues>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      has_antecedents: false,
      has_antecedents_medico_chirurgicaux: false,
      antecedents_medico_chirurgicaux: [],
      has_pathologie_ophtalmologique: false,
      pathologie_ophtalmologique: [],
      familial: [],
      autre_familial_detail: null,
      uses_screen: null,
      screen_time_hours_per_day: null,
      addiction: false,
      type_addiction: [],
      autre_addiction_detail: null,
      tabagisme_detail: null,
    },
  });

  // Sync form with API data (only if antecedent exists)
  useEffect(() => {
    if (antecedent) {
      const hasAnyAntecedentData =
        (antecedent.has_antecedents_medico_chirurgicaux ?? false) ||
        (antecedent.antecedents_medico_chirurgicaux || []).length > 0 ||
        (antecedent.has_pathologie_ophtalmologique ?? false) ||
        (antecedent.pathologie_ophtalmologique || []).length > 0 ||
        (antecedent.familial || []).length > 0 ||
        Boolean(antecedent.autre_familial_detail) ||
        Boolean(antecedent.uses_screen) ||
        antecedent.screen_time_hours_per_day !== null;

      form.reset({
        has_antecedents:
          hasAnyAntecedentData || form.getValues('has_antecedents'),
        has_antecedents_medico_chirurgicaux:
          antecedent.has_antecedents_medico_chirurgicaux ??
          (antecedent.antecedents_medico_chirurgicaux || []).length > 0,
        antecedents_medico_chirurgicaux:
          antecedent.antecedents_medico_chirurgicaux || [],
        has_pathologie_ophtalmologique:
          antecedent.has_pathologie_ophtalmologique ??
          (antecedent.pathologie_ophtalmologique || []).length > 0,
        pathologie_ophtalmologique: antecedent.pathologie_ophtalmologique || [],
        familial: antecedent.familial || [],
        autre_familial_detail: antecedent.autre_familial_detail || null,
        uses_screen: antecedent.uses_screen ?? null,
        screen_time_hours_per_day: antecedent.screen_time_hours_per_day ?? null,
        addiction: antecedent.addiction ?? false,
        type_addiction: antecedent.type_addiction || [],
        autre_addiction_detail: antecedent.autre_addiction_detail || null,
        tabagisme_detail: antecedent.tabagisme_detail || null,
      });

      hasHydratedFromApi.current = true;
    }
  }, [antecedent, form]);

  const hasHydratedFromApi = useRef(false);
  const previousHasAntecedents = useRef<boolean | null>(null);

  const hasAntecedents = form.watch('has_antecedents');
  const watchFamilial = form.watch('familial');
  const watchUsesScreen = form.watch('uses_screen');
  const watchScreenTime = form.watch('screen_time_hours_per_day');
  const watchHasMedicoChir = form.watch('has_antecedents_medico_chirurgicaux');
  const watchHasOphtalmo = form.watch('has_pathologie_ophtalmologique');
  const watchAddiction = form.watch('addiction');
  const watchTypeAddiction = form.watch('type_addiction');

  const showOtherFamilialDetail = watchFamilial?.includes('OTHER');
  const showTabagismeDetail = watchTypeAddiction?.includes('TABAGISME');
  const showAutreAddictionDetail = watchTypeAddiction?.includes('AUTRES');

  const buildApiPayload = useCallback(
    (data: MedicalHistoryFormValues) => {
      if (!data.has_antecedents) {
        return {
          patient: patientId,
          has_antecedents_medico_chirurgicaux: false,
          antecedents_medico_chirurgicaux: [],
          has_pathologie_ophtalmologique: false,
          pathologie_ophtalmologique: [],
          familial: [],
          autre_familial_detail: null,
          uses_screen: null,
          screen_time_hours_per_day: null,
          addiction: false,
          type_addiction: [],
          autre_addiction_detail: null,
          tabagisme_detail: null,
        };
      }

      return {
        patient: patientId,
        has_antecedents_medico_chirurgicaux:
          data.has_antecedents_medico_chirurgicaux,
        antecedents_medico_chirurgicaux:
          data.has_antecedents_medico_chirurgicaux
            ? data.antecedents_medico_chirurgicaux
            : [],
        has_pathologie_ophtalmologique: data.has_pathologie_ophtalmologique,
        pathologie_ophtalmologique: data.has_pathologie_ophtalmologique
          ? data.pathologie_ophtalmologique
          : [],
        familial: data.familial,
        autre_familial_detail: data.familial.includes('OTHER')
          ? data.autre_familial_detail
          : null,
        uses_screen: data.uses_screen,
        screen_time_hours_per_day: data.uses_screen
          ? data.screen_time_hours_per_day
          : null,
        addiction: data.addiction,
        type_addiction: data.addiction ? data.type_addiction : [],
        autre_addiction_detail:
          data.addiction && data.type_addiction.includes('AUTRES')
            ? data.autre_addiction_detail
            : null,
        tabagisme_detail:
          data.addiction && data.type_addiction.includes('TABAGISME')
            ? data.tabagisme_detail
            : null,
      };
    },
    [patientId],
  );

  useEffect(() => {
    if (!hasAntecedents) {
      form.setValue('has_antecedents_medico_chirurgicaux', false);
      form.setValue('antecedents_medico_chirurgicaux', []);
      form.setValue('has_pathologie_ophtalmologique', false);
      form.setValue('pathologie_ophtalmologique', []);
      form.setValue('familial', []);
      form.setValue('autre_familial_detail', null);
      form.setValue('uses_screen', null);
      form.setValue('screen_time_hours_per_day', null);
      form.setValue('addiction', false);
      form.setValue('type_addiction', []);
      form.setValue('autre_addiction_detail', null);
      form.setValue('tabagisme_detail', null);
    }
  }, [hasAntecedents, form]);

  useEffect(() => {
    if (previousHasAntecedents.current === null) {
      previousHasAntecedents.current = hasAntecedents;
      return;
    }

    if (!hasHydratedFromApi.current && antecedent) {
      previousHasAntecedents.current = hasAntecedents;
      return;
    }

    const previousValue = previousHasAntecedents.current;
    previousHasAntecedents.current = hasAntecedents;

    if (updateAntecedentMutation.isPending) {
      return;
    }

    if (previousValue === false && hasAntecedents && !antecedent) {
      updateAntecedentMutation.mutate({
        patientId,
        data: buildApiPayload({
          ...form.getValues(),
          has_antecedents: true,
        }),
      });
      return;
    }

    if (previousValue === true && !hasAntecedents && antecedent) {
      updateAntecedentMutation.mutate({
        patientId,
        data: buildApiPayload({
          ...form.getValues(),
          has_antecedents: false,
        }),
      });
    }
  }, [
    antecedent,
    buildApiPayload,
    form,
    hasAntecedents,
    patientId,
    updateAntecedentMutation,
  ]);

  const onSubmit = (data: MedicalHistoryFormValues) => {
    updateAntecedentMutation.mutate({
      patientId,
      data: buildApiPayload(data),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Message informatif si création */}
        {isNewRecord && (
          <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950">
            <FileText className="mt-0.5 size-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <div>
              <p className="font-medium text-sky-800 dark:text-sky-200">
                Aucun antécédent enregistré
              </p>
              <p className="mt-1 text-sm text-sky-700 dark:text-sky-300">
                Ce patient n&apos;a pas encore d&apos;antécédents médicaux
                enregistrés. Remplissez ce formulaire pour créer son dossier
                médical.
              </p>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="has_antecedents"
          render={({ field }) => (
            <FormItem className="bg-muted/20 flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-semibold">
                  Le patient a-t-il des antécédents médicaux ?
                </FormLabel>
                <FormDescription>
                  Activez cette option pour afficher et renseigner les
                  antécédents. Si désactivé, les valeurs sont nettoyées.
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

        {hasAntecedents && (
          <>
            {/* Section 1: Antécédents médico-chirurgicaux */}
            <section className="space-y-4 rounded-lg border border-border p-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Antécédents médico-chirurgicaux
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Le patient a-t-il des antécédents médico-chirurgicaux ?
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="has_antecedents_medico_chirurgicaux"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="text-sm">
                        {field.value ? 'Oui' : 'Non'}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue(
                                'antecedents_medico_chirurgicaux',
                                [],
                              );
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {watchHasMedicoChir && (
                <FormField
                  control={form.control}
                  name="antecedents_medico_chirurgicaux"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <ICDSelector
                        label="Pathologies générales"
                        description="Recherchez et sélectionnez dans la nomenclature ICD-11"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    </FormItem>
                  )}
                />
              )}
            </section>

            {/* Section 2: Pathologies ophtalmologiques */}
            <section className="space-y-4 rounded-lg border border-border p-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Pathologies ophtalmologiques
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Le patient a-t-il des pathologies ophtalmologiques ?
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="has_pathologie_ophtalmologique"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel className="text-sm">
                        {field.value ? 'Oui' : 'Non'}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue('pathologie_ophtalmologique', []);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {watchHasOphtalmo && (
                <FormField
                  control={form.control}
                  name="pathologie_ophtalmologique"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <ICDSelector
                        label=""
                        description="Recherchez et sélectionnez dans la nomenclature ICD-11"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    </FormItem>
                  )}
                />
              )}
            </section>

            {/* Section 3: Antécédents familiaux */}
            <section className="space-y-4 rounded-lg border border-border p-6">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-semibold text-foreground">
                  Antécédents familiaux
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Indiquez les antécédents familiaux ophtalmologiques
                </p>
              </div>
              <FormField
                control={form.control}
                name="familial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d&apos;antécédent</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {(
                        Object.entries(FAMILIAL_LABELS) as [
                          keyof typeof FAMILIAL_LABELS,
                          string,
                        ][]
                      ).map(([key, labelText]) => (
                        <label
                          key={key}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 transition-colors',
                            field.value?.includes(key)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:bg-muted/50',
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={field.value?.includes(key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...(field.value || []), key]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== key) || [],
                                );
                              }
                            }}
                          />
                          <span className="text-sm font-medium">
                            {labelText}
                          </span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional field for OTHER - required when OTHER is selected */}
              {showOtherFamilialDetail && (
                <FormField
                  control={form.control}
                  name="autre_familial_detail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Précisez l&apos;antécédent familial{' '}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Précisez l'antécédent familial"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </section>

            {/* Section 4: Habitudes visuelles */}
            <section className="space-y-4 rounded-lg border border-border p-6">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-semibold text-foreground">
                  Habitudes visuelles
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informations sur l&apos;utilisation d&apos;écrans
                </p>
              </div>

              <FormField
                control={form.control}
                name="uses_screen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utilisation d&apos;écrans</FormLabel>
                    <div className="flex gap-4">
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-lg border px-6 py-2.5 transition-colors',
                          field.value === true
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted/50',
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name="uses_screen"
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                        />
                        <span className="text-sm font-medium">Oui</span>
                      </label>
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-lg border px-6 py-2.5 transition-colors',
                          field.value === false
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted/50',
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name="uses_screen"
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                        />
                        <span className="text-sm font-medium">Non</span>
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional field for screen time - only when uses_screen is true */}
              {watchUsesScreen === true && (
                <FormField
                  control={form.control}
                  name="screen_time_hours_per_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Temps d&apos;écran par jour (heures)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={24}
                          placeholder="Ex: 8"
                          className="w-32"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      {/* Warning for unrealistic values (> 12h) */}
                      {watchScreenTime !== null &&
                        watchScreenTime !== undefined &&
                        watchScreenTime > 12 && (
                          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                            <AlertTriangle className="size-4 shrink-0" />
                            <span>
                              Valeur élevée ({watchScreenTime}h/jour) - Vérifiez
                              cette information
                            </span>
                          </div>
                        )}
                      <FormDescription>
                        Incluez ordinateur, smartphone, tablette, télévision
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </section>

            {/* Section 5: Addictions (conducteurs uniquement) */}
            {hasDriver && (
              <section className="space-y-4 rounded-lg border border-border p-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Addictions
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Habitudes susceptibles d&apos;impacter la conduite
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="addiction"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormLabel className="text-sm">
                          {field.value ? 'Oui' : 'Non'}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (!checked) {
                                form.setValue('type_addiction', []);
                                form.setValue('autre_addiction_detail', null);
                                form.setValue('tabagisme_detail', null);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {watchAddiction && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type_addiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type(s) d&apos;addiction</FormLabel>
                          <div className="flex flex-wrap gap-3">
                            {(
                              Object.entries(
                                TYPE_ADDICTION_LABELS,
                              ) as [
                                keyof typeof TYPE_ADDICTION_LABELS,
                                string,
                              ][]
                            ).map(([key, labelText]) => (
                              <label
                                key={key}
                                className={cn(
                                  'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 transition-colors',
                                  field.value?.includes(key)
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:bg-muted/50',
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={field.value?.includes(key)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([
                                        ...(field.value || []),
                                        key,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value?.filter(
                                          (v) => v !== key,
                                        ) || [],
                                      );
                                    }
                                  }}
                                />
                                <span className="text-sm font-medium">
                                  {labelText}
                                </span>
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {showTabagismeDetail && (
                      <FormField
                        control={form.control}
                        name="tabagisme_detail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Préciser le tabagisme</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: 20 paquets/an, fumeur actif..."
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(e.target.value || null)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {showAutreAddictionDetail && (
                      <FormField
                        control={form.control}
                        name="autre_addiction_detail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Préciser l&apos;autre addiction</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Précisez..."
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(e.target.value || null)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Submit button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={updateAntecedentMutation.isPending}
              >
                Réinitialiser
              </Button>
              <Button
                type="submit"
                disabled={updateAntecedentMutation.isPending}
              >
                {updateAntecedentMutation.isPending
                  ? 'Enregistrement...'
                  : isNewRecord
                    ? 'Créer les antécédents'
                    : 'Mettre à jour les antécédents'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
