'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Loader2, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { useGenerateAdultOrdonnance } from '@/features/exams/api/adult/ordonnance';
import { useAdultOrdonnancePrefill } from '@/features/exams/api/adult/ordonnance-prefill';
import { useGenerateChildOrdonnance } from '@/features/exams/api/child/ordonnance';
import { useChildOrdonnancePrefill } from '@/features/exams/api/child/ordonnance-prefill';
import { MedicamentSelector } from '@/features/exams/components/medicament-selector';

type TypeOrdonnance = 'MEDICAMENTEUSE' | 'OPTIQUE';
type OrdonnanceMode = 'medicamenteuse' | 'optique';

const MODE_TO_TYPE: Record<OrdonnanceMode, TypeOrdonnance> = {
  medicamenteuse: 'MEDICAMENTEUSE',
  optique: 'OPTIQUE',
};
const MODE_LABELS: Record<OrdonnanceMode, string> = {
  medicamenteuse: 'Ordonnance médicamenteuse',
  optique: 'Ordonnance de correction optique',
};

// =============================================================================
// SCHEMAS
// =============================================================================

const FormeGalenique = z.enum([
  'COLLYRE',
  'POMMADE',
  'COMPRIMES',
  'INJECTION',
  'GEL',
  'SOLUTION',
  'AUTRE',
]);

const MedicamentSchema = z
  .object({
    medicament_id: z.number().nullable().optional(),
    nom_prescrit: z.string().min(1, 'Nom requis'),
    forme_galenique: FormeGalenique.default('AUTRE'),
    dosage: z.string().optional().default(''),
    oeil: z.enum(['OD', 'OG', 'OU', 'NA']).default('OU'),
    posologie: z.string().min(1, 'Posologie requise'),
    duree_jours: z.coerce.number().int().positive().nullable().optional(),
    quantite: z.string().optional().default(''),
    instructions: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (
      data.forme_galenique === 'COLLYRE' ||
      data.forme_galenique === 'POMMADE'
    ) {
      if (!data.oeil || data.oeil === 'NA') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Œil concerné requis pour un collyre ou une pommade',
          path: ['oeil'],
        });
      }
    }
  });

type LigneMedicament = z.infer<typeof MedicamentSchema>;

// L'axe clinique est exprimé en degrés entiers (0–180). La pré-réfraction
// objective peut renvoyer des floats (90.5°) qu'on arrondit à l'entrée pour
// ne pas bloquer la soumission alors que l'utilisateur ne prescrit pas de
// correction.
const AxeSchema = z.preprocess(
  (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : v),
  z.coerce.number().int().min(0).max(180).nullable().optional(),
);

const CorrectionOeilSchema = z.object({
  sphere: z.coerce.number().nullable().optional(),
  cylindre: z.coerce.number().nullable().optional(),
  axe: AxeSchema,
  add: z.coerce.number().nullable().optional(),
});

// Quand l'utilisateur ne prescrit pas de correction (type Médicamenteuse ou
// correction_prescrit=false), on ne valide pas le bloc CorrectionOeilSchema —
// les valeurs pré-remplies depuis la réfraction objective sont conservées
// dans l'état du form mais ignorées par Zod. Validation conditionnelle via
// superRefine (cf. ci-dessous).
const OrdonnanceFormSchema = z
  .object({
    type_ordonnance: z
      .enum(['MEDICAMENTEUSE', 'OPTIQUE'])
      .default('MEDICAMENTEUSE'),
    correction_prescrit: z.boolean().default(false),
    notes_generales: z.string().optional().default(''),
    prochain_rdv: z.string().optional().default(''),
    od: z.any().optional(),
    og: z.any().optional(),
    dp_od: z.coerce.number().nullable().optional(),
    dp_og: z.coerce.number().nullable().optional(),
    // Vision de près (presbytie) — optionnelle
    vision_pres_prescrit: z.boolean().default(false),
    od_pres: z.any().optional(),
    og_pres: z.any().optional(),
    dp_pres_od: z.coerce.number().nullable().optional(),
    dp_pres_og: z.coerce.number().nullable().optional(),
    type_correction: z
      .enum(['VL', 'VP', 'Progressive', ''])
      .nullable()
      .optional(),
    medicaments: z.array(MedicamentSchema).default([]),
  })
  .superRefine((data, ctx) => {
    // Skip correction-block validation entirely when not prescribing optics.
    if (!data.correction_prescrit) return;
    for (const side of ['od', 'og'] as const) {
      const parsed = CorrectionOeilSchema.safeParse(data[side]);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          ctx.addIssue({ ...issue, path: [side, ...issue.path] });
        }
      }
    }
    if (data.vision_pres_prescrit) {
      for (const side of ['od_pres', 'og_pres'] as const) {
        const parsed = CorrectionOeilSchema.safeParse(data[side]);
        if (!parsed.success) {
          for (const issue of parsed.error.issues) {
            ctx.addIssue({ ...issue, path: [side, ...issue.path] });
          }
        }
      }
    }
  });

