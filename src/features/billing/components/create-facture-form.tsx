'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
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

import { usePrestations } from '../api/get-prestations';
import { FactureCreateSchema, type FactureCreate } from '../types/schemas';

interface SiteOption {
  id?: number;
  libelle: string;
}

interface CreateFactureFormProps {
  onSubmit: (data: FactureCreate) => void;
  isPending?: boolean;
  defaultValues?: Partial<FactureCreate>;
  sites?: SiteOption[];
}

const BASE_DEFAULT_VALUES: FactureCreate = {
  site_id: 0,
  patient_nom: '',
  patient_prenom: '',
  patient_phone: '',
  lignes: [
    { prestation_id: null, description: '', quantite: 1, prix_unitaire: '' },
  ],
  notes: '',
};

export function CreateFactureForm({
  onSubmit,
  isPending,
  defaultValues,
  sites = [],
}: CreateFactureFormProps) {
  const { data: prestations } = usePrestations();

  const form = useForm<FactureCreate>({
    resolver: zodResolver(FactureCreateSchema),
    defaultValues: { ...BASE_DEFAULT_VALUES, ...defaultValues },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lignes',
  });

  const handlePrestationChange = (index: number, prestationId: string) => {
    if (prestationId === '__none__') {
      form.setValue(`lignes.${index}.prestation_id`, null);
      return;
    }
    const id = Number(prestationId);
    const prestation = prestations?.find((p) => p.id === id);
    form.setValue(`lignes.${index}.prestation_id`, id);
    if (prestation) {
      form.setValue(`lignes.${index}.description`, prestation.libelle);
      form.setValue(`lignes.${index}.prix_unitaire`, prestation.prix);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Identité patient */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold">
            Identité du patient
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="patient_prenom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Prénom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="patient_nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de famille" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="patient_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+221 XX XXX XX XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="site_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Site <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={String(site.id)}>
                          {site.libelle}
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

        {/* Section Lignes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-semibold">Lignes de facturation</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  prestation_id: null,
                  description: '',
                  quantite: 1,
                  prix_unitaire: '',
                })
              }
            >
              <Plus className="mr-1.5 size-3.5" />
              Ajouter une ligne
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="bg-muted/20 relative rounded-lg border p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Prestation selector */}
                  <FormItem>
                    <FormLabel className="text-xs">
                      Prestation (optionnel)
                    </FormLabel>
                    <Select
                      value={
                        form.watch(`lignes.${index}.prestation_id`)
                          ? String(form.watch(`lignes.${index}.prestation_id`))
                          : '__none__'
                      }
                      onValueChange={(v) => handlePrestationChange(index, v)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Choisir une prestation…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Aucune —</SelectItem>
                        {(prestations ?? []).map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.libelle} — {p.prix_display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name={`lignes.${index}.description`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Description</FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 text-sm"
                            placeholder="Description…"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantité */}
                  <FormField
                    control={form.control}
                    name={`lignes.${index}.quantite`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Quantité</FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 text-sm"
                            type="number"
                            min="1"
                            placeholder="1"
                            {...f}
                            onChange={(e) => f.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Prix unitaire */}
                  <FormField
                    control={form.control}
                    name={`lignes.${index}.prix_unitaire`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Prix unitaire (FCFA)
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 text-sm"
                            placeholder="0"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="hover:bg-destructive/10 absolute right-2 top-2 rounded p-1 text-muted-foreground hover:text-destructive"
                    title="Supprimer cette ligne"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes ou observations…"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="hover:bg-primary/90 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? 'Création…' : 'Créer la facture'}
          </button>
        </div>
      </form>
    </Form>
  );
}
