'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FieldPath, useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

import {
  Checkbox,
  Form,
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
  OcularTensionSchema,
  PachymetrySchema,
  RefractionSchema,
  type TechnicalExamFormValues,
  TTT_HYPOTONISANT_VALUES,
  VisualAcuitySchema,
} from '@/features/exams/types';

// Schema combiné pour le formulaire technique complet
const technicalExamFormSchema = z.object({
  visualAcuity: VisualAcuitySchema,
  refraction: RefractionSchema,
  ocularTension: OcularTensionSchema,
  pachymetry: PachymetrySchema.optional(),
});

interface TechnicalExamFormProps {
  isAdult?: boolean;
  initialData?: Partial<TechnicalExamFormValues>;
  onSubmit?: (data: TechnicalExamFormValues) => void;
  mode?: 'stepper' | 'section';
}

const TTT_LABELS: Record<(typeof TTT_HYPOTONISANT_VALUES)[number], string> = {
  BBLOQUANTS: 'Bêta-bloquants',
  IAC: 'IAC (Inhibiteur anhydrase carbonique)',
  PROSTAGLANDINES: 'Prostaglandines',
  PILOCARPINE: 'Pilocarpine',
  CHIRURGIE: 'Chirurgie',
  LASER: 'Laser',
  AUTRES: 'Autres',
};

// Helper component for number input fields to avoid type issues
interface NumberFieldProps {
  control: ReturnType<typeof useForm<TechnicalExamFormValues>>['control'];
  name: FieldPath<TechnicalExamFormValues>;
  label: string;
  step?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  srOnly?: boolean;
}

