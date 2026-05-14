'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Checkbox,
  FormControl,
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

import {
  useDriverExperience,
  useUpsertDriverExperience,
  type DriverExperience,
} from '../../api/adult/driver-experience';

// =============================================================================
// CONSTANTS
// =============================================================================

const ETAT_CONDUCTEUR_OPTIONS = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'INACTIF', label: 'Inactif' },
  { value: 'DCD', label: 'Décédé' },
  { value: 'PERTE_VUE', label: 'Perdu de vue' },
] as const;

// =============================================================================
// SCHEMA
// =============================================================================

const driverExperienceFormSchema = z.object({
  date_visite: z.string().nullable().optional(),
  etat_conducteur: z.string().nullable().optional(),
  deces_cause: z.string().nullable().optional(),
  inactif_cause: z.string().nullable().optional(),
  km_parcourus: z.string().nullable().optional(),
  nombre_accidents: z.coerce.number().int().min(0).nullable().optional(),
  tranche_horaire: z.string().nullable().optional(),
  corporel_dommage: z.boolean().optional(),
  corporel_dommage_type: z.string().nullable().optional(),
  materiel_dommage: z.boolean().optional(),
  materiel_dommage_type: z.string().nullable().optional(),
  date_dernier_accident: z.string().nullable().optional(),
});

type DriverExperienceFormValues = z.infer<typeof driverExperienceFormSchema>;

// =============================================================================
// HELPERS
// =============================================================================

function toFormValues(data: DriverExperience): DriverExperienceFormValues {
  return {
    date_visite: data.date_visite ?? null,
    etat_conducteur: data.etat_conducteur ?? null,
    deces_cause: data.deces_cause ?? null,
    inactif_cause: data.inactif_cause ?? null,
    km_parcourus: data.km_parcourus ?? null,
    nombre_accidents: data.nombre_accidents ?? null,
    tranche_horaire: data.tranche_horaire ?? null,
    corporel_dommage: data.corporel_dommage ?? false,
    corporel_dommage_type: data.corporel_dommage_type ?? null,
    materiel_dommage: data.materiel_dommage ?? false,
    materiel_dommage_type: data.materiel_dommage_type ?? null,
    date_dernier_accident: data.date_dernier_accident ?? null,
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

interface DriverExperienceFormProps {
  examId: number;
}

export function DriverExperienceForm({ examId }: DriverExperienceFormProps) {
  const { data: existing } = useDriverExperience({ examId });
  const { mutate: upsert, isPending } = useUpsertDriverExperience();

  const form = useForm<DriverExperienceFormValues>({
    resolver: zodResolver(driverExperienceFormSchema),
    defaultValues: {
      date_visite: null,
      etat_conducteur: null,
      deces_cause: null,
      inactif_cause: null,
      km_parcourus: null,
      nombre_accidents: null,
      tranche_horaire: null,
      corporel_dommage: false,
      corporel_dommage_type: null,
      materiel_dommage: false,
      materiel_dommage_type: null,
      date_dernier_accident: null,
    },
  });

  const etatConducteur = form.watch('etat_conducteur');
  const hasCorporelDommage = form.watch('corporel_dommage');
  const hasMaterielDommage = form.watch('materiel_dommage');

  useEffect(() => {
    if (existing) {
      form.reset(toFormValues(existing));
    }
  }, [existing, form]);

  const handleSubmit = form.handleSubmit((values) => {
    upsert({ examId, data: values });
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visit info header */}
        {existing && (
          <div className="rounded-md bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
            Visite n°{existing.visit_number}
          </div>
        )}

        {/* Status & Date */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Statut du conducteur
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="date_visite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de visite</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
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

            <FormField
              control={form.control}
              name="etat_conducteur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>État du conducteur</FormLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || null)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ETAT_CONDUCTEUR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {etatConducteur === 'DCD' && (
            <FormField
              control={form.control}
              name="deces_cause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cause du décès</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="Préciser la cause..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {etatConducteur === 'INACTIF' && (
            <FormField
              control={form.control}
              name="inactif_cause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cause d&apos;inactivité</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="Préciser la cause..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </section>

        {/* Driving info */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Informations de conduite
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="km_parcourus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Km parcourus</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="ex: 50 000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tranche_horaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tranche horaire</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="ex: 6h-22h"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Accidents */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">Accidents</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nombre_accidents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre d&apos;accidents</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
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
              name="date_dernier_accident"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date dernier accident</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
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
          </div>

          {/* Damages */}
          <div className="space-y-3 rounded-md border border-border p-4">
            <p className="text-sm font-medium text-foreground">
              Type de dommages
            </p>

            <FormField
              control={form.control}
              name="corporel_dommage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Dommages corporels
                  </FormLabel>
                </FormItem>
              )}
            />

            {hasCorporelDommage && (
              <FormField
                control={form.control}
                name="corporel_dommage_type"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormLabel>Préciser</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value || null)
                        }
                        placeholder="Nature des dommages corporels..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="materiel_dommage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Dommages matériels
                  </FormLabel>
                </FormItem>
              )}
            />

            {hasMaterielDommage && (
              <FormField
                control={form.control}
                name="materiel_dommage_type"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormLabel>Préciser</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value || null)
                        }
                        placeholder="Nature des dommages matériels..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end border-t border-border pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-4" aria-hidden="true" />
            )}
            Sauvegarder
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
