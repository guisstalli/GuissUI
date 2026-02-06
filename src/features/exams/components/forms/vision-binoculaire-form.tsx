'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form';
import {
  COVER_TEST_DIRECTIONS,
  COVER_TEST_TYPES,
  HIRSCHBERG_TYPES,
  HIRSCHBERG_DETAIL_VALUES,
  LATERALITY_VALUES,
  REFLEX_VALUES,
  STEREOSCOPY_LANG_VALUES,
} from '@/features/exams/types';

interface VisionBinoculaireFormProps {
  namePrefix?: string;
}

// Labels alignés avec les enums Python (minuscules)
const LABELS = {
  HIRSCHBERG: {
    orthotropie: 'Orthotropie',
    esotropie: 'Ésotropie',
    exotropie: 'Exotropie',
  } as Record<string, string>,
  HIRSCHBERG_DETAIL: {
    bord_pupillaire: 'Bord pupillaire',
    iris: 'Iris',
    limbe: 'Limbe',
  } as Record<string, string>,
  STEREOSCOPY: {
    etoile: 'Étoile',
    lune: 'Lune',
    auto: 'Auto',
    elephant: 'Éléphant',
  } as Record<string, string>,
  REFLEX: {
    rouge: 'Rouge (Normal)',
    leucocorie: 'Leucocorie',
    anormal: 'Anormal',
  } as Record<string, string>,
  LATERALITY: {
    od: 'OD (Droit)',
    og: 'OG (Gauche)',
    odg: 'ODG (Les deux)',
  } as Record<string, string>,
  COVER_TEST_TYPE: {
    orthotropie: 'Orthotropie',
    tropie: 'Tropie',
    phorie: 'Phorie',
  } as Record<string, string>,
  COVER_TEST_DIRECTION: {
    exo: 'EXO',
    eso: 'ESO',
    normale: 'Normale',
  } as Record<string, string>,
};

/**
 * Vision Binoculaire Form Component
 * Child exam ONLY
 *
 * FIELDS:
 * 1. Hirschberg - Type + Detail REQUIRED if not Orthotropie
 * 2. Stereoscopy (Lang II) - Choice selection
 * 3. Pupillary Reflex - Reflex + Laterality REQUIRED if reflex present
 * 4. Cover Test VL/VP - Type → Direction if not Orthotropie
 *
 * DESIGN: Logic-heavy, Show/hide dependent fields, Auto cleanup
 */
export function VisionBinoculaireForm({
  namePrefix = '',
}: VisionBinoculaireFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';

  // Watchers
  const hirschbergType = useWatch({
    control: form.control,
    name: `${prefix}hirschberg_type`,
  });
  const pupillaryReflex = useWatch({
    control: form.control,
    name: `${prefix}pupillary_reflex`,
  });
  const coverTestVlType = useWatch({
    control: form.control,
    name: `${prefix}cover_test_vl_type`,
  });
  const coverTestVpType = useWatch({
    control: form.control,
    name: `${prefix}cover_test_vp_type`,
  });

  // Auto-cleanup: Hirschberg detail
  useEffect(() => {
    if (hirschbergType === 'orthotropie' || !hirschbergType) {
      form.setValue(`${prefix}hirschberg_detail`, null);
    }
  }, [hirschbergType, form, prefix]);

  // Auto-cleanup: Pupillary reflex laterality
  useEffect(() => {
    if (pupillaryReflex === 'rouge' || !pupillaryReflex) {
      form.setValue(`${prefix}pupillary_reflex_laterality`, null);
    }
  }, [pupillaryReflex, form, prefix]);

  // Auto-cleanup: Cover Test VL direction
  useEffect(() => {
    if (coverTestVlType === 'orthotropie' || !coverTestVlType) {
      form.setValue(`${prefix}cover_test_vl_direction`, null);
    }
  }, [coverTestVlType, form, prefix]);

  // Auto-cleanup: Cover Test VP direction
  useEffect(() => {
    if (coverTestVpType === 'orthotropie' || !coverTestVpType) {
      form.setValue(`${prefix}cover_test_vp_direction`, null);
    }
  }, [coverTestVpType, form, prefix]);

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Vision Binoculaire
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Évaluation de la vision binoculaire (examen pédiatrique)
        </p>
      </div>

      {/* 1. Hirschberg */}
      <div className="space-y-3 rounded-md border border-border p-4">
        <h4 className="text-sm font-medium">Test de Hirschberg</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`${prefix}hirschberg_type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
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
                    {HIRSCHBERG_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {LABELS.HIRSCHBERG[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {hirschbergType && hirschbergType !== 'orthotropie' && (
            <FormField
              control={form.control}
              name={`${prefix}hirschberg_detail`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Détail <span className="text-destructive">*</span>
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
                      {HIRSCHBERG_DETAIL_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {LABELS.HIRSCHBERG_DETAIL[value]}
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
      </div>

      {/* 2. Stereoscopy (Lang II) */}
      <div className="space-y-3 rounded-md border border-border p-4">
        <h4 className="text-sm font-medium">Stéréoscopie (Lang II)</h4>
        <FormField
          control={form.control}
          name={`${prefix}stereoscopy_lang`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Résultat</FormLabel>
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
                  {STEREOSCOPY_LANG_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {LABELS.STEREOSCOPY[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 3. Pupillary Reflex */}
      <div className="space-y-3 rounded-md border border-border p-4">
        <h4 className="text-sm font-medium">Réflexe Pupillaire</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`${prefix}pupillary_reflex`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Réflexe</FormLabel>
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
                    {REFLEX_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {LABELS.REFLEX[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {pupillaryReflex && pupillaryReflex !== 'rouge' && (
            <FormField
              control={form.control}
              name={`${prefix}pupillary_reflex_laterality`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Latéralité <span className="text-destructive">*</span>
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
                      {LATERALITY_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {LABELS.LATERALITY[value]}
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
      </div>

      {/* 4. Cover Test */}
      <div className="space-y-4 rounded-md border border-border p-4">
        <h4 className="text-sm font-medium">Cover Test</h4>

        {/* VL (Vision Loin) */}
        <div className="space-y-3">
          <FormDescription>Vision de Loin (VL)</FormDescription>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${prefix}cover_test_vl_type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
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
                      {COVER_TEST_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {LABELS.COVER_TEST_TYPE[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {coverTestVlType && coverTestVlType !== 'orthotropie' && (
              <FormField
                control={form.control}
                name={`${prefix}cover_test_vl_direction`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Direction <span className="text-destructive">*</span>
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
                        {COVER_TEST_DIRECTIONS.map((dir) => (
                          <SelectItem key={dir} value={dir}>
                            {LABELS.COVER_TEST_DIRECTION[dir]}
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
        </div>

        {/* VP (Vision Près) */}
        <div className="space-y-3 border-t border-border pt-4">
          <FormDescription>Vision de Près (VP)</FormDescription>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${prefix}cover_test_vp_type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
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
                      {COVER_TEST_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {LABELS.COVER_TEST_TYPE[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {coverTestVpType && coverTestVpType !== 'orthotropie' && (
              <FormField
                control={form.control}
                name={`${prefix}cover_test_vp_direction`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Direction <span className="text-destructive">*</span>
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
                        {COVER_TEST_DIRECTIONS.map((dir) => (
                          <SelectItem key={dir} value={dir}>
                            {LABELS.COVER_TEST_DIRECTION[dir]}
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
        </div>
      </div>
    </section>
  );
}