function NumberField({
  control,
  name,
  label,
  step = '0.25',
  min,
  max,
  placeholder,
  srOnly = false,
}: NumberFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Gérer uniquement les nombres et les valeurs nullables
        const displayValue = typeof field.value === 'number' ? field.value : '';

        return (
          <FormItem>
            <FormLabel className={srOnly ? 'sr-only' : 'text-xs'}>
              {label}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step={step}
                min={min}
                max={max}
                placeholder={placeholder}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={displayValue}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : null)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export function TechnicalExamForm({
  isAdult = true,
  initialData,
  onSubmit,
}: TechnicalExamFormProps) {
  const form = useForm<TechnicalExamFormValues>({
    resolver: zodResolver(technicalExamFormSchema),
    defaultValues: {
      visualAcuity: {
        avsc_od: initialData?.visualAcuity?.avsc_od ?? null,
        avsc_og: initialData?.visualAcuity?.avsc_og ?? null,
        avsc_odg: initialData?.visualAcuity?.avsc_odg ?? null,
        avac_od: initialData?.visualAcuity?.avac_od ?? null,
        avac_og: initialData?.visualAcuity?.avac_og ?? null,
        avac_odg: initialData?.visualAcuity?.avac_odg ?? null,
      },
      refraction: {
        od_sphere: initialData?.refraction?.od_sphere ?? null,
        od_cylinder: initialData?.refraction?.od_cylinder ?? null,
        od_axis: initialData?.refraction?.od_axis ?? null,
        od_visual_acuity: initialData?.refraction?.od_visual_acuity ?? null,
        og_sphere: initialData?.refraction?.og_sphere ?? null,
        og_cylinder: initialData?.refraction?.og_cylinder ?? null,
        og_axis: initialData?.refraction?.og_axis ?? null,
        og_visual_acuity: initialData?.refraction?.og_visual_acuity ?? null,
        retino_od_sphere: initialData?.refraction?.retino_od_sphere ?? null,
        retino_od_cylinder: initialData?.refraction?.retino_od_cylinder ?? null,
        retino_od_axis: initialData?.refraction?.retino_od_axis ?? null,
        retino_og_sphere: initialData?.refraction?.retino_og_sphere ?? null,
        retino_og_cylinder: initialData?.refraction?.retino_og_cylinder ?? null,
        retino_og_axis: initialData?.refraction?.retino_og_axis ?? null,
        cyclo_od_sphere: initialData?.refraction?.cyclo_od_sphere ?? null,
        cyclo_od_cylinder: initialData?.refraction?.cyclo_od_cylinder ?? null,
        cyclo_od_axis: initialData?.refraction?.cyclo_od_axis ?? null,
        cyclo_og_sphere: initialData?.refraction?.cyclo_og_sphere ?? null,
        cyclo_og_cylinder: initialData?.refraction?.cyclo_og_cylinder ?? null,
        cyclo_og_axis: initialData?.refraction?.cyclo_og_axis ?? null,
        dp: initialData?.refraction?.dp ?? null,
      },
      ocularTension: {
        od: initialData?.ocularTension?.od ?? null,
        og: initialData?.ocularTension?.og ?? null,
        ttt_hypotonisant: initialData?.ocularTension?.ttt_hypotonisant ?? false,
        ttt_hypotonisant_value:
          initialData?.ocularTension?.ttt_hypotonisant_value ?? [],
      },
      pachymetry: isAdult
        ? {
            od: initialData?.pachymetry?.od ?? null,
            og: initialData?.pachymetry?.og ?? null,
            cto_od: initialData?.pachymetry?.cto_od ?? null,
            cto_og: initialData?.pachymetry?.cto_og ?? null,
          }
        : undefined,
    },
    mode: 'onBlur',
  });

  // Watch ttt_hypotonisant pour afficher/masquer les traitements
  const tttHypotonisant = useWatch({
    control: form.control,
    name: 'ocularTension.ttt_hypotonisant',
  });

  // Nettoyage automatique quand ttt_hypotonisant change
  useEffect(() => {
    if (!tttHypotonisant) {
      form.setValue('ocularTension.ttt_hypotonisant_value', []);
    }
  }, [tttHypotonisant, form]);

  const handleSubmit = (data: TechnicalExamFormValues) => {
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
        id="technical-exam-form"
      >
        {/* Acuité Visuelle */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Acuité Visuelle
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Mesures d&apos;acuité visuelle (plage : 0.0 - 10.0)
            </p>
          </div>

          {/* Sans correction */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Sans Correction (AVSC)
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <NumberField
                control={form.control}
                name="visualAcuity.avsc_od"
                label="OD (Droit)"
                step="0.1"
                min="0"
                max="10"
                placeholder="0.0 - 10.0"
              />
              <NumberField
                control={form.control}
                name="visualAcuity.avsc_og"
                label="OG (Gauche)"
                step="0.1"
                min="0"
                max="10"
                placeholder="0.0 - 10.0"
              />
              <NumberField
                control={form.control}
                name="visualAcuity.avsc_odg"
                label="ODG (Binoculaire)"
                step="0.1"
                min="0"
                max="10"
                placeholder="0.0 - 10.0"
              />
            </div>
          </div>

          {/* Avec correction */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Avec Correction (AVAC)
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <NumberField
                control={form.control}
                name="visualAcuity.avac_od"
                label="OD (Droit)"
                step="0.1"
                min="0"
                max="10"
                placeholder="0.0 - 10.0"
              />
              <NumberField
                control={form.control}
                name="visualAcuity.avac_og"
                label="OG (Gauche)"
                step="0.1"
                min="0"
                max="10"
                placeholder="0.0 - 10.0"
              />
              <NumberField
                control={form.control}
                name="visualAcuity.avac_odg"
                label="ODG (Binoculaire)"
                step="0.1"
                min="0"
                max="10"
                placeholder="0.0 - 10.0"
              />
            </div>
          </div>
        </section>

        {/* Réfraction */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Réfraction
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sphère (-20 à +15 D), Cylindre (-8 à +8 D), Axe (0-180°)
            </p>
          </div>

          {/* Réfraction subjective */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Réfraction Subjective
            </Label>
            {/* OD */}
            <div className="grid grid-cols-5 items-end gap-4">
              <div>
                <Label className="text-xs font-medium">OD (Droit)</Label>
              </div>
              <NumberField
                control={form.control}
                name="refraction.od_sphere"
                label="Sphère (D)"
                min="-20"
                max="15"
                placeholder="-20 à +15"
              />
              <NumberField
                control={form.control}
                name="refraction.od_cylinder"
                label="Cylindre (D)"
                min="-8"
                max="8"
                placeholder="-8 à +8"
              />
              <NumberField
                control={form.control}
                name="refraction.od_axis"
                label="Axe (°)"
                step="1"
                min="0"
                max="180"
                placeholder="0-180"
              />
              <NumberField
                control={form.control}
                name="refraction.od_visual_acuity"
                label="AV"
                step="0.1"
                min="0"
                max="10"
                placeholder="0-10"
              />
            </div>
            {/* OG */}
            <div className="grid grid-cols-5 items-end gap-4">
              <div>
                <Label className="text-xs font-medium">OG (Gauche)</Label>
              </div>
              <NumberField
                control={form.control}
                name="refraction.og_sphere"
                label="Sphère OG"
                srOnly
                min="-20"
                max="15"
                placeholder="-20 à +15"
              />
              <NumberField
                control={form.control}
                name="refraction.og_cylinder"
                label="Cylindre OG"
                srOnly
                min="-8"
                max="8"
                placeholder="-8 à +8"
              />
              <NumberField
                control={form.control}
                name="refraction.og_axis"
                label="Axe OG"
                srOnly
                step="1"
                min="0"
                max="180"
                placeholder="0-180"
              />
              <NumberField
                control={form.control}
                name="refraction.og_visual_acuity"
                label="AV OG"
                srOnly
                step="0.1"
                min="0"
                max="10"
                placeholder="0-10"
              />
            </div>
          </div>

          {/* Rétinoscopie Standard */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Rétinoscopie Standard
            </Label>
            {/* OD */}
            <div className="grid grid-cols-4 items-end gap-4">
              <div>
                <Label className="text-xs font-medium">OD (Droit)</Label>
              </div>
              <NumberField
                control={form.control}
                name="refraction.retino_od_sphere"
                label="Sphère (D)"
                min="-20"
                max="15"
                placeholder="-20 à +15"
              />
              <NumberField
                control={form.control}
                name="refraction.retino_od_cylinder"
                label="Cylindre (D)"
                min="-8"
                max="8"
                placeholder="-8 à +8"
              />
              <NumberField
                control={form.control}
                name="refraction.retino_od_axis"
                label="Axe (°)"
                step="1"
                min="0"
                max="180"
                placeholder="0-180"
              />
            </div>
            {/* OG */}
            <div className="grid grid-cols-4 items-end gap-4">
              <div>
                <Label className="text-xs font-medium">OG (Gauche)</Label>
              </div>
              <NumberField
                control={form.control}
                name="refraction.retino_og_sphere"
                label="Sphère OG"
                srOnly
                min="-20"
                max="15"
                placeholder="-20 à +15"
              />
              <NumberField
                control={form.control}
                name="refraction.retino_og_cylinder"
                label="Cylindre OG"
                srOnly
                min="-8"
                max="8"
                placeholder="-8 à +8"
              />
              <NumberField
                control={form.control}
                name="refraction.retino_og_axis"
                label="Axe OG"
                srOnly
                step="1"
                min="0"
                max="180"
                placeholder="0-180"
              />
            </div>
          </div>

          {/* Rétinoscopie Cycloplégique */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Rétinoscopie Cycloplégique
            </Label>
            {/* OD */}
            <div className="grid grid-cols-4 items-end gap-4">
              <div>
                <Label className="text-xs font-medium">OD (Droit)</Label>
              </div>
              <NumberField
                control={form.control}
                name="refraction.cyclo_od_sphere"
                label="Sphère (D)"
                min="-20"
                max="15"
                placeholder="-20 à +15"
              />
              <NumberField
                control={form.control}
                name="refraction.cyclo_od_cylinder"
                label="Cylindre (D)"
                min="-8"
                max="8"
                placeholder="-8 à +8"
              />
              <NumberField
                control={form.control}
                name="refraction.cyclo_od_axis"
                label="Axe (°)"
                step="1"
                min="0"
                max="180"
                placeholder="0-180"
              />
            </div>
            {/* OG */}
            <div className="grid grid-cols-4 items-end gap-4">
              <div>
                <Label className="text-xs font-medium">OG (Gauche)</Label>
              </div>
              <NumberField
                control={form.control}
                name="refraction.cyclo_og_sphere"
                label="Sphère OG"
                srOnly
                min="-20"
                max="15"
                placeholder="-20 à +15"
              />
              <NumberField
                control={form.control}
                name="refraction.cyclo_og_cylinder"
                label="Cylindre OG"
                srOnly
                min="-8"
                max="8"
                placeholder="-8 à +8"
              />
              <NumberField
                control={form.control}
                name="refraction.cyclo_og_axis"
                label="Axe OG"
                srOnly
                step="1"
                min="0"
                max="180"
                placeholder="0-180"
              />
            </div>
          </div>

          {/* Distance Pupillaire */}
          <div className="space-y-3">
            <div className="max-w-xs">
              <NumberField
                control={form.control}
                name="refraction.dp"
                label="Distance Pupillaire (mm)"
                step="0.5"
                min="40"
                max="80"
                placeholder="40-80 mm"
              />
            </div>
          </div>
        </section>

        {/* Tension Oculaire */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Tension Oculaire (PIO)
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Pression intraoculaire en mmHg (normale : 10-21 mmHg, max : 50)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberField
              control={form.control}
              name="ocularTension.od"
              label="OD (mmHg)"
              step="0.5"
              min="0"
              max="50"
              placeholder="0-50"
            />
            <NumberField
              control={form.control}
              name="ocularTension.og"
              label="OG (mmHg)"
              step="0.5"
              min="0"
              max="50"
              placeholder="0-50"
            />
          </div>

          {/* Traitement hypotonisant */}
          <FormField
            control={form.control}
            name="ocularTension.ttt_hypotonisant"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Traitement hypotonisant</FormLabel>
                  <FormDescription>
                    Le patient est-il sous traitement hypotonisant ?
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Types de traitement - conditionnel */}
          {tttHypotonisant && (
            <FormField
              control={form.control}
              name="ocularTension.ttt_hypotonisant_value"
              render={() => (
                <FormItem className="bg-muted/30 rounded-md border border-border p-4">
                  <FormLabel className="text-xs font-medium">
                    Type(s) de traitement{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {TTT_HYPOTONISANT_VALUES.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="ocularTension.ttt_hypotonisant_value"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, item]);
                                  } else {
                                    field.onChange(
                                      currentValue.filter((v) => v !== item),
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {TTT_LABELS[item]}
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
          )}
        </section>

        {/* Pachymétrie (Adulte seulement) */}
        {isAdult && (
          <section className="space-y-4">
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-foreground">
                Pachymétrie
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Épaisseur cornéenne centrale en micromètres (normale : 500-600
                µm)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                control={form.control}
                name="pachymetry.od"
                label="OD (µm)"
                step="1"
                placeholder="500-600"
              />
              <NumberField
                control={form.control}
                name="pachymetry.og"
                label="OG (µm)"
                step="1"
                placeholder="500-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                control={form.control}
                name="pachymetry.cto_od"
                label="Correction TO OD (300-800 µm)"
                step="1"
                min="300"
                max="800"
                placeholder="300-800"
              />
              <NumberField
                control={form.control}
                name="pachymetry.cto_og"
                label="Correction TO OG (300-800 µm)"
                step="1"
                min="300"
                max="800"
                placeholder="300-800"
              />
            </div>
          </section>
        )}
      </form>
    </Form>
  );
}
