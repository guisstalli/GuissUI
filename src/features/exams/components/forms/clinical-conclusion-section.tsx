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
  Textarea,
} from '@/components/ui/form';
import {
  type ClinicalExamFormValues,
  VISION_APTITUDE,
} from '@/features/exams/types/schemas';

const VISION_LABELS: Record<(typeof VISION_APTITUDE)[number], string> = {
  compatible: 'Compatible',
  incompatible: 'Incompatible',
  a_risque: 'À risque',
};

interface ConclusionSectionProps {
  form: UseFormReturn<ClinicalExamFormValues>;
}

export function ConclusionSection({ form }: ConclusionSectionProps) {
  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">Conclusion</h3>
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
  );
}
