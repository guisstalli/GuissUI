'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';
import { paths } from '@/config/paths';

import { useDejaVus, useEnregistrerEnCampagne } from '../api/campagne';
import {
  nouvellePersonneSchema,
  type Campagne,
  type Enregistrement,
  type NouvellePersonne,
  type PersonneVue,
} from '../types/types';

interface FormulaireArriveeProps {
  campagne: Campagne;
  onEnregistre?: (resultat: Enregistrement) => void;
}

/**
 * Enregistrer une arrivée : un seul formulaire, quatre champs.
 *
 * Ni le lieu (imposé par la campagne), ni le type d'examen (déduit de l'âge)
 * ne sont demandés. Ce sont les deux champs qui se remplissaient mal : 189
 * examens sans lieu le 17/09/2026, et deux enfants examinés au formulaire
 * adulte dans le dump du 18/09.
 *
 * Pendant la frappe du nom, l'écran cherche les personnes déjà connues et
 * signale celles déjà passées AUJOURD'HUI. C'est le seul moment où l'on peut
 * empêcher un doublon plutôt que le constater le lendemain.
 */
export function FormulaireArrivee({
  campagne,
  onEnregistre,
}: FormulaireArriveeProps) {
  const [dejaVu, setDejaVu] = useState<{
    examenId: number;
    numero: string;
    typeExamen: 'adulte' | 'enfant';
  } | null>(null);

  const form = useForm<NouvellePersonne>({
    resolver: zodResolver(nouvellePersonneSchema),
    defaultValues: { last_name: '', name: '', date_de_naissance: '', sex: 'H' },
  });

  const nom = form.watch('last_name');
  const prenom = form.watch('name');
  const { data: connus } = useDejaVus({ nom, prenom });

  const enregistrer = useEnregistrerEnCampagne({
    onSuccess: (resultat) => {
      form.reset({ last_name: '', name: '', date_de_naissance: '', sex: 'H' });
      setDejaVu(null);
      onEnregistre?.(resultat);
    },
    onDejaVu: setDejaVu,
  });

  const campagneOuverte = campagne.siteId !== null || campagne.eventId !== null;

  const reprendre = (personne: PersonneVue) =>
    enregistrer.mutate({
      siteId: campagne.siteId,
      eventId: campagne.eventId,
      patientId: personne.id,
    });

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Enregistrer une arrivée</h3>
        <p className="text-sm text-muted-foreground">
          Le lieu et le type d’examen ne sont pas demandés : le premier vient de
          la campagne, le second de l’âge.
        </p>
      </div>

      <form
        className="space-y-3 px-4 py-3"
        onSubmit={form.handleSubmit((valeurs) =>
          enregistrer.mutate({
            siteId: campagne.siteId,
            eventId: campagne.eventId,
            patient: valeurs,
          }),
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            htmlFor="campagne-nom"
            className="flex flex-col gap-1 text-xs text-muted-foreground"
          >
            Nom
            <Input
              id="campagne-nom"
              autoComplete="off"
              {...form.register('last_name')}
            />
          </label>
          <label
            htmlFor="campagne-prenom"
            className="flex flex-col gap-1 text-xs text-muted-foreground"
          >
            Prénom
            <Input
              id="campagne-prenom"
              autoComplete="off"
              {...form.register('name')}
            />
          </label>
          <label
            htmlFor="campagne-naissance"
            className="flex flex-col gap-1 text-xs text-muted-foreground"
          >
            Date de naissance
            <Input
              id="campagne-naissance"
              type="date"
              {...form.register('date_de_naissance')}
            />
          </label>
          <label
            htmlFor="campagne-sexe"
            className="flex flex-col gap-1 text-xs text-muted-foreground"
          >
            Sexe
            <select
              id="campagne-sexe"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register('sex')}
            >
              <option value="H">Homme</option>
              <option value="F">Femme</option>
            </select>
          </label>
        </div>

        {Object.values(form.formState.errors)[0] && (
          <p className="text-sm text-destructive">
            {Object.values(form.formState.errors)[0]?.message}
          </p>
        )}

        <Button
          type="submit"
          size="sm"
          disabled={enregistrer.isPending || !campagneOuverte}
        >
          {enregistrer.isPending ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <UserPlus className="mr-1.5 size-3.5" />
          )}
          Enregistrer et ouvrir l’examen
        </Button>
        {!campagneOuverte && (
          <span className="ml-2 text-xs text-muted-foreground">
            Choisissez d’abord le lieu de la campagne.
          </span>
        )}
      </form>

      {/* Reprendre l'examen ouvert plutôt qu'en créer un second : c'est ce
          qu'a coûté le 23/08, où les mesures d'une même personne se sont
          réparties entre les doublons. */}
      {dejaVu && (
        <div className="border-t bg-amber-50 px-4 py-3 text-sm dark:bg-amber-950/30">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" />
            Cette personne a déjà un examen ouvert aujourd’hui
            {dejaVu.numero ? ` (${dejaVu.numero})` : ''}.
          </p>
          <p className="mt-1 text-muted-foreground">
            Reprenez-le : ouvrir un second examen disperserait ses mesures entre
            les deux.
          </p>
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link
              href={
                dejaVu.typeExamen === 'enfant'
                  ? paths.exams.child.detail.getHref(dejaVu.examenId)
                  : paths.exams.adult.detail.getHref(dejaVu.examenId)
              }
            >
              Ouvrir l’examen en cours
            </Link>
          </Button>
        </div>
      )}

      {connus && connus.length > 0 && (
        <div className="border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Personnes déjà connues portant ce nom — reprenez la fiche plutôt que
            d’en créer une seconde.
          </p>
          <ul className="mt-2 space-y-1">
            {connus.map((personne) => (
              <li
                key={personne.id}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span className="font-medium">{personne.nom_complet}</span>
                <span className="text-xs text-muted-foreground">
                  {personne.age ?? '—'} ans · {personne.site ?? 'aucun lieu'}
                </span>
                {personne.vu_aujourdhui ? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                    déjà vu aujourd’hui
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={enregistrer.isPending || !campagneOuverte}
                    onClick={() => reprendre(personne)}
                  >
                    Enregistrer son passage
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
