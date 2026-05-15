'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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

interface ExamensAdditionelsSectionProps {
  namePrefix?: string;
}

const TYPE_LABELS: Record<string, string> = {
  text: 'Texte',
  number: 'Nombre',
  boolean: 'Oui / Non',
  select: 'Liste de choix',
};

export function ExamensAdditionelsSection({
  namePrefix = 'perimetry',
}: ExamensAdditionelsSectionProps) {
  const form = useFormContext();
  const fieldName = `${namePrefix}.examens_additionnels`;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName,
  });

  const addEntry = () => {
    append({ titre: '', type_valeur: 'text', value: '', options: [] });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Examens additionnels
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Examens libres complémentaires
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addEntry}>
          <Plus className="mr-1.5 size-3.5" />
          Ajouter
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs italic text-muted-foreground">
          Aucun examen additionnel.
        </p>
      )}

      {fields.map((field, index) => {
        const typeValeur = form.watch(`${fieldName}.${index}.type_valeur`);

        return (
          <div
            key={field.id}
            className="bg-muted/20 space-y-3 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Examen {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-7 p-0 text-destructive hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name={`${fieldName}.${index}.titre`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Titre <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tonométrie cornéenne" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`${fieldName}.${index}.type_valeur`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Type de valeur</FormLabel>
                    <Select
                      value={f.value}
                      onValueChange={(v) => {
                        f.onChange(v);
                        form.setValue(
                          `${fieldName}.${index}.value`,
                          v === 'boolean' ? false : '',
                        );
                        if (v !== 'select')
                          form.setValue(`${fieldName}.${index}.options`, []);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TYPE_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`${fieldName}.${index}.value`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-xs">Valeur</FormLabel>
                  <FormControl>
                    {typeValeur === 'boolean' ? (
                      <Select
                        value={String(f.value)}
                        onValueChange={(v) => f.onChange(v === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Oui</SelectItem>
                          <SelectItem value="false">Non</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : typeValeur === 'number' ? (
                      <Input
                        type="number"
                        placeholder="Valeur numérique"
                        value={f.value ?? ''}
                        onChange={(e) =>
                          f.onChange(
                            e.target.value ? Number(e.target.value) : '',
                          )
                        }
                      />
                    ) : (
                      <Input
                        placeholder="Valeur"
                        {...f}
                        value={f.value ?? ''}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {typeValeur === 'select' && (
              <FormField
                control={form.control}
                name={`${fieldName}.${index}.options`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Options{' '}
                      <span className="text-muted-foreground">
                        (séparées par des virgules)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Option 1, Option 2, Option 3"
                        value={(f.value ?? []).join(', ')}
                        onChange={(e) => {
                          const raw = e.target.value;
                          f.onChange(
                            raw
                              ? raw
                                  .split(',')
                                  .map((s: string) => s.trim())
                                  .filter(Boolean)
                              : [],
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );
      })}
    </section>
  );
}
