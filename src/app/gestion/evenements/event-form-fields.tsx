'use client';

import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
import { Switch } from '@/components/ui/form/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EventCreateInput } from '@/features/events/types/schemas';
import { useSites } from '@/features/sites/api/get-sites';

interface EventFormFieldsProps {
  form: UseFormReturn<EventCreateInput>;
}

/**
 * Les champs d'un événement, partagés par la création et la modification.
 *
 * Ils vivaient dans la page de création : ajouter la modification aurait
 * obligé à les recopier, et deux copies d'un même formulaire finissent par
 * diverger — une règle ajoutée d'un côté manque de l'autre.
 *
 * Au niveau de l'application et non d'une feature : il compose `events` et
 * `sites`, et une feature n'en importe pas une autre.
 */
export function EventFormFields({ form }: EventFormFieldsProps) {
  const { data: sites } = useSites({ params: { limit: 100 } });
  const sitesActifs = (sites?.results ?? []).filter((s) => s.is_active);

  return (
    <>
      <FormField
        control={form.control}
        name="titre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titre</FormLabel>
            <FormControl>
              <Input placeholder="Dépistage Dakar 2026" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FormField
          control={form.control}
          name="date_event"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de début</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date_fin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de fin</FormLabel>
              <FormControl>
                {/* Laisser vide = événement d'une seule journée. C'est le
                    cas courant : on ne l'impose pas. */}
                <Input type="date" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="heure_debut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Début</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="heure_fin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fin</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Le site de l'événement est posé sur chaque patient qui s'y
          inscrit, dès la création de sa fiche. Sans lui, les fiches
          restaient sans lieu. */}
      <FormField
        control={form.control}
        name="site_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Site</FormLabel>
            <Select
              value={field.value ? String(field.value) : ''}
              onValueChange={(valeur) => {
                const id = Number(valeur);
                field.onChange(id);
                // Le lieu affiché reprend le nom du site s'il est vide :
                // l'opérateur n'a pas à le saisir deux fois.
                const site = sitesActifs.find((s) => s.id === id);
                if (site && !form.getValues('lieu')) {
                  form.setValue('lieu', site.libelle, {
                    shouldValidate: true,
                  });
                }
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le site de dépistage" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sitesActifs.map((site) => (
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
      <FormField
        control={form.control}
        name="lieu"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lieu</FormLabel>
            <FormControl>
              <Input
                placeholder="Centre de Santé Grand-Yoff, Dakar"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="type_examen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type d&apos;examen</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="adulte">Adultes</SelectItem>
                  <SelectItem value="enfant">Enfants</SelectItem>
                  <SelectItem value="les_deux">Adultes & Enfants</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacite_max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacité max</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="100"
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
      </div>
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (optionnel)</FormLabel>
            <FormControl>
              <Input placeholder="Informations supplémentaires..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="pour_conducteurs"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <FormLabel className="text-sm font-medium">
                Événement pour conducteurs
              </FormLabel>
              <p className="text-xs text-muted-foreground">
                Collecte des données de permis lors de l&apos;inscription
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