type OrdonnanceFormValues = z.infer<typeof OrdonnanceFormSchema>;

// =============================================================================
// TYPES
// =============================================================================

export interface PrescriptionData {
  correction_optique?: {
    prescrit?: boolean;
    od?: {
      sphere?: number | null;
      cylindre?: number | null;
      axe?: number | null;
      add?: number | null;
    };
    og?: {
      sphere?: number | null;
      cylindre?: number | null;
      axe?: number | null;
      add?: number | null;
    };
    dp_od?: number | null;
    dp_og?: number | null;
    type?: string | null;
    vision_pres_prescrit?: boolean;
    od_pres?: {
      sphere?: number | null;
      cylindre?: number | null;
      axe?: number | null;
      add?: number | null;
    };
    og_pres?: {
      sphere?: number | null;
      cylindre?: number | null;
      axe?: number | null;
      add?: number | null;
    };
    dp_pres_od?: number | null;
    dp_pres_og?: number | null;
  } | null;
  medicaments?: Array<{
    medicament_id?: number | null;
    nom_prescrit?: string;
    nom?: string; // ancien format — toléré
    forme_galenique?: string;
    dosage?: string;
    oeil?: string;
    oeil_concerne?: string;
    posologie?: string;
    duree_jours?: number | null;
    duree?: string; // ancien format — toléré
    quantite?: string;
    instructions?: string;
  }>;
  /** « Instructions générales » sur le PDF médicamenteux / « Options » sur l'optique. */
  notes_generales?: string;
  /** Texte libre — affiché en bas du PDF médicamenteux. */
  prochain_rdv?: string;
}

/**
 * Props discriminés sur ``mode`` : le bouton qui ouvre le dialog choisit
 * explicitement la nature de l'ordonnance (médicamenteuse OU optique).
 * Le sélecteur de type historique est retiré au profit d'un titre verrouillé.
 */
export interface OrdonnanceFormDialogProps {
  examId: number;
  examType: 'adult' | 'child';
  mode: OrdonnanceMode;
  open: boolean;
  onClose: () => void;
  initialData?: PrescriptionData | null;
}

// =============================================================================
// HELPERS
// =============================================================================

