'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, FileText, Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui/form';
import { useAntecedent, useUpdateAntecedent } from '@/features/patients/api';
import { FAMILIAL_LABELS } from '@/features/patients/types/schemas';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface ICDSearchResult {
  id: string;
  code: string;
  title: string;
}

interface ICDApiResponse {
  destinationEntities?: Array<{
    id: string;
    title: string;
    theCode?: string;
  }>;
}

// =============================================================================
// ICD-11 API SERVICE
// =============================================================================

const ICD_API_URL = 'https://icd11restapi-developer-test.azurewebsites.net';

/**
 * Recherche dans l'API ICD-11 de l'OMS
 */
async function searchICD11(query: string): Promise<ICDSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${ICD_API_URL}/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(query)}&useFlexisearch=true&flatResults=true&highlightingEnabled=false`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'fr',
          'API-Version': 'v2',
        },
      },
    );

    if (!response.ok) {
      console.error(`ICD-11 API error: ${response.status}`);
      return [];
    }

    const data: ICDApiResponse = await response.json();

    return (data.destinationEntities || []).map((entity) => ({
      id: entity.id,
      code: entity.theCode || entity.id?.split('/').pop() || '',
      title: (entity.title || '').replace(/<[^>]*>/g, ''),
    }));
  } catch (error) {
    console.error('ICD-11 search error:', error);
    return [];
  }
}

// =============================================================================
// SCHEMA
// =============================================================================

const FamilialEnum = z.enum(['CECITE', 'GPAO', 'OTHER']);

const medicalHistorySchema = z
  .object({
    antecedents_medico_chirurgicaux: z.array(z.string().max(255)),
    pathologie_ophtalmologique: z.array(z.string().max(255)),
    familial: z.array(FamilialEnum),
    autre_familial_detail: z.string().max(255).nullable().optional(),
    uses_screen: z.boolean().nullable(),
    screen_time_hours_per_day: z
      .number()
      .int()
      .min(0)
      .max(24)
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.familial.includes('OTHER')) {
        return (
          data.autre_familial_detail &&
          data.autre_familial_detail.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Veuillez préciser l'antécédent familial",
      path: ['autre_familial_detail'],
    },
  );

type MedicalHistoryFormValues = z.infer<typeof medicalHistorySchema>;

// =============================================================================
// ICD SELECTOR COMPONENT (Custom Implementation)
// =============================================================================

interface ICDSelectorProps {
  label: string;
  description?: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

function ICDSelector({
  label,
  description,
  value,
  onChange,
  error,
}: ICDSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ICDSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await searchICD11(searchQuery);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setIsLoading(false);
    }, 300);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSelect = (result: ICDSearchResult) => {
    const diseaseString = `${result.code} - ${result.title}`;

    if (!value.includes(diseaseString)) {
      onChange([...value, diseaseString]);
    }

    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div>
        <FormLabel className="text-sm font-medium">{label}</FormLabel>
        {description && (
          <FormDescription className="text-sm text-muted-foreground">
            {description}
          </FormDescription>
        )}
      </div>

      {/* Selected items as tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="gap-1 py-1.5 pl-3 pr-1 text-xs"
            >
              <span className="max-w-[300px] truncate">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="hover:bg-muted-foreground/20 ml-1 rounded-full p-0.5 transition-colors"
                aria-label={`Supprimer ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Rechercher une pathologie (ICD-11)..."
          className="px-9"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
            <ul className="py-1">
              {results.map((result) => {
                const isSelected = value.includes(
                  `${result.code} - ${result.title}`,
                );
                return (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(result)}
                      disabled={isSelected}
                      className={cn(
                        'flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition-colors',
                        'hover:bg-muted focus:bg-muted focus:outline-none',
                        isSelected && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <span className="bg-primary/10 mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-medium text-primary">
                        {result.code}
                      </span>
                      <span className="flex-1 text-foreground">
                        {result.title}
                      </span>
                      {isSelected && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* No results message */}
        {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg">
            Aucun résultat trouvé pour &quot;{query}&quot;
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface MedicalHistoryFormProps {
  patientId: number;
}

export function MedicalHistoryForm({ patientId }: MedicalHistoryFormProps) {
  const { data: antecedent, isLoading } = useAntecedent({
    patientId,
    enabled: !!patientId,
  });

  const updateAntecedentMutation = useUpdateAntecedent();

  // Détermine si c'est une création (pas d'antécédents existants)
  const isNewRecord = !antecedent;

  const form = useForm<MedicalHistoryFormValues>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      antecedents_medico_chirurgicaux: [],
      pathologie_ophtalmologique: [],
      familial: [],
      autre_familial_detail: null,
      uses_screen: null,
      screen_time_hours_per_day: null,
    },
  });

  // Sync form with API data (only if antecedent exists)
  useEffect(() => {
    if (antecedent) {
      form.reset({
        antecedents_medico_chirurgicaux:
          antecedent.antecedents_medico_chirurgicaux || [],
        pathologie_ophtalmologique: antecedent.pathologie_ophtalmologique || [],
        familial: antecedent.familial || [],
        autre_familial_detail: antecedent.autre_familial_detail || null,
        uses_screen: antecedent.uses_screen ?? null,
        screen_time_hours_per_day: antecedent.screen_time_hours_per_day ?? null,
      });
    }
  }, [antecedent, form]);

  const watchFamilial = form.watch('familial');
  const watchUsesScreen = form.watch('uses_screen');
  const watchScreenTime = form.watch('screen_time_hours_per_day');

  const showOtherFamilialDetail = watchFamilial?.includes('OTHER');

  const onSubmit = (data: MedicalHistoryFormValues) => {
    // Clean up data before submission
    const cleanedData = {
      ...data,
      autre_familial_detail: showOtherFamilialDetail
        ? data.autre_familial_detail
        : null,
      screen_time_hours_per_day: data.uses_screen
        ? data.screen_time_hours_per_day
        : null,
    };

    updateAntecedentMutation.mutate({
      patientId,
      data: {
        patient: patientId,
        ...cleanedData,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Message informatif si création */}
        {isNewRecord && (
          <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950">
            <FileText className="mt-0.5 size-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <div>
              <p className="font-medium text-sky-800 dark:text-sky-200">
                Aucun antécédent enregistré
              </p>
              <p className="mt-1 text-sm text-sky-700 dark:text-sky-300">
                Ce patient n&apos;a pas encore d&apos;antécédents médicaux
                enregistrés. Remplissez ce formulaire pour créer son dossier
                médical.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Antécédents médico-chirurgicaux */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-foreground">
              Antécédents médico-chirurgicaux
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sélectionnez les pathologies du patient
            </p>
          </div>
          <FormField
            control={form.control}
            name="antecedents_medico_chirurgicaux"
            render={({ field, fieldState }) => (
              <FormItem>
                <ICDSelector
                  label="Pathologies générales"
                  description="Recherchez et sélectionnez dans la nomenclature ICD-11"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              </FormItem>
            )}
          />
        </section>

        {/* Section 2: Pathologies ophtalmologiques */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-foreground">
              Pathologies ophtalmologiques
            </h3>
          </div>
          <FormField
            control={form.control}
            name="pathologie_ophtalmologique"
            render={({ field, fieldState }) => (
              <FormItem>
                <ICDSelector
                  label=""
                  description="Recherchez et sélectionnez dans la nomenclature ICD-11"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              </FormItem>
            )}
          />
        </section>

        {/* Section 3: Antécédents familiaux */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-foreground">
              Antécédents familiaux
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Indiquez les antécédents familiaux ophtalmologiques
            </p>
          </div>
          <FormField
            control={form.control}
            name="familial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d&apos;antécédent</FormLabel>
                <div className="flex flex-wrap gap-3">
                  {(
                    Object.entries(FAMILIAL_LABELS) as [
                      keyof typeof FAMILIAL_LABELS,
                      string,
                    ][]
                  ).map(([key, labelText]) => (
                    <label
                      key={key}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 transition-colors',
                        field.value?.includes(key)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted/50',
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={field.value?.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...(field.value || []), key]);
                          } else {
                            field.onChange(
                              field.value?.filter((v) => v !== key) || [],
                            );
                          }
                        }}
                      />
                      <span className="text-sm font-medium">{labelText}</span>
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional field for OTHER - required when OTHER is selected */}
          {showOtherFamilialDetail && (
            <FormField
              control={form.control}
              name="autre_familial_detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Précisez l&apos;antécédent familial{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Précisez l'antécédent familial"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </section>

        {/* Section 4: Habitudes visuelles */}
        <section className="space-y-4 rounded-lg border border-border p-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-foreground">
              Habitudes visuelles
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Informations sur l&apos;utilisation d&apos;écrans
            </p>
          </div>

          <FormField
            control={form.control}
            name="uses_screen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Utilisation d&apos;écrans</FormLabel>
                <div className="flex gap-4">
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-6 py-2.5 transition-colors',
                      field.value === true
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name="uses_screen"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span className="text-sm font-medium">Oui</span>
                  </label>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-6 py-2.5 transition-colors',
                      field.value === false
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name="uses_screen"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    <span className="text-sm font-medium">Non</span>
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional field for screen time - only when uses_screen is true */}
          {watchUsesScreen === true && (
            <FormField
              control={form.control}
              name="screen_time_hours_per_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temps d&apos;écran par jour (heures)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      placeholder="Ex: 8"
                      className="w-32"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                  {/* Warning for unrealistic values (> 12h) */}
                  {watchScreenTime !== null &&
                    watchScreenTime !== undefined &&
                    watchScreenTime > 12 && (
                      <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>
                          Valeur élevée ({watchScreenTime}h/jour) - Vérifiez
                          cette information
                        </span>
                      </div>
                    )}
                  <FormDescription>
                    Incluez ordinateur, smartphone, tablette, télévision
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </section>

        {/* Submit button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={updateAntecedentMutation.isPending}
          >
            Réinitialiser
          </Button>
          <Button type="submit" disabled={updateAntecedentMutation.isPending}>
            {updateAntecedentMutation.isPending
              ? 'Enregistrement...'
              : isNewRecord
                ? 'Créer les antécédents'
                : 'Mettre à jour les antécédents'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
