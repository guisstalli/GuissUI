'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AXE_VISUEL_VALUES,
  BiomicroscopyAnteriorSchema,
  BiomicroscopyPosteriorSchema,
  type ClinicalExamFormValues,
  ConclusionSchema,
  CORNEE_VALUES,
  CRISTALLIN_VALUES,
  defaultBiomicroscopyAnterior,
  defaultBiomicroscopyPosterior,
  DIPLOPIE_TYPES,
  EYE_OPTIONS,
  EYE_SYMPTOMS,
  IRIS_VALUES,
  MACULA_VALUES,
  PAPILLE_VALUES,
  PBO_VALUES,
  PerimetrySchema,
  PlaintesSchema,
  POSITION_CRISTALLIN_VALUES,
  PROFONDEUR_VALUES,
  PUPILLE_VALUES,
  QUANTITE_ANOMALIE_VALUES,
  RETINIEN_VALUES,
  RPM_VALUES,
  SEGMENT_STATUS,
  TRANSPARENCE_VALUES,
  TYPE_ANOMALIE_VALUES,
  VAISSEAUX_VALUES,
  VISION_APTITUDE,
  VITRE_VALUES,
} from '@/features/exams/types';

// Schema combiné pour l'examen clinique complet
const clinicalExamFormSchema = z.object({
  plaintes: PlaintesSchema,
  perimetry: PerimetrySchema.optional(),
  od: z.object({
    bp_sg_anterieur: BiomicroscopyAnteriorSchema,
    bp_sg_posterieur: BiomicroscopyPosteriorSchema,
  }),
  og: z.object({
    bp_sg_anterieur: BiomicroscopyAnteriorSchema,
    bp_sg_posterieur: BiomicroscopyPosteriorSchema,
  }),
  conclusion: ConclusionSchema,
});

interface ClinicalExamFormProps {
  initialData?: Partial<ClinicalExamFormValues>;
  onSubmit?: (data: ClinicalExamFormValues) => void;
}

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

const PBO_LABELS: Record<(typeof PBO_VALUES)[number], string> = {
  NORMAL: 'Normal',
  SCOTOME_CENTRAL: 'Scotome central',
  SCOTOME_PERIPHERIQUE: 'Scotome périphérique',
  AMPUTATION: 'Amputation',
};

const VISION_LABELS: Record<(typeof VISION_APTITUDE)[number], string> = {
  compatible: 'Compatible',
  incompatible: 'Incompatible',
  a_risque: 'À risque',
};

