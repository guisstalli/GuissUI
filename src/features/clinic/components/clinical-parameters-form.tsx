'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
import { useNotifications } from '@/components/ui/notifications';

import { useUpdateClinicSettings } from '../api/update-clinic-settings';
import {
  ClinicalParametersSchema,
  type ClinicSettings,
  type ClinicalParametersInput,
} from '../types/schemas';

type ClinicalParametersFormProps = {
  settings: ClinicSettings;
};

type Champ = {
  name: keyof ClinicalParametersInput;
  label: string;
  description: string;
  step: string;
};

// Seuils administrables (Kamal 13/10) : aucun n'est codé en dur dans les calculs.
const CHAMPS: Champ[] = [
  {
    name: 'logmar_zero_value',
    label: 'LogMAR d’une acuité de 0',
    description:
      'Valeur donnée à une acuité de 0 dans la moyenne LogMAR du tableau de bord (convention : 1,9).',
    step: '0.1',
  },
  {
    name: 'adult_min_age',
    label: 'Âge du formulaire adulte',
    description:
      'À partir de cet âge, à la date de l’examen, l’examen est un examen adulte.',
    step: '1',
  },
  {
    name: 'driver_min_age',
    label: 'Âge minimal du permis',
    description:
      'Un conducteur plus jeune est signalé comme anomalie de dossier.',
    step: '1',
  },
  {
    name: 'rupture_window_exams',
    label: 'Ruptures : taille de la fenêtre',
    description:
      'Nombre d’examens comparés pour détecter une rupture de saisie.',
    step: '1',
  },
  {
    name: 'rupture_threshold_points',
    label: 'Ruptures : écart signalé (points)',
    description: 'Écart, en points de pourcentage, qui signale une rupture.',
    step: '1',
  },
];

/** Paramètres cliniques administrables de la plateforme (lot 4). */
export function ClinicalParametersForm({
  settings,
}: ClinicalParametersFormProps) {
  const { addNotification } = useNotifications();
  const { mutate, isPending } = useUpdateClinicSettings({
    onSuccess: () =>
      addNotification({
        type: 'success',
        title: 'Paramètres enregistrés',
        message: 'Les paramètres cliniques ont été mis à jour.',
      }),
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder les paramètres cliniques.',
      }),
  });

  const form = useForm<ClinicalParametersInput>({
    resolver: zodResolver(ClinicalParametersSchema),
    defaultValues: {
      logmar_zero_value: settings.logmar_zero_value,
      adult_min_age: settings.adult_min_age,
      driver_min_age: settings.driver_min_age,
      rupture_window_exams: settings.rupture_window_exams,
      rupture_threshold_points: settings.rupture_threshold_points,
    },
  });

  const onSubmit = (values: ClinicalParametersInput) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CHAMPS.map((champ) => (
            <FormField
              key={champ.name}
              control={form.control}
              name={champ.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{champ.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={champ.step}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>{champ.description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}
