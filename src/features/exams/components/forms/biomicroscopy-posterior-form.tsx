'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui/form';
import {
  MACULA_VALUES,
  PAPILLE_VALUES,
  RETINIEN_VALUES,
  SEGMENT_STATUS,
  VAISSEAUX_VALUES,
  VITRE_VALUES,
} from '@/features/exams/types';

interface BiomicroscopyPosteriorFormProps {
  namePrefix: string; // Required: 'od.bp_sg_posterieur' or 'og.bp_sg_posterieur'
  eyeLabel: string;
}

const LABELS = {
  SEGMENT_STATUS: {
    NORMAL: 'Normal',
    PRESENCE_LESION: 'Présence de lésion',
    REMANIEMENT_TOTAL: 'Remaniement total',
  } as Record<string, string>,
  VITRE: {
    NORMAL: 'Normal',
    CORPS_FLOTTANTS: 'Corps flottants',
    HEMORRAGIE: 'Hémorragie',
    HYALITE: 'Hyalite',
    PVR: 'PVR',
    AUTRES: 'Autres',
  } as Record<string, string>,
  PAPILLE: {
    NORMALE: 'Normale',
    EXCAVATION_ELARGIE: 'Excavation élargie',
    ATROPHIE: 'Atrophie',
    OEDEME: 'Œdème',
    DYSMORPHIE: 'Dysmorphie',
    AUTRES: 'Autres',
  } as Record<string, string>,
  MACULA: {
    NORMAL: 'Normale',
    CICATRICE: 'Cicatrice',
    OEDEME: 'Œdème',
    DMLA: 'DMLA',
  } as Record<string, string>,
  RETINIEN: {
    NORMAL: 'Normale',
    CICATRICE: 'Cicatrice',
    OEDEME: 'Œdème',
    HEMORRAGIE: 'Hémorragie',
    EXUDATS: 'Exudats',
    DEHISCENCE: 'Déhiscence',
    AUTRE: 'Autre',
  } as Record<string, string>,
  VAISSEAUX: {
    NORMAUX: 'Normaux',
    ARTERIOSCLEROSE: 'Artériosclérose',
    OVR: 'OVR',
    OAR: 'OAR',
    NEOVAISSEUX: 'Néovaisseaux',
  } as Record<string, string>,
};

/**
 * Biomicroscopy Posterior Segment Form Component
 * Adult exam ONLY
 *
 * TOP LEVEL: Segment status: Normal / Presence Lesion
 * IF Normal: All detailed fields hidden and cleared
 * IF Presence Lesion: Detailed fields enabled and REQUIRED
 * - C/D Ratio: 0.0 – 1.0
 * - Observation text allowed
 */
export function BiomicroscopyPosteriorForm({
  namePrefix,
  eyeLabel,
}: BiomicroscopyPosteriorFormProps) {
  const form = useFormContext();

  const segment = useWatch({
    control: form.control,
    name: `${namePrefix}.segment`,
  });
  const vitre = useWatch({
    control: form.control,
    name: `${namePrefix}.vitre`,
  });
  const papille = useWatch({
    control: form.control,
    name: `${namePrefix}.papille`,
  });
  const retinien = useWatch({
    control: form.control,
    name: `${namePrefix}.retinien_peripherique`,
  });

  const isNormal = segment === 'NORMAL';
  const isPresenceLesion = segment === 'PRESENCE_LESION';

  // Auto-clear all fields when segment is NORMAL
  useEffect(() => {
    if (isNormal) {
      form.setValue(`${namePrefix}.vitre`, null);
      form.setValue(`${namePrefix}.vitre_autres`, null);
      form.setValue(`${namePrefix}.papille`, null);
      form.setValue(`${namePrefix}.papille_autres`, null);
      form.setValue(`${namePrefix}.macula`, null);
      form.setValue(`${namePrefix}.retinien_peripherique`, null);
      form.setValue(`${namePrefix}.retinien_peripherique_autre`, null);
      form.setValue(`${namePrefix}.vaissaux`, null);
      form.setValue(`${namePrefix}.cd`, null);
      form.setValue(`${namePrefix}.observation`, null);
    }
  }, [isNormal, form, namePrefix]);

  // Auto-clear "autres" fields
  useEffect(() => {
    if (vitre !== 'AUTRES') {
      form.setValue(`${namePrefix}.vitre_autres`, null);
    }
  }, [vitre, form, namePrefix]);

  useEffect(() => {
    if (papille !== 'AUTRES') {
      form.setValue(`${namePrefix}.papille_autres`, null);
    }
  }, [papille, form, namePrefix]);

  useEffect(() => {
    if (retinien !== 'AUTRE') {
      form.setValue(`${namePrefix}.retinien_peripherique_autre`, null);
    }
  }, [retinien, form, namePrefix]);

  // Helper pour afficher l'indicateur obligatoire
  const RequiredIndicator = () =>
    isPresenceLesion ? <span className="text-destructive">*</span> : null;

  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h4 className="text-sm font-semibold text-foreground">
          Segment Postérieur - {eyeLabel}
        </h4>
        {isPresenceLesion && (
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="text-destructive">*</span> Champs obligatoires en
            cas de présence de lésion
          </p>
        )}
      </div>

      {/* Segment Status */}
      <FormField
        control={form.control}
        name={`${namePrefix}.segment`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>État du segment</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex gap-4"
              >
                {SEGMENT_STATUS.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={status}
                      id={`${namePrefix}-post-${status}`}
                    />
                    <label
                      htmlFor={`${namePrefix}-post-${status}`}
                      className="text-sm"
                    >
                      {LABELS.SEGMENT_STATUS[status]}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Detailed fields - only shown when NOT NORMAL */}
      {!isNormal && (
        <div className="space-y-4 rounded-md border border-border p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {/* Vitré */}
            <FormField
              control={form.control}
              name={`${namePrefix}.vitre`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vitré <RequiredIndicator />
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
                      {VITRE_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {LABELS.VITRE[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {vitre === 'AUTRES' && (
              <FormField
                control={form.control}
                name={`${namePrefix}.vitre_autres`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Précisez <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
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

            {/* Papille */}
            <FormField
              control={form.control}
              name={`${namePrefix}.papille`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Papille <RequiredIndicator />
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
                      {PAPILLE_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {LABELS.PAPILLE[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {papille === 'AUTRES' && (
              <FormField
                control={form.control}
                name={`${namePrefix}.papille_autres`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Précisez <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
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

            {/* Macula */}
            <FormField
              control={form.control}
              name={`${namePrefix}.macula`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Macula <RequiredIndicator />
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
                      {MACULA_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {LABELS.MACULA[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rétinien périphérique */}
            <FormField
              control={form.control}
              name={`${namePrefix}.retinien_peripherique`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Rétinien périphérique <RequiredIndicator />
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
                          {LABELS.RETINIEN[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {retinien === 'AUTRE' && (
              <FormField
                control={form.control}
                name={`${namePrefix}.retinien_peripherique_autre`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Précisez <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
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

            {/* Vaisseaux */}
            <FormField
              control={form.control}
              name={`${namePrefix}.vaissaux`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vaisseaux <RequiredIndicator />
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
                      {VAISSEAUX_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {LABELS.VAISSEAUX[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* C/D Ratio */}
          <FormField
            control={form.control}
            name={`${namePrefix}.cd`}
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Rapport C/D</FormLabel>
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
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observation */}
          <FormField
            control={form.control}
            name={`${namePrefix}.observation`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observation</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notes additionnelles..."
                    className="resize-none"
                    rows={3}
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
      )}
    </section>
  );
}