export function ClinicalExamForm({
  initialData,
  onSubmit,
}: ClinicalExamFormProps) {
  const form = useForm<ClinicalExamFormValues>({
    resolver: zodResolver(clinicalExamFormSchema),
    defaultValues: {
      plaintes: {
        eye_symptom: initialData?.plaintes?.eye_symptom || ['AUCUN'],
        autre: null,
        diplopie: false,
        diplopie_type: null,
        strabisme: false,
        strabisme_eye: null,
        nystagmus: false,
        nystagmus_eye: null,
        ptosis: false,
        ptosis_eye: null,
      },
      perimetry: {
        pbo: ['NORMAL'],
        limite_superieure: null,
        limite_inferieure: null,
        limite_temporale_droit: null,
        limite_temporale_gauche: null,
        etendue_horizontal: null,
        score_esternmen: null,
      },
      od: {
        bp_sg_anterieur: { ...defaultBiomicroscopyAnterior },
        bp_sg_posterieur: { ...defaultBiomicroscopyPosterior },
      },
      og: {
        bp_sg_anterieur: { ...defaultBiomicroscopyAnterior },
        bp_sg_posterieur: { ...defaultBiomicroscopyPosterior },
      },
      conclusion: {
        vision: null,
        cat: null,
        traitement: null,
        observation: null,
        //rv: false,
        //date_prochain_rendez_vous: null,
        diagnostic_cim_11: [],
      },
    },
    mode: 'onBlur',
  });

  // Watchers pour les champs conditionnels
  const eyeSymptoms = useWatch({
    control: form.control,
    name: 'plaintes.eye_symptom',
  });
  const diplopie = useWatch({
    control: form.control,
    name: 'plaintes.diplopie',
  });
  const strabisme = useWatch({
    control: form.control,
    name: 'plaintes.strabisme',
  });
  const nystagmus = useWatch({
    control: form.control,
    name: 'plaintes.nystagmus',
  });
  const ptosis = useWatch({ control: form.control, name: 'plaintes.ptosis' });

  const odSegmentAnterior = useWatch({
    control: form.control,
    name: 'od.bp_sg_anterieur.segment',
  });
  const ogSegmentAnterior = useWatch({
    control: form.control,
    name: 'og.bp_sg_anterieur.segment',
  });
  const odSegmentPosterior = useWatch({
    control: form.control,
    name: 'od.bp_sg_posterieur.segment',
  });
  const ogSegmentPosterior = useWatch({
    control: form.control,
    name: 'og.bp_sg_posterieur.segment',
  });

  const odTransparence = useWatch({
    control: form.control,
    name: 'od.bp_sg_anterieur.transparence',
  });
  const ogTransparence = useWatch({
    control: form.control,
    name: 'og.bp_sg_anterieur.transparence',
  });
  const odCornee = useWatch({
    control: form.control,
    name: 'od.bp_sg_anterieur.cornee',
  });
  const ogCornee = useWatch({
    control: form.control,
    name: 'og.bp_sg_anterieur.cornee',
  });
  const odIris = useWatch({
    control: form.control,
    name: 'od.bp_sg_anterieur.iris',
  });
  const ogIris = useWatch({
    control: form.control,
    name: 'og.bp_sg_anterieur.iris',
  });

  //const rv = useWatch({ control: form.control, name: 'conclusion.rv' });

  // Nettoyage automatique des champs conditionnels - Plaintes
  useEffect(() => {
    if (!eyeSymptoms?.includes('AUTRES')) {
      form.setValue('plaintes.autre', null);
    }
  }, [eyeSymptoms, form]);

  useEffect(() => {
    if (!diplopie) {
      form.setValue('plaintes.diplopie_type', null);
    }
  }, [diplopie, form]);

  useEffect(() => {
    if (!strabisme) {
      form.setValue('plaintes.strabisme_eye', null);
    }
  }, [strabisme, form]);

  useEffect(() => {
    if (!nystagmus) {
      form.setValue('plaintes.nystagmus_eye', null);
    }
  }, [nystagmus, form]);

  useEffect(() => {
    if (!ptosis) {
      form.setValue('plaintes.ptosis_eye', null);
    }
  }, [ptosis, form]);

  // Nettoyage automatique - Segment antérieur OD
  useEffect(() => {
    if (odSegmentAnterior === 'NORMAL') {
      form.setValue('od.bp_sg_anterieur.cornee', null);
      form.setValue('od.bp_sg_anterieur.cornee_autre', null);
      form.setValue('od.bp_sg_anterieur.profondeur', null);
      form.setValue('od.bp_sg_anterieur.transparence', null);
      form.setValue('od.bp_sg_anterieur.type_anomalie_value', null);
      form.setValue('od.bp_sg_anterieur.type_anomalie_autre', null);
      form.setValue('od.bp_sg_anterieur.quantite_anomalie', null);
      form.setValue('od.bp_sg_anterieur.pupille', null);
      form.setValue('od.bp_sg_anterieur.axe_visuel', null);
      form.setValue('od.bp_sg_anterieur.rpm', null);
      form.setValue('od.bp_sg_anterieur.iris', null);
      form.setValue('od.bp_sg_anterieur.iris_autres', null);
      form.setValue('od.bp_sg_anterieur.cristallin', null);
      form.setValue('od.bp_sg_anterieur.position_cristallin', null);
    }
  }, [odSegmentAnterior, form]);

  // Nettoyage automatique - Segment antérieur OG
  useEffect(() => {
    if (ogSegmentAnterior === 'NORMAL') {
      form.setValue('og.bp_sg_anterieur.cornee', null);
      form.setValue('og.bp_sg_anterieur.cornee_autre', null);
      form.setValue('og.bp_sg_anterieur.profondeur', null);
      form.setValue('og.bp_sg_anterieur.transparence', null);
      form.setValue('og.bp_sg_anterieur.type_anomalie_value', null);
      form.setValue('og.bp_sg_anterieur.type_anomalie_autre', null);
      form.setValue('og.bp_sg_anterieur.quantite_anomalie', null);
      form.setValue('og.bp_sg_anterieur.pupille', null);
      form.setValue('og.bp_sg_anterieur.axe_visuel', null);
      form.setValue('og.bp_sg_anterieur.rpm', null);
      form.setValue('og.bp_sg_anterieur.iris', null);
      form.setValue('og.bp_sg_anterieur.iris_autres', null);
      form.setValue('og.bp_sg_anterieur.cristallin', null);
      form.setValue('og.bp_sg_anterieur.position_cristallin', null);
    }
  }, [ogSegmentAnterior, form]);

  // Nettoyage automatique - Segment postérieur OD
  useEffect(() => {
    if (odSegmentPosterior === 'NORMAL') {
      form.setValue('od.bp_sg_posterieur.vitre', null);
      form.setValue('od.bp_sg_posterieur.vitre_autres', null);
      form.setValue('od.bp_sg_posterieur.papille', null);
      form.setValue('od.bp_sg_posterieur.papille_autres', null);
      form.setValue('od.bp_sg_posterieur.macula', null);
      form.setValue('od.bp_sg_posterieur.retinien_peripherique', null);
      form.setValue('od.bp_sg_posterieur.retinien_peripherique_autre', null);
      form.setValue('od.bp_sg_posterieur.vaissaux', null);
      form.setValue('od.bp_sg_posterieur.cd', null);
      form.setValue('od.bp_sg_posterieur.observation', null);
    }
  }, [odSegmentPosterior, form]);

  // Nettoyage automatique - Segment postérieur OG
  useEffect(() => {
    if (ogSegmentPosterior === 'NORMAL') {
      form.setValue('og.bp_sg_posterieur.vitre', null);
      form.setValue('og.bp_sg_posterieur.vitre_autres', null);
      form.setValue('og.bp_sg_posterieur.papille', null);
      form.setValue('og.bp_sg_posterieur.papille_autres', null);
      form.setValue('og.bp_sg_posterieur.macula', null);
      form.setValue('og.bp_sg_posterieur.retinien_peripherique', null);
      form.setValue('og.bp_sg_posterieur.retinien_peripherique_autre', null);
      form.setValue('og.bp_sg_posterieur.vaissaux', null);
      form.setValue('og.bp_sg_posterieur.cd', null);
      form.setValue('og.bp_sg_posterieur.observation', null);
    }
  }, [ogSegmentPosterior, form]);

  // Nettoyage transparence conditionnelle
  useEffect(() => {
    if (odTransparence !== 'ANORMALE') {
      form.setValue('od.bp_sg_anterieur.type_anomalie_value', null);
      form.setValue('od.bp_sg_anterieur.type_anomalie_autre', null);
      form.setValue('od.bp_sg_anterieur.quantite_anomalie', null);
    }
  }, [odTransparence, form]);

  useEffect(() => {
    if (ogTransparence !== 'ANORMALE') {
      form.setValue('og.bp_sg_anterieur.type_anomalie_value', null);
      form.setValue('og.bp_sg_anterieur.type_anomalie_autre', null);
      form.setValue('og.bp_sg_anterieur.quantite_anomalie', null);
    }
  }, [ogTransparence, form]);

  // Nettoyage cornée autre
  useEffect(() => {
    if (odCornee !== 'AUTRE') {
      form.setValue('od.bp_sg_anterieur.cornee_autre', null);
    }
  }, [odCornee, form]);

  useEffect(() => {
    if (ogCornee !== 'AUTRE') {
      form.setValue('og.bp_sg_anterieur.cornee_autre', null);
    }
  }, [ogCornee, form]);

  // Nettoyage iris autre
  useEffect(() => {
    if (odIris !== 'AUTRES') {
      form.setValue('od.bp_sg_anterieur.iris_autres', null);
    }
  }, [odIris, form]);

  useEffect(() => {
    if (ogIris !== 'AUTRES') {
      form.setValue('og.bp_sg_anterieur.iris_autres', null);
    }
  }, [ogIris, form]);

  const handleSubmit = (data: ClinicalExamFormValues) => {
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
        id="clinical-exam-form"
      >
        {/* Section Plaintes */}
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
                name="plaintes.strabisme_eye"
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

        {/* Section Périmétrie */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Périmétrie
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Examen du champ visuel binoculaire
            </p>
          </div>

          {/* PBO Multi-select */}
          <FormField
            control={form.control}
            name="perimetry.pbo"
            render={() => (
              <FormItem>
                <FormLabel>
                  Périmétrie binoculaire{' '}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                  {PBO_VALUES.map((value) => (
                    <FormField
                      key={value}
                      control={form.control}
                      name="perimetry.pbo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(value)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, value]);
                                } else {
                                  field.onChange(
                                    currentValue.filter((v) => v !== value),
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {PBO_LABELS[value]}
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

          {/* Limites */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name="perimetry.limite_superieure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Limite supérieure (°)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="90"
                      placeholder="0-90"
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
              name="perimetry.limite_inferieure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Limite inférieure (°)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="90"
                      placeholder="0-90"
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
              name="perimetry.limite_temporale_droit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Limite temporale droite (°)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      placeholder="0-120"
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
              name="perimetry.limite_temporale_gauche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Limite temporale gauche (°)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      placeholder="0-120"
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="perimetry.etendue_horizontal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Étendue horizontale (°)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="180"
                      placeholder="0-180"
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
              name="perimetry.score_esternmen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Score d&apos;Esterman (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
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
        </section>

        {/* Section Biomicroscopie */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Biomicroscopie
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Examen à la lampe à fente - Segment antérieur et postérieur
            </p>
          </div>

          <Tabs defaultValue="od" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="od">OD (Œil droit)</TabsTrigger>
              <TabsTrigger value="og">OG (Œil gauche)</TabsTrigger>
            </TabsList>

            {/* OD */}
            <TabsContent value="od" className="space-y-6">
              {/* Segment Antérieur OD */}
              <div className="space-y-4 rounded-md border border-border p-4">
                <h4 className="text-sm font-medium">Segment Antérieur OD</h4>
                <FormField
                  control={form.control}
                  name="od.bp_sg_anterieur.segment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>État du segment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEGMENT_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === 'NORMAL'
                                ? 'Normal'
                                : 'Présence de lésion'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {odSegmentAnterior === 'PRESENCE_LESION' && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="od.bp_sg_anterieur.cornee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Cornée</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CORNEE_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {odCornee === 'AUTRE' && (
                        <FormField
                          control={form.control}
                          name="od.bp_sg_anterieur.cornee_autre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Précisez cornée{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Détail..."
                                  {...field}
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
                      <FormField
                        control={form.control}
                        name="od.bp_sg_anterieur.profondeur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Profondeur CA
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROFONDEUR_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="od.bp_sg_anterieur.transparence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Transparence
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRANSPARENCE_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {odTransparence === 'ANORMALE' && (
                      <div className="bg-muted/30 grid grid-cols-2 gap-4 rounded-md p-3 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="od.bp_sg_anterieur.type_anomalie_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Type d&apos;anomalie
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TYPE_ANOMALIE_VALUES.map((v) => (
                                    <SelectItem key={v} value={v}>
                                      {v.charAt(0) + v.slice(1).toLowerCase()}
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
                          name="od.bp_sg_anterieur.quantite_anomalie"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Quantité
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {QUANTITE_ANOMALIE_VALUES.map((v) => (
                                    <SelectItem key={v} value={v}>
                                      {v.charAt(0) + v.slice(1).toLowerCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="od.bp_sg_anterieur.pupille"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Pupille</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PUPILLE_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="od.bp_sg_anterieur.axe_visuel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Axe visuel
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AXE_VISUEL_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="od.bp_sg_anterieur.rpm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">RPM</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RPM_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="od.bp_sg_anterieur.iris"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Iris</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {IRIS_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {odIris === 'AUTRES' && (
                        <FormField
                          control={form.control}
                          name="od.bp_sg_anterieur.iris_autres"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Précisez iris{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Détail..."
                                  {...field}
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
                      <FormField
                        control={form.control}
                        name="od.bp_sg_anterieur.cristallin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Cristallin
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CRISTALLIN_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="od.bp_sg_anterieur.position_cristallin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Position cristallin
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {POSITION_CRISTALLIN_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Segment Postérieur OD */}
              <div className="space-y-4 rounded-md border border-border p-4">
                <h4 className="text-sm font-medium">Segment Postérieur OD</h4>
                <FormField
                  control={form.control}
                  name="od.bp_sg_posterieur.segment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>État du segment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEGMENT_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === 'NORMAL'
                                ? 'Normal'
                                : 'Présence de lésion'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {odSegmentPosterior === 'PRESENCE_LESION' && (
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="od.bp_sg_posterieur.vitre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Vitré</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VITRE_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.replace('_', ' ').charAt(0) +
                                    v.replace('_', ' ').slice(1).toLowerCase()}
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
                      name="od.bp_sg_posterieur.papille"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Papille</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAPILLE_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.charAt(0) + v.slice(1).toLowerCase()}
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
                      name="od.bp_sg_posterieur.macula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Macula</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MACULA_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.replace('_', ' ').charAt(0) +
                                    v.replace('_', ' ').slice(1).toLowerCase()}
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
                      name="od.bp_sg_posterieur.retinien_peripherique"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Rétine périphérique
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RETINIEN_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.charAt(0) + v.slice(1).toLowerCase()}
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
                      name="od.bp_sg_posterieur.vaissaux"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Vaisseaux</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VAISSEAUX_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.charAt(0) + v.slice(1).toLowerCase()}
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
                      name="od.bp_sg_posterieur.cd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Cup/Disc (C/D)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              placeholder="0.0 - 1.0"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* OG - Structure identique à OD */}
            <TabsContent value="og" className="space-y-6">
              {/* Segment Antérieur OG */}
              <div className="space-y-4 rounded-md border border-border p-4">
                <h4 className="text-sm font-medium">Segment Antérieur OG</h4>
                <FormField
                  control={form.control}
                  name="og.bp_sg_anterieur.segment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>État du segment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEGMENT_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === 'NORMAL'
                                ? 'Normal'
                                : 'Présence de lésion'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {ogSegmentAnterior === 'PRESENCE_LESION' && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="og.bp_sg_anterieur.cornee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Cornée</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CORNEE_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {ogCornee === 'AUTRE' && (
                        <FormField
                          control={form.control}
                          name="og.bp_sg_anterieur.cornee_autre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Précisez cornée{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Détail..."
                                  {...field}
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
                      <FormField
                        control={form.control}
                        name="og.bp_sg_anterieur.profondeur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Profondeur CA
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROFONDEUR_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="og.bp_sg_anterieur.transparence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Transparence
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRANSPARENCE_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {ogTransparence === 'ANORMALE' && (
                      <div className="bg-muted/30 grid grid-cols-2 gap-4 rounded-md p-3 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="og.bp_sg_anterieur.type_anomalie_value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Type d&apos;anomalie
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TYPE_ANOMALIE_VALUES.map((v) => (
                                    <SelectItem key={v} value={v}>
                                      {v.charAt(0) + v.slice(1).toLowerCase()}
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
                          name="og.bp_sg_anterieur.quantite_anomalie"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Quantité
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {QUANTITE_ANOMALIE_VALUES.map((v) => (
                                    <SelectItem key={v} value={v}>
                                      {v.charAt(0) + v.slice(1).toLowerCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="og.bp_sg_anterieur.pupille"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Pupille</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PUPILLE_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="og.bp_sg_anterieur.axe_visuel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Axe visuel
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AXE_VISUEL_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="og.bp_sg_anterieur.rpm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">RPM</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RPM_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="og.bp_sg_anterieur.iris"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Iris</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {IRIS_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {ogIris === 'AUTRES' && (
                        <FormField
                          control={form.control}
                          name="og.bp_sg_anterieur.iris_autres"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Précisez iris{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Détail..."
                                  {...field}
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
                      <FormField
                        control={form.control}
                        name="og.bp_sg_anterieur.cristallin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Cristallin
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CRISTALLIN_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
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
                        name="og.bp_sg_anterieur.position_cristallin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Position cristallin
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {POSITION_CRISTALLIN_VALUES.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Segment Postérieur OG */}
              <div className="space-y-4 rounded-md border border-border p-4">
                <h4 className="text-sm font-medium">Segment Postérieur OG</h4>
                <FormField
                  control={form.control}
                  name="og.bp_sg_posterieur.segment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>État du segment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEGMENT_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === 'NORMAL'
                                ? 'Normal'
                                : 'Présence de lésion'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {ogSegmentPosterior === 'PRESENCE_LESION' && (
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="og.bp_sg_posterieur.vitre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Vitré</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VITRE_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.replace('_', ' ').charAt(0) +
                                    v.replace('_', ' ').slice(1).toLowerCase()}
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
                      name="og.bp_sg_posterieur.papille"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Papille</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAPILLE_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.charAt(0) + v.slice(1).toLowerCase()}
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
                      name="og.bp_sg_posterieur.macula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Macula</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MACULA_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.replace('_', ' ').charAt(0) +
                                    v.replace('_', ' ').slice(1).toLowerCase()}
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
                      name="og.bp_sg_posterieur.retinien_peripherique"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Rétine périphérique
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RETINIEN_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.charAt(0) + v.slice(1).toLowerCase()}
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
                      name="og.bp_sg_posterieur.vaissaux"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Vaisseaux</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VAISSEAUX_VALUES.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v.charAt(0) + v.slice(1).toLowerCase()}
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
                      name="og.bp_sg_posterieur.cd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Cup/Disc (C/D)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              placeholder="0.0 - 1.0"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Section Conclusion */}
        <section className="space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Conclusion
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Diagnostic, traitement et recommandations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="conclusion.vision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aptitude visuelle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VISION_APTITUDE.map((v) => (
                        <SelectItem key={v} value={v}>
                          {VISION_LABELS[v]}
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
              name="conclusion.cat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie de permis</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: B, C, D..."
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="conclusion.traitement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Traitement prescrit</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez le traitement prescrit..."
                    className="min-h-20 resize-none"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="conclusion.observation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observations</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observations complémentaires..."
                    className="min-h-20 resize-none"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rendez-vous */}
          {/*
          <div className="space-y-3 rounded-md border border-border p-4">
            <FormField
              control={form.control}
              name="conclusion.rv"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Rendez-vous de suivi nécessaire</FormLabel>
                    <FormDescription>
                      Cochez si le patient doit revenir pour un suivi
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {rv && (
              <FormField
                control={form.control}
                name="conclusion.date_prochain_rendez_vous"
                render={({ field }) => (
                  <FormItem className="ml-6 max-w-xs">
                    <FormLabel>Date du prochain rendez-vous</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
          </div>
          */}
        </section>
      </form>
    </Form>
  );
}
