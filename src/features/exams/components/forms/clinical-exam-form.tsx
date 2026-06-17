'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

import { Form } from '@/components/ui/form';
import { BiomicroscopyAnteriorSchema, BiomicroscopyPosteriorSchema, type ClinicalExamFormValues, ConclusionSchema, defaultBiomicroscopyAnterior, defaultBiomicroscopyPosterior, PerimetrySchema, PlaintesSchema } from '@/features/exams/types/schemas';

import { BiomicroscopySection } from './clinical-biomicroscopy-section';
import { ConclusionSection } from './clinical-conclusion-section';
import { PerimetrySection } from './clinical-perimetry-section';
import { PlaintesSection } from './clinical-plaintes-section';

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
        strabisme_type: null,
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
      form.setValue('plaintes.strabisme_type', null);
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
      form.setValue('od.bp_sg_posterieur.retine_peripherique', null);
      form.setValue('od.bp_sg_posterieur.retine_peripherique_autre', null);
      form.setValue('od.bp_sg_posterieur.vaissaux_retinien', null);
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
      form.setValue('og.bp_sg_posterieur.retine_peripherique', null);
      form.setValue('og.bp_sg_posterieur.retine_peripherique_autre', null);
      form.setValue('og.bp_sg_posterieur.vaissaux_retinien', null);
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
        <PlaintesSection
          form={form}
          eyeSymptoms={eyeSymptoms}
          diplopie={diplopie}
          strabisme={strabisme}
          nystagmus={nystagmus}
          ptosis={ptosis}
        />

        {/* Section Périmétrie */}
        <PerimetrySection form={form} />

        {/* Section Biomicroscopie */}
        <BiomicroscopySection
          form={form}
          odSegmentAnterior={odSegmentAnterior}
          odCornee={odCornee}
          odTransparence={odTransparence}
          odIris={odIris}
          odSegmentPosterior={odSegmentPosterior}
          ogSegmentAnterior={ogSegmentAnterior}
          ogCornee={ogCornee}
          ogTransparence={ogTransparence}
          ogIris={ogIris}
          ogSegmentPosterior={ogSegmentPosterior}
        />

        {/* Section Conclusion */}
        <ConclusionSection form={form} />
      </form>
    </Form>
  );
}
