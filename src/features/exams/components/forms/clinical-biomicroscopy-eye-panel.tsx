'use client';

import { type UseFormReturn } from 'react-hook-form';

import {
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
import { AXE_VISUEL_VALUES, type ClinicalExamFormValues, CORNEE_VALUES, CRISTALLIN_VALUES, IRIS_VALUES, MACULA_VALUES, PAPILLE_VALUES, POSITION_CRISTALLIN_VALUES, PROFONDEUR_VALUES, PUPILLE_VALUES, QUANTITE_ANOMALIE_VALUES, RETINIEN_VALUES, RPM_VALUES, SEGMENT_STATUS, TRANSPARENCE_VALUES, TYPE_ANOMALIE_VALUES, VAISSEAUX_VALUES, VITRE_VALUES } from '@/features/exams/types/schemas';

interface BiomicroscopyEyePanelProps {
  form: UseFormReturn<ClinicalExamFormValues>;
  eye: 'od' | 'og';
  segmentAnterior: string | undefined;
  cornee: string | null | undefined;
  transparence: string | null | undefined;
  iris: string | null | undefined;
  segmentPosterior: string | undefined;
}

export function BiomicroscopyEyePanel({
  form,
  eye,
  segmentAnterior,
  cornee,
  transparence,
  iris,
  segmentPosterior,
}: BiomicroscopyEyePanelProps) {
  const eyeLabel = eye.toUpperCase();

  return (
    <>
      {/* Segment Antérieur */}
      <div className="space-y-4 rounded-md border border-border p-4">
        <h4 className="text-sm font-medium">Segment Antérieur {eyeLabel}</h4>
        <FormField
          control={form.control}
          name={`${eye}.bp_sg_anterieur.segment`}
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

        {segmentAnterior === 'PRESENCE_LESION' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name={`${eye}.bp_sg_anterieur.cornee`}
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
              {cornee === 'AUTRE' && (
                <FormField
                  control={form.control}
                  name={`${eye}.bp_sg_anterieur.cornee_autre`}
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
                name={`${eye}.bp_sg_anterieur.profondeur`}
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
                name={`${eye}.bp_sg_anterieur.transparence`}
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

            {transparence === 'ANORMALE' && (
              <div className="bg-muted/30 grid grid-cols-2 gap-4 rounded-md p-3 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name={`${eye}.bp_sg_anterieur.type_anomalie_value`}
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
                  name={`${eye}.bp_sg_anterieur.quantite_anomalie`}
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
                name={`${eye}.bp_sg_anterieur.pupille`}
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
                name={`${eye}.bp_sg_anterieur.axe_visuel`}
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
                name={`${eye}.bp_sg_anterieur.rpm`}
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
                name={`${eye}.bp_sg_anterieur.iris`}
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
              {iris === 'AUTRES' && (
                <FormField
                  control={form.control}
                  name={`${eye}.bp_sg_anterieur.iris_autres`}
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
                name={`${eye}.bp_sg_anterieur.cristallin`}
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
                name={`${eye}.bp_sg_anterieur.position_cristallin`}
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

      {/* Segment Postérieur */}
      <div className="space-y-4 rounded-md border border-border p-4">
        <h4 className="text-sm font-medium">Segment Postérieur {eyeLabel}</h4>
        <FormField
          control={form.control}
          name={`${eye}.bp_sg_posterieur.segment`}
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

        {segmentPosterior === 'PRESENCE_LESION' && (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name={`${eye}.bp_sg_posterieur.vitre`}
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
              name={`${eye}.bp_sg_posterieur.papille`}
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
              name={`${eye}.bp_sg_posterieur.macula`}
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
              name={`${eye}.bp_sg_posterieur.retine_peripherique`}
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
              name={`${eye}.bp_sg_posterieur.vaissaux_retinien`}
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
              name={`${eye}.bp_sg_posterieur.cd`}
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
    </>
  );
}
