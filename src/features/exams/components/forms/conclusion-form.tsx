'use client';

import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui/form';
import { ICDSelector } from '@/components/ui/icd-selector';
import { VISION_APTITUDE } from '@/features/exams/types';

interface ConclusionFormProps {
  namePrefix?: string;
}

const VISION_LABELS: Record<(typeof VISION_APTITUDE)[number], string> = {
  compatible: 'Compatible',
  incompatible: 'Incompatible',
  a_risque: 'À risque',
};

/**
 * Conclusion Form Component
 * Adult exam ONLY
 *
 * FIELDS:
 * - Vision status
 * - CAT
 * - Treatment
 * - Observation
 * - ICD-11 diagnostics (with search)
 *
 * DESIGN: Final report style, Readable summary
 */
export function ConclusionForm({ namePrefix = '' }: ConclusionFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';

  //const rv = useWatch({ control: form.control, name: `${prefix}rv` });
  //const diagnostics =
  //  useWatch({ control: form.control, name: `${prefix}diagnostic_cim_11` }) ||
  // [];

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">Conclusion</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Synthèse et recommandations
        </p>
      </div>

      <div className="bg-muted/30 space-y-6 rounded-md border border-border p-6">
        {/* Vision Status */}
        <FormField
          control={form.control}
          name={`${prefix}vision`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aptitude visuelle</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Sélectionner le statut..." />
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

        {/* CAT */}
        <FormField
          control={form.control}
          name={`${prefix}cat`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CAT (Conduite à tenir)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conduite à tenir..."
                  className="resize-none"
                  rows={2}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Treatment */}
        <FormField
          control={form.control}
          name={`${prefix}traitement`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Traitement</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Traitement prescrit..."
                  className="resize-none"
                  rows={2}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Observation */}
        <FormField
          control={form.control}
          name={`${prefix}observation`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes et observations..."
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

        {/* ICD-11 Diagnostics with search */}
        <FormField
          control={form.control}
          name={`${prefix}diagnostic_cim_11`}
          render={({ field }) => (
            <FormItem>
              <ICDSelector
                label="Diagnostics CIM-11"
                description="Recherchez et sélectionnez les diagnostics ophtalmologiques"
                value={field.value || []}
                onChange={field.onChange}
                maxItems={10}
                placeholder="Rechercher une pathologie (ICD-11)..."
              />
              <FormMessage />
            </FormItem>
          )}
        />
        {/*
        <div className="space-y-4 border-t border-border pt-4">
          <FormField
            control={form.control}
            name={`${prefix}rv`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Prochain rendez-vous</FormLabel>
                  <FormDescription>Programmer un suivi</FormDescription>
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

          {rv && (
            <FormField
              control={form.control}
              name={`${prefix}date_prochain_rendez_vous`}
              render={({ field }) => (
                <FormItem>
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
      </div>
    </section>
  );
}
