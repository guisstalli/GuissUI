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
} from '@/components/ui/form';
import {
  AXE_VISUEL_VALUES,
  CORNEE_VALUES,
  CRISTALLIN_VALUES,
  IRIS_VALUES,
  POSITION_CRISTALLIN_VALUES,
  PROFONDEUR_VALUES,
  PUPILLE_VALUES,
  QUANTITE_ANOMALIE_VALUES,
  RPM_VALUES,
  SEGMENT_STATUS,
  TRANSPARENCE_VALUES,
  TYPE_ANOMALIE_VALUES,
} from '@/features/exams/types';

interface BiomicroscopyAnteriorFormProps {
  namePrefix: string; // Required: 'od.bp_sg_anterieur' or 'og.bp_sg_anterieur'
  eyeLabel: string;
}

const LABELS = {
  SEGMENT_STATUS: {
    NORMAL: 'Normal',
    PRESENCE_LESION: 'Présence de lésion',
    REMANIEMENT_TOTAL: 'Remaniement total',
  } as Record<string, string>,
  CORNEE: {
    NORMAL: 'Normale',
    OPACITE_AXE: 'Opacité axe',
    OPACITE_PERIPHERIE: 'Opacité périphérie',
    OPACITE_TOTALE: 'Opacité totale',
    AUTRE: 'Autre',
  } as Record<string, string>,
  PROFONDEUR: {
    NORMALE: 'Normale',
    REDUITE: 'Réduite',
    AUGMENTEE: 'Augmentée',
    ASYMETRIQUE: 'Asymétrique',
  } as Record<string, string>,
  TRANSPARENCE: { NORMAL: 'Normale', ANORMALE: 'Anormale' } as Record<
    string,
    string
  >,
  TYPE_ANOMALIE: {
    PIGMENTS: 'Pigments',
    HYPHEMA: 'Hyphéma',
    HYPOPION: 'Hypopion',
    AUTRE: 'Autre',
  } as Record<string, string>,
  QUANTITE_ANOMALIE: {
    MINIME: 'Minime',
    ATTEIGNANT_AIR_PUPILLAIRE: 'Atteignant aire pupillaire',
    RECOUVRANT_PUPILLE: 'Recouvrant pupille',
  } as Record<string, string>,
  PUPILLE: {
    NORMAL: 'Normale',
    MYOSIS: 'Myosis',
    MYDRIASE: 'Mydriase',
  } as Record<string, string>,
  AXE_VISUEL: {
    DEGAGE: 'Dégagé',
    OBSTRUE: 'Obstrué',
    LEUCOCORIE: 'Leucocorie',
  } as Record<string, string>,
  RPM: {
    NORMAL: 'Normal',
    LENT: 'Lent',
    ABOLI: 'Aboli',
  } as Record<string, string>,
  IRIS: {
    NORMAL: 'Normale',
    IRIDODONESIS: 'Iridodonésis',
    RUBEOSE: 'Rubéose',
    SYNECHIES: 'Synéchies',
    AUTRES: 'Autres',
  } as Record<string, string>,
  CRISTALLIN: {
    NORMAL: 'Normal',
    OPAQUE: 'Opaque',
    COLOBOME: 'Colobome',
    APHAKIE: 'Aphakie',
    PSEUDOPHAKIE: 'Pseudophakie',
  } as Record<string, string>,
  POSITION_CRISTALLIN: {
    NORMALE: 'Normale',
    ECTOPIE: 'Ectopie',
    LUXATION_SUBLUXATION_ANTERIEURE: 'Luxation/Subluxation antérieure',
    LUXATION_SUBLUXATION_POSTERIEURE: 'Luxation/Subluxation postérieure',
  } as Record<string, string>,
};

/**
 * Biomicroscopy Anterior Segment Form Component
 * Adult exam ONLY
 *
 * TOP LEVEL: Segment status: Normal / Presence Lesion
 * IF Normal: All detailed fields hidden and cleared
 * IF Presence Lesion: Detailed fields enabled and REQUIRED
 * "Autre" selections require text input
 */
