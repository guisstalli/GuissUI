'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
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
  initialData,
  onSave,
  isLoading,
}: MedicalHistoryTabProps) {
  const form = useForm<MedicalHistoryFormValues>({
    resolver: zodResolver(MedicalHistorySchema),
    defaultValues: {
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

  // Nettoyage automatique si les switches sont décochés
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

  const onSubmit = (data: MedicalHistoryFormValues) => {
    onSave?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                      Le patient a-t-il des antécédents médicaux ou chirurgicaux
                      ?
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
                      Le patient a-t-il des pathologies ou chirurgies oculaires
                      ?
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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                                ? field.onChange([...(field.value || []), item])
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

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer les antécédents'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