function buildPrescriptionData(
  values: OrdonnanceFormValues,
  mode: OrdonnanceMode,
): PrescriptionData {
  if (mode === 'optique') {
    // Une ordonnance optique ne porte JAMAIS de médicaments — on omet la clé
    // pour ne pas polluer le JSON ``prescription_data``.
    return {
      correction_optique: values.correction_prescrit
        ? {
            prescrit: true,
            od: {
              sphere: values.od?.sphere ?? null,
              cylindre: values.od?.cylindre ?? null,
              axe: values.od?.axe ?? null,
              add: values.od?.add ?? null,
            },
            og: {
              sphere: values.og?.sphere ?? null,
              cylindre: values.og?.cylindre ?? null,
              axe: values.og?.axe ?? null,
              add: values.og?.add ?? null,
            },
            dp_od: values.dp_od ?? null,
            dp_og: values.dp_og ?? null,
            type: values.type_correction || null,
            vision_pres_prescrit: values.vision_pres_prescrit ?? false,
            od_pres: values.vision_pres_prescrit
              ? {
                  sphere: values.od_pres?.sphere ?? null,
                  cylindre: values.od_pres?.cylindre ?? null,
                  axe: values.od_pres?.axe ?? null,
                  add: values.od_pres?.add ?? null,
                }
              : undefined,
            og_pres: values.vision_pres_prescrit
              ? {
                  sphere: values.og_pres?.sphere ?? null,
                  cylindre: values.og_pres?.cylindre ?? null,
                  axe: values.og_pres?.axe ?? null,
                  add: values.og_pres?.add ?? null,
                }
              : undefined,
            dp_pres_od: values.vision_pres_prescrit
              ? (values.dp_pres_od ?? null)
              : null,
            dp_pres_og: values.vision_pres_prescrit
              ? (values.dp_pres_og ?? null)
              : null,
          }
        : { prescrit: false },
      // ``notes_generales`` est utilisée comme « Options » sur le PDF optique.
      notes_generales: values.notes_generales ?? '',
    };
  }
  // Mode médicamenteuse — pas de correction_optique du tout.
  return {
    medicaments: values.medicaments,
    notes_generales: values.notes_generales ?? '',
    prochain_rdv: values.prochain_rdv ?? '',
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function OrdonnanceFormDialog({
  examId,
  examType,
  mode,
  open,
  onClose,
  initialData,
}: OrdonnanceFormDialogProps) {
  const lockedType = MODE_TO_TYPE[mode];

  const defaultValues = useMemo<OrdonnanceFormValues>(() => {
    if (!initialData) {
      return {
        type_ordonnance: lockedType,
        correction_prescrit: mode === 'optique',
        vision_pres_prescrit: false,
        medicaments: [],
        notes_generales: '',
        prochain_rdv: '',
      };
    }
    return {
      type_ordonnance: lockedType,
      correction_prescrit:
        mode === 'optique'
          ? true
          : (initialData.correction_optique?.prescrit ?? false),
      od: initialData.correction_optique?.od ?? undefined,
      og: initialData.correction_optique?.og ?? undefined,
      dp_od: initialData.correction_optique?.dp_od ?? undefined,
      dp_og: initialData.correction_optique?.dp_og ?? undefined,
      vision_pres_prescrit:
        initialData.correction_optique?.vision_pres_prescrit ?? false,
      od_pres: initialData.correction_optique?.od_pres ?? undefined,
      og_pres: initialData.correction_optique?.og_pres ?? undefined,
      dp_pres_od: initialData.correction_optique?.dp_pres_od ?? undefined,
      dp_pres_og: initialData.correction_optique?.dp_pres_og ?? undefined,
      type_correction:
        (initialData.correction_optique
          ?.type as OrdonnanceFormValues['type_correction']) ?? undefined,
      medicaments:
        (initialData.medicaments as OrdonnanceFormValues['medicaments']) ?? [],
      notes_generales:
        (initialData as PrescriptionData & { notes_generales?: string })
          .notes_generales ?? '',
      prochain_rdv:
        (initialData as PrescriptionData & { prochain_rdv?: string })
          .prochain_rdv ?? '',
    };
  }, [initialData, lockedType, mode]);

  const form = useForm<OrdonnanceFormValues>({
    resolver: zodResolver(OrdonnanceFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medicaments',
  });

  const correctionPrescrit = form.watch('correction_prescrit');
  const visionPresPrescrit = form.watch('vision_pres_prescrit');

  // ---------------------------------------------------------------------------
  // Prefill (only on first generation: when no initialData has been saved yet)
  // ---------------------------------------------------------------------------
  const shouldPrefill = open && !initialData;
  const adultPrefill = useAdultOrdonnancePrefill(
    examId,
    shouldPrefill && examType === 'adult',
  );
  const childPrefill = useChildOrdonnancePrefill(
    examId,
    shouldPrefill && examType === 'child',
  );
  const prefillData =
    examType === 'adult' ? adultPrefill.data : childPrefill.data;

  // Apply prefill once when data lands
  const hasAppliedPrefill = useRef(false);
  useEffect(() => {
    if (!shouldPrefill || !prefillData || hasAppliedPrefill.current) return;
    form.reset({
      ...form.getValues(),
      correction_prescrit: true,
      od: {
        sphere: prefillData.od.sphere ?? null,
        cylindre: prefillData.od.cylindre ?? null,
        axe: prefillData.od.axe ?? null,
        add: null,
      },
      og: {
        sphere: prefillData.og.sphere ?? null,
        cylindre: prefillData.og.cylindre ?? null,
        axe: prefillData.og.axe ?? null,
        add: null,
      },
      dp_od: prefillData.dp_loin ?? null,
      dp_og: prefillData.dp_loin ?? null,
    });
    hasAppliedPrefill.current = true;
  }, [shouldPrefill, prefillData, form]);

  // Reset the prefill flag when dialog is reopened
  useEffect(() => {
    if (!open) hasAppliedPrefill.current = false;
  }, [open]);

  const clearForm = () => {
    form.reset({
      type_ordonnance: lockedType,
      correction_prescrit: mode === 'optique',
      medicaments: [],
      notes_generales: '',
      prochain_rdv: '',
    });
  };

  // Verrouille le type_ordonnance sur celui dérivé du mode : si jamais
  // initialData ou un useEffect le change, on le réaligne sans dirty-marker.
  useEffect(() => {
    form.setValue('type_ordonnance', lockedType, { shouldDirty: false });
  }, [form, lockedType]);

  const { mutate: generateAdult, isPending: isGeneratingAdult } =
    useGenerateAdultOrdonnance();
  const { mutate: generateChild, isPending: isGeneratingChild } =
    useGenerateChildOrdonnance();
  const addNotification = useNotifications((s) => s.addNotification);

  const isPending = isGeneratingAdult || isGeneratingChild;

  const onSubmit = (values: OrdonnanceFormValues) => {
    const prescriptionData = buildPrescriptionData(values, mode);
    const payload = {
      examId,
      prescriptionData,
      typeOrdonnance: lockedType,
    };
    if (examType === 'adult') {
      generateAdult(payload, { onSuccess: onClose });
    } else {
      generateChild(payload, { onSuccess: onClose });
    }
  };

  // Surface form-validation failures as a toast so the clinician sees why
  // the PDF wasn't generated. Without this, handleSubmit's onValid simply
  // doesn't fire and the button feels inert.
  const onInvalid = (errors: Record<string, unknown>) => {
    // FieldErrors objects carry DOM `ref` properties — recursing into them
    // blows the stack. Skip non-error keys and cap depth.
    const SKIP_KEYS = new Set(['ref', 'refs', 'root', 'type', 'types']);
    const collect = (
      obj: unknown,
      path: string[] = [],
      depth = 0,
    ): string[] => {
      if (depth > 6 || !obj || typeof obj !== 'object') return [];
      const out: string[] = [];
      for (const [key, value] of Object.entries(
        obj as Record<string, unknown>,
      )) {
        if (SKIP_KEYS.has(key)) continue;
        if (key === 'message' && typeof value === 'string') {
          out.push(`${path.join('.') || 'form'} : ${value}`);
        } else if (value && typeof value === 'object') {
          out.push(...collect(value, [...path, key], depth + 1));
        }
      }
      return out;
    };
    const messages = collect(errors);
    const sample = messages.slice(0, 5).join(' • ');
    addNotification({
      type: 'error',
      title: 'Impossible de générer l’ordonnance',
      message: sample || 'Vérifiez les champs en rouge dans le formulaire.',
    });
  };

  // Le mode (verrouillé par le bouton qui ouvre le dialog) détermine quelle
  // section est rendue. Plus de section partagée — l'utilisateur prescrit
  // toujours UN type d'ordonnance à la fois.
  const showCorrection = mode === 'optique';
  const showMedicaments = mode === 'medicamenteuse';
  const wasPrefilled = hasAppliedPrefill.current && !initialData;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rédiger l&apos;ordonnance</DialogTitle>
          <DialogDescription>
            Renseignez la correction optique ou les médicaments prescrits, puis
            générez le PDF signé.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          {/* ---------------------------------------------------------------- */}
          {/* Badge mode (verrouillé par le bouton qui a ouvert le dialog)     */}
          {/* ---------------------------------------------------------------- */}
          <div className="bg-muted/40 flex items-center justify-between rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <span
                className={
                  mode === 'medicamenteuse'
                    ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
                    : 'rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-400/15 dark:text-sky-300'
                }
              >
                {MODE_LABELS[mode]}
              </span>
              <span className="text-xs text-muted-foreground">
                Verrouillé — fermez et rouvrez avec l&apos;autre bouton pour
                changer.
              </span>
            </div>
          </div>

          {/* Prefill banner (only on first generation) */}
          {wasPrefilled && (
            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
              <Info className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-200">
                  Valeurs pré-remplies depuis la réfraction objective.
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Vérifiez chaque valeur avant signature — le médecin reste
                  responsable des valeurs finales.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearForm}
                className="shrink-0 text-amber-700 hover:bg-amber-100 dark:text-amber-300"
              >
                <RefreshCcw className="mr-1 size-3.5" />
                Effacer
              </Button>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Section 1 — Correction optique                                   */}
          {/* ---------------------------------------------------------------- */}
          {showCorrection && (
            <div className="rounded-md border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">Correction optique</h3>

              <div className="mb-4 flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="correction_prescrit"
                  render={({ field }) => (
                    <Checkbox
                      id="correction_prescrit"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="correction_prescrit" className="cursor-pointer">
                  Prescrire une correction optique
                </Label>
              </div>

              {correctionPrescrit && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="w-20 shrink-0">Type</Label>
                    <Controller
                      control={form.control}
                      name="type_correction"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sélectionner…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VL">
                              Vision de loin (VL)
                            </SelectItem>
                            <SelectItem value="VP">
                              Vision de près (VP)
                            </SelectItem>
                            <SelectItem value="Progressive">
                              Progressive
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* OD / OG table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="w-10 pb-2 text-left font-medium text-muted-foreground"></th>
                          <th className="pb-2 text-center font-medium text-muted-foreground">
                            Sphère
                          </th>
                          <th className="pb-2 text-center font-medium text-muted-foreground">
                            Cylindre
                          </th>
                          <th className="pb-2 text-center font-medium text-muted-foreground">
                            Axe (°)
                          </th>
                          <th className="pb-2 text-center font-medium text-muted-foreground">
                            Addition
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(['od', 'og'] as const).map((eye) => (
                          <tr key={eye} className="border-border/50 border-b">
                            <td className="py-2 pr-2 font-semibold uppercase text-foreground">
                              {eye}
                            </td>
                            {(
                              ['sphere', 'cylindre', 'axe', 'add'] as const
                            ).map((field) => (
                              <td key={field} className="px-1 py-2">
                                <Input
                                  type="number"
                                  step={field === 'axe' ? '1' : '0.25'}
                                  min={field === 'axe' ? '0' : undefined}
                                  max={field === 'axe' ? '180' : undefined}
                                  className="w-20 text-center"
                                  {...form.register(`${eye}.${field}`)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* DP loin */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      DP (loin) :
                    </span>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">OD</Label>
                      <Input
                        type="number"
                        step="0.5"
                        className="w-20"
                        {...form.register('dp_od')}
                      />
                      <span className="text-xs text-muted-foreground">mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">OG</Label>
                      <Input
                        type="number"
                        step="0.5"
                        className="w-20"
                        {...form.register('dp_og')}
                      />
                      <span className="text-xs text-muted-foreground">mm</span>
                    </div>
                  </div>

                  {/* Vision de près (presbytie) */}
                  <div className="border-border/70 rounded-md border border-dashed p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <Controller
                        control={form.control}
                        name="vision_pres_prescrit"
                        render={({ field }) => (
                          <Checkbox
                            id="vision_pres_prescrit"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label
                        htmlFor="vision_pres_prescrit"
                        className="cursor-pointer text-sm font-medium"
                      >
                        Prescrire une vision de près (presbytie)
                      </Label>
                    </div>

                    {visionPresPrescrit && (
                      <div className="space-y-3">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="w-10 pb-2 text-left font-medium text-muted-foreground">
                                  Œil
                                </th>
                                <th className="pb-2 text-center font-medium text-muted-foreground">
                                  Sphère
                                </th>
                                <th className="pb-2 text-center font-medium text-muted-foreground">
                                  Cylindre
                                </th>
                                <th className="pb-2 text-center font-medium text-muted-foreground">
                                  Axe (°)
                                </th>
                                <th className="pb-2 text-center font-medium text-muted-foreground">
                                  Addition
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(['od_pres', 'og_pres'] as const).map((eye) => (
                                <tr
                                  key={eye}
                                  className="border-border/50 border-b"
                                >
                                  <td className="py-2 pr-2 font-semibold uppercase text-foreground">
                                    {eye === 'od_pres' ? 'OD' : 'OG'}
                                  </td>
                                  {(
                                    [
                                      'sphere',
                                      'cylindre',
                                      'axe',
                                      'add',
                                    ] as const
                                  ).map((field) => (
                                    <td key={field} className="px-1 py-2">
                                      <Input
                                        type="number"
                                        step={field === 'axe' ? '1' : '0.25'}
                                        min={field === 'axe' ? '0' : undefined}
                                        max={
                                          field === 'axe' ? '180' : undefined
                                        }
                                        className="w-20 text-center"
                                        {...form.register(`${eye}.${field}`)}
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            DP (près) :
                          </span>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">OD</Label>
                            <Input
                              type="number"
                              step="0.5"
                              className="w-20"
                              {...form.register('dp_pres_od')}
                            />
                            <span className="text-xs text-muted-foreground">
                              mm
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">OG</Label>
                            <Input
                              type="number"
                              step="0.5"
                              className="w-20"
                              {...form.register('dp_pres_og')}
                            />
                            <span className="text-xs text-muted-foreground">
                              mm
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ----- Options (mappé sur notes_generales côté backend) ----- */}
              <div className="mt-6 border-t border-border pt-4">
                <Label
                  htmlFor="optique_options"
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                >
                  Options
                </Label>
                <Input
                  id="optique_options"
                  placeholder="ex : verres antireflets, durci, photochromique…"
                  {...form.register('notes_generales')}
                />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Section 2 — Médicaments                                          */}
          {/* ---------------------------------------------------------------- */}
          {showMedicaments && (
            <div className="rounded-md border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold">
                Prescriptions médicamenteuses
              </h3>

              <div className="space-y-4">
                {fields.length === 0 && (
                  <p className="text-xs italic text-muted-foreground">
                    Aucun médicament prescrit. Cliquez sur « Ajouter » pour
                    rechercher dans le référentiel.
                  </p>
                )}
                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="border-border/70 bg-muted/30 rounded-md border p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="flex-1 text-xs text-muted-foreground">
                        Tapez ≥ 3 caractères pour rechercher (BDPM + référentiel
                        local)
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Supprimer la ligne"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr]">
                      <Controller
                        control={form.control}
                        name={`medicaments.${index}.nom_prescrit`}
                        render={({ field }) => (
                          <MedicamentSelector
                            value={field.value ?? ''}
                            onTextChange={field.onChange}
                            onSelect={(m) => {
                              form.setValue(
                                `medicaments.${index}.medicament_id`,
                                m.id,
                                { shouldDirty: true },
                              );
                              form.setValue(
                                `medicaments.${index}.nom_prescrit`,
                                m.nom_affiche || m.nom_commercial || m.dci,
                                { shouldDirty: true, shouldValidate: true },
                              );
                              form.setValue(
                                `medicaments.${index}.forme_galenique`,
                                m.forme_galenique,
                                { shouldDirty: true },
                              );
                              form.setValue(
                                `medicaments.${index}.dosage`,
                                m.dosage ?? '',
                                { shouldDirty: true },
                              );
                              form.setValue(
                                `medicaments.${index}.posologie`,
                                m.posologie_defaut ?? '',
                                { shouldDirty: true, shouldValidate: true },
                              );
                              form.setValue(
                                `medicaments.${index}.duree_jours`,
                                m.duree_defaut_jours ?? null,
                                { shouldDirty: true },
                              );
                            }}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name={`medicaments.${index}.forme_galenique`}
                        render={({ field }) => (
                          <Select
                            value={field.value ?? 'AUTRE'}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Forme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COLLYRE">Collyre</SelectItem>
                              <SelectItem value="POMMADE">Pommade</SelectItem>
                              <SelectItem value="COMPRIMES">
                                Comprimés
                              </SelectItem>
                              <SelectItem value="INJECTION">
                                Injection
                              </SelectItem>
                              <SelectItem value="GEL">Gel</SelectItem>
                              <SelectItem value="SOLUTION">Solution</SelectItem>
                              <SelectItem value="AUTRE">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <Input
                        placeholder="Dosage (ex: 0.5%)"
                        {...form.register(`medicaments.${index}.dosage`)}
                      />
                    </div>

                    <div className="mt-2 grid gap-2 md:grid-cols-[2fr_auto_auto_1fr]">
                      <Input
                        placeholder="Posologie (ex: 1 goutte 3 fois par jour)"
                        {...form.register(`medicaments.${index}.posologie`)}
                      />
                      <Controller
                        control={form.control}
                        name={`medicaments.${index}.oeil`}
                        render={({ field }) => (
                          <Select
                            value={field.value ?? 'OU'}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Œil" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OD">OD</SelectItem>
                              <SelectItem value="OG">OG</SelectItem>
                              <SelectItem value="OU">OU</SelectItem>
                              <SelectItem value="NA">NA</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Input
                        type="number"
                        min="1"
                        placeholder="Jours"
                        className="w-20"
                        {...form.register(`medicaments.${index}.duree_jours`)}
                      />
                      <Input
                        placeholder="Quantité (ex: 1 flacon)"
                        {...form.register(`medicaments.${index}.quantite`)}
                      />
                    </div>

                    <Input
                      placeholder="Instructions particulières (optionnel)"
                      className="mt-2"
                      {...form.register(`medicaments.${index}.instructions`)}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  append({
                    medicament_id: null,
                    nom_prescrit: '',
                    forme_galenique: 'AUTRE',
                    dosage: '',
                    oeil: 'OU',
                    posologie: '',
                    duree_jours: null,
                    quantite: '',
                    instructions: '',
                  } satisfies LigneMedicament)
                }
              >
                <Plus className="mr-1 size-4" />
                Ajouter un médicament
              </Button>

              {/* ----- Pied de bloc : notes générales + prochain RDV ----- */}
              <div className="mt-6 space-y-3 border-t border-border pt-4">
                <div>
                  <Label
                    htmlFor="notes_generales"
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    Instructions générales
                  </Label>
                  <Input
                    id="notes_generales"
                    placeholder="ex : ne pas arrêter brutalement le traitement"
                    {...form.register('notes_generales')}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="prochain_rdv"
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    Prochain RDV
                  </Label>
                  <Input
                    id="prochain_rdv"
                    placeholder="ex : Dans 3 mois — ou 15/06/2026"
                    {...form.register('prochain_rdv')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Footer                                                           */}
          {/* ---------------------------------------------------------------- */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Générer l&apos;ordonnance PDF
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