export function BiomicroscopyAnteriorForm({
  namePrefix,
  eyeLabel,
}: BiomicroscopyAnteriorFormProps) {
  const form = useFormContext();

  const segment = useWatch({
    control: form.control,
    name: `${namePrefix}.segment`,
  });
  const transparence = useWatch({
    control: form.control,
    name: `${namePrefix}.transparence`,
  });
  const cornee = useWatch({
    control: form.control,
    name: `${namePrefix}.cornee`,
  });
  const iris = useWatch({ control: form.control, name: `${namePrefix}.iris` });
  const typeAnomalie = useWatch({
    control: form.control,
    name: `${namePrefix}.type_anomalie_value`,
  });

  const isNormal = segment === 'NORMAL';
  const isPresenceLesion = segment === 'PRESENCE_LESION';

  // Auto-clear all fields when segment is NORMAL
  useEffect(() => {
    if (isNormal) {
      form.setValue(`${namePrefix}.cornee`, null);
      form.setValue(`${namePrefix}.cornee_autre`, null);
      form.setValue(`${namePrefix}.profondeur`, null);
      form.setValue(`${namePrefix}.transparence`, null);
      form.setValue(`${namePrefix}.type_anomalie_value`, null);
      form.setValue(`${namePrefix}.type_anomalie_autre`, null);
      form.setValue(`${namePrefix}.quantite_anomalie`, null);
      form.setValue(`${namePrefix}.pupille`, null);
      form.setValue(`${namePrefix}.axe_visuel`, null);
      form.setValue(`${namePrefix}.rpm`, null);
      form.setValue(`${namePrefix}.iris`, null);
      form.setValue(`${namePrefix}.iris_autres`, null);
      form.setValue(`${namePrefix}.cristallin`, null);
      form.setValue(`${namePrefix}.position_cristallin`, null);
    }
  }, [isNormal, form, namePrefix]);

  // Auto-clear transparence-dependent fields
  useEffect(() => {
    if (transparence !== 'ANORMALE') {
      form.setValue(`${namePrefix}.type_anomalie_value`, null);
      form.setValue(`${namePrefix}.type_anomalie_autre`, null);
      form.setValue(`${namePrefix}.quantite_anomalie`, null);
    }
  }, [transparence, form, namePrefix]);

  // Auto-clear "autre" fields
  useEffect(() => {
    if (cornee !== 'AUTRE') {
      form.setValue(`${namePrefix}.cornee_autre`, null);
    }
  }, [cornee, form, namePrefix]);

  useEffect(() => {
    if (iris !== 'AUTRES') {
      form.setValue(`${namePrefix}.iris_autres`, null);
    }
  }, [iris, form, namePrefix]);

  useEffect(() => {
    if (typeAnomalie !== 'AUTRE') {
      form.setValue(`${namePrefix}.type_anomalie_autre`, null);
    }
  }, [typeAnomalie, form, namePrefix]);

  // Helper pour afficher l'indicateur obligatoire
  const RequiredIndicator = () =>
    isPresenceLesion ? <span className="text-destructive">*</span> : null;

  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h4 className="text-sm font-semibold text-foreground">
          Segment Antérieur - {eyeLabel}
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
                      id={`${namePrefix}-${status}`}
                    />
                    <label
                      htmlFor={`${namePrefix}-${status}`}
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
            {/* Cornée */}
            <FormField
              control={form.control}
              name={`${namePrefix}.cornee`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cornée <RequiredIndicator />
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
                      {CORNEE_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {LABELS.CORNEE[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {cornee === 'AUTRE' && (
              <FormField
                control={form.control}
                name={`${namePrefix}.cornee_autre`}
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

            {/* Profondeur */}
            <FormField
              control={form.control}
              name={`${namePrefix}.profondeur`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Profondeur CA <RequiredIndicator />
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
                          {LABELS.PROFONDEUR[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transparence */}
            <FormField
              control={form.control}
              name={`${namePrefix}.transparence`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Transparence <RequiredIndicator />
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
                          {LABELS.TRANSPARENCE[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Transparence anomalie fields */}
          {transparence === 'ANORMALE' && (
            <div className="grid grid-cols-2 gap-4 border-l-2 border-warning pl-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name={`${namePrefix}.type_anomalie_value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d&apos;anomalie</FormLabel>
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
                            {LABELS.TYPE_ANOMALIE[v]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {typeAnomalie === 'AUTRE' && (
                <FormField
                  control={form.control}
                  name={`${namePrefix}.type_anomalie_autre`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Précisez <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
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
                name={`${namePrefix}.quantite_anomalie`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
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
                            {LABELS.QUANTITE_ANOMALIE[v]}
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

          {/* Pupille, Axe visuel, RPM */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name={`${namePrefix}.pupille`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pupille <RequiredIndicator />
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
                      {PUPILLE_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {LABELS.PUPILLE[v]}
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
              name={`${namePrefix}.axe_visuel`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Axe visuel <RequiredIndicator />
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
                          {LABELS.AXE_VISUEL[v]}
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
              name={`${namePrefix}.rpm`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    RPM <RequiredIndicator />
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
                      {RPM_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {LABELS.RPM[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Iris */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name={`${namePrefix}.iris`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Iris <RequiredIndicator />
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
                      {IRIS_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {LABELS.IRIS[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {iris === 'AUTRES' && (
              <FormField
                control={form.control}
                name={`${namePrefix}.iris_autres`}
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
          </div>

          {/* Cristallin */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${namePrefix}.cristallin`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cristallin <RequiredIndicator />
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
                          {LABELS.CRISTALLIN[v]}
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
              name={`${namePrefix}.position_cristallin`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Position cristallin <RequiredIndicator />
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
                          {LABELS.POSITION_CRISTALLIN[v]}
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
    </section>
  );
}
