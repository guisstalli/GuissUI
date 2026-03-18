'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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
  Textarea,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/form/checkbox';
import { ICDSelector } from '@/components/ui/icd-selector';
import { Switch } from '@/components/ui/switch';
import { useAntecedent, useUpdateAntecedent } from '@/features/patients/api';
import type { AntecedentCreate } from '@/features/patients/types';

import {
  MedicalHistorySchema,
  type MedicalHistoryFormValues,
  FAMILIAL_VALUES,
} from '../types';

interface MedicalHistoryTabProps {
  patientId: string;
  initialData?: Partial<MedicalHistoryFormValues>;
  onSave?: (data: MedicalHistoryFormValues) => void;
  isLoading?: boolean;
}

const FAMILIAL_LABELS: Record<string, string> = {
  AUCUN: 'Aucun',
  GLAUCOME: 'Glaucome',
  CECITE: 'Cécité',
  CATARACTE: 'Cataracte',
  RETINOPATHIE: 'Rétinopathie',
  AUTRES: 'Autres',
};

export function MedicalHistoryTab({
  patientId,
  initialData,
  onSave,
  isLoading: externalLoading,
}: MedicalHistoryTabProps) {
  const numericPatientId = useMemo(() => Number(patientId), [patientId]);
  const hasValidPatientId =
    Number.isFinite(numericPatientId) && numericPatientId > 0;

  const { data: antecedent, isLoading: antecedentLoading } = useAntecedent({
    patientId: numericPatientId,
    enabled: hasValidPatientId,
  });

  const updateAntecedentMutation = useUpdateAntecedent();

  const form = useForm<MedicalHistoryFormValues>({
    resolver: zodResolver(MedicalHistorySchema),
    defaultValues: {
      has_antecedents: initialData?.has_antecedents ?? false,
      has_antecedents_medico_chirurgicaux:
        initialData?.has_antecedents_medico_chirurgicaux ?? false,
      antecedents_medico_chirurgicaux:
        initialData?.antecedents_medico_chirurgicaux ?? [],
      has_pathologie_ophtalmologique:
        initialData?.has_pathologie_ophtalmologique ?? false,
      pathologie_ophtalmologique: initialData?.pathologie_ophtalmologique ?? [],
      familial: initialData?.familial ?? [],
      autre_familial_detail: initialData?.autre_familial_detail ?? '',
      uses_screen: initialData?.uses_screen ?? false,
      screen_time_hours_per_day: initialData?.screen_time_hours_per_day ?? null,
    },
  });

  const hasAntecedents = useWatch({
    control: form.control,
    name: 'has_antecedents',
  });
  const hasExistingAntecedent = Boolean(antecedent);
  const hasHydratedFromApi = useRef(false);
  const previousHasAntecedents = useRef<boolean | null>(null);

  const hasMedSurg = useWatch({
    control: form.control,
    name: 'has_antecedents_medico_chirurgicaux',
  });
  const hasOphthalmo = useWatch({
    control: form.control,
    name: 'has_pathologie_ophtalmologique',
  });
  const familialRaw = useWatch({ control: form.control, name: 'familial' });
  const familial = useMemo(() => familialRaw || [], [familialRaw]);
  const usesScreen = useWatch({ control: form.control, name: 'uses_screen' });

  const buildApiPayload = useCallback(
    (data: MedicalHistoryFormValues): AntecedentCreate => {
      if (!data.has_antecedents) {
        return {
          patient: numericPatientId,
          has_antecedents_medico_chirurgicaux: false,
          antecedents_medico_chirurgicaux: [],
          has_pathologie_ophtalmologique: false,
          pathologie_ophtalmologique: [],
          familial: [],
          autre_familial_detail: null,
          uses_screen: false,
          screen_time_hours_per_day: null,
        };
      }

      return {
        patient: numericPatientId,
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
        familial: data.familial as unknown as AntecedentCreate['familial'],
        autre_familial_detail: data.familial.includes('AUTRES')
          ? (data.autre_familial_detail ?? null)
          : null,
        uses_screen: data.uses_screen,
        screen_time_hours_per_day: data.uses_screen
          ? (data.screen_time_hours_per_day ?? null)
          : null,
      };
    },
    [numericPatientId],
  );

  useEffect(() => {
    if (!antecedent) {
      return;
    }

    const hydratedFamilial = (antecedent.familial ?? []).filter((item) =>
      FAMILIAL_VALUES.includes(item as (typeof FAMILIAL_VALUES)[number]),
    ) as MedicalHistoryFormValues['familial'];

    const hasAnyAntecedentData =
      (antecedent.has_antecedents_medico_chirurgicaux ?? false) ||
      (antecedent.antecedents_medico_chirurgicaux?.length ?? 0) > 0 ||
      (antecedent.has_pathologie_ophtalmologique ?? false) ||
      (antecedent.pathologie_ophtalmologique?.length ?? 0) > 0 ||
      hydratedFamilial.length > 0 ||
      Boolean(antecedent.autre_familial_detail) ||
      Boolean(antecedent.uses_screen) ||
      antecedent.screen_time_hours_per_day !== null;

    form.reset({
      has_antecedents: hasAnyAntecedentData,
      has_antecedents_medico_chirurgicaux:
        antecedent.has_antecedents_medico_chirurgicaux ??
        (antecedent.antecedents_medico_chirurgicaux?.length ?? 0) > 0,
      antecedents_medico_chirurgicaux:
        antecedent.antecedents_medico_chirurgicaux ?? [],
      has_pathologie_ophtalmologique:
        antecedent.has_pathologie_ophtalmologique ??
        (antecedent.pathologie_ophtalmologique?.length ?? 0) > 0,
      pathologie_ophtalmologique: antecedent.pathologie_ophtalmologique ?? [],
      familial: hydratedFamilial,
      autre_familial_detail: antecedent.autre_familial_detail ?? '',
      uses_screen: antecedent.uses_screen ?? false,
      screen_time_hours_per_day: antecedent.screen_time_hours_per_day ?? null,
    });

    hasHydratedFromApi.current = true;
  }, [antecedent, form]);

  // Nettoyage automatique si les switches sont décochés
  useEffect(() => {
    if (!hasAntecedents) {
      form.setValue('has_antecedents_medico_chirurgicaux', false);
      form.setValue('antecedents_medico_chirurgicaux', []);
      form.setValue('has_pathologie_ophtalmologique', false);
      form.setValue('pathologie_ophtalmologique', []);
      form.setValue('familial', []);
      form.setValue('autre_familial_detail', '');
      form.setValue('uses_screen', false);
      form.setValue('screen_time_hours_per_day', null);
    }
  }, [hasAntecedents, form]);

  useEffect(() => {
    if (!hasMedSurg) {
      form.setValue('antecedents_medico_chirurgicaux', []);
    }
  }, [hasMedSurg, form]);

  useEffect(() => {
    if (!hasOphthalmo) {
      form.setValue('pathologie_ophtalmologique', []);
    }
  }, [hasOphthalmo, form]);

  useEffect(() => {
    if (!familial.includes('AUTRES')) {
      form.setValue('autre_familial_detail', '');
    }
  }, [familial, form]);

  useEffect(() => {
    if (previousHasAntecedents.current === null) {
      previousHasAntecedents.current = hasAntecedents;
      return;
    }

    if (!hasHydratedFromApi.current && hasExistingAntecedent) {
      previousHasAntecedents.current = hasAntecedents;
      return;
    }

    const previousValue = previousHasAntecedents.current;
    previousHasAntecedents.current = hasAntecedents;

    if (!hasValidPatientId || updateAntecedentMutation.isPending) {
      return;
    }

    if (previousValue === false && hasAntecedents && !hasExistingAntecedent) {
      updateAntecedentMutation.mutate({
        patientId: numericPatientId,
        data: buildApiPayload({
          ...form.getValues(),
          has_antecedents: true,
        }),
      });
      return;
    }

    if (previousValue === true && !hasAntecedents && hasExistingAntecedent) {
      updateAntecedentMutation.mutate({
        patientId: numericPatientId,
        data: buildApiPayload({
          ...form.getValues(),
          has_antecedents: false,
        }),
      });
    }
  }, [
    buildApiPayload,
    form,
    hasAntecedents,
    hasExistingAntecedent,
    hasValidPatientId,
    numericPatientId,
    updateAntecedentMutation,
  ]);

  const onSubmit = (data: MedicalHistoryFormValues) => {
    if (!hasValidPatientId || updateAntecedentMutation.isPending) {
      return;
    }

    updateAntecedentMutation.mutate(
      {
        patientId: numericPatientId,
        data: buildApiPayload(data),
      },
      {
        onSuccess: () => {
          onSave?.(data);
        },
      },
    );
  };

  const isLoading =
    Boolean(externalLoading) ||
    antecedentLoading ||
    updateAntecedentMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Switch Global Antécédents */}
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
                  Activez cette option pour saisir les antécédents, pathologies
                  ou historiques familiaux. Si désactivé, tout le formulaire
                  sera vidé et caché.
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
          <div className="mt-8 grid grid-cols-1 gap-8 duration-300 animate-in fade-in slide-in-from-top-4 md:grid-cols-2">
            {/* Section Médicale / Chirurgicale */}
            <div className="space-y-6">
              <div className="border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Antécédents Médicaux & Chirurgicaux
                </h3>
              </div>

              <FormField
                control={form.control}
                name="has_antecedents_medico_chirurgicaux"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Antécédents ?</FormLabel>
                      <FormDescription>
                        Le patient a-t-il des antécédents médicaux ou
                        chirurgicaux ?
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

              {hasMedSurg && (
                <FormField
                  control={form.control}
                  name="antecedents_medico_chirurgicaux"
                  render={({ field }) => (
                    <FormItem>
                      <ICDSelector
                        label="Recherche de pathologies (CIM-11)"
                        description="Sélectionnez les pathologies médicales ou chirurgicales"
                        value={field.value}
                        onChange={field.onChange}
                        maxItems={10}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Section Ophtalmologique */}
            <div className="space-y-6">
              <div className="border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Pathologies Ophtalmologiques
                </h3>
              </div>

              <FormField
                control={form.control}
                name="has_pathologie_ophtalmologique"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Pathologies ophtalmo ?
                      </FormLabel>
                      <FormDescription>
                        Le patient a-t-il des pathologies ou chirurgies
                        oculaires ?
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

              {hasOphthalmo && (
                <FormField
                  control={form.control}
                  name="pathologie_ophtalmologique"
                  render={({ field }) => (
                    <FormItem>
                      <ICDSelector
                        label="Recherche de pathologies oculaires (CIM-11)"
                        description="Sélectionnez les antécédents ophtalmologiques"
                        value={field.value}
                        onChange={field.onChange}
                        maxItems={10}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {hasAntecedents && (
          <div className="mt-8 grid grid-cols-1 gap-8 duration-300 animate-in fade-in slide-in-from-top-4 md:grid-cols-2">
            {/* Section Familiale */}
            <div className="space-y-6">
              <div className="border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Antécédents Familiaux
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {FAMILIAL_VALUES.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="familial"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked: boolean) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      item,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {FAMILIAL_LABELS[item]}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>

              {familial.includes('AUTRES') && (
                <FormField
                  control={form.control}
                  name="autre_familial_detail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Détails (Autres)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Précisez les antécédents familiaux..."
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Section Écrans */}
            <div className="space-y-6">
              <div className="border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Utilisation des Écrans
                </h3>
              </div>

              <FormField
                control={form.control}
                name="uses_screen"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Utilise des écrans ?
                      </FormLabel>
                      <FormDescription>
                        Ordinateur, smartphone, tablette, etc.
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

              {usesScreen && (
                <FormField
                  control={form.control}
                  name="screen_time_hours_per_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heures par jour</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={24}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Nombre d&apos;heures approximatif d&apos;exposition
                        quotidienne
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading || !hasValidPatientId}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer les antécédents'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
