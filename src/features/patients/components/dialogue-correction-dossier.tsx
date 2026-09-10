'use client';

import { CalendarClock, UserMinus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/form/input';

import {
  useCorrigerDateNaissance,
  useRetirerStatutConducteur,
} from '../api/corriger-dossier';

type BoutonCorrigerNaissanceProps = {
  patientId: number;
  dateActuelle: string;
};

/**
 * Répare une date de naissance fausse.
 *
 * L'import du 26/06/2026 a repris de l'ancienne plateforme six conducteurs
 * dont la date de naissance en fait des enfants de 0 à 7 ans — avec permis,
 * années d'expérience et examens ADULTES. Aucun écran ne permettait de les
 * corriger : le champ n'était modifiable nulle part, et la migration avait
 * forcé le drapeau « adulte » pour que les examens passent.
 *
 * Le motif n'est pas décoratif : le journal d'audit enregistre déjà QUOI a
 * changé, jamais POURQUOI. Sans lui, une correction est indiscernable d'une
 * faute de frappe.
 */
export function BoutonCorrigerNaissance({
  patientId,
  dateActuelle,
}: BoutonCorrigerNaissanceProps) {
  const [ouvert, setOuvert] = useState(false);
  const [date, setDate] = useState(dateActuelle);
  const [motif, setMotif] = useState('');
  const corriger = useCorrigerDateNaissance({
    onSuccess: () => setOuvert(false),
  });

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock className="mr-1.5 size-3.5" />
          Corriger la date de naissance
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Corriger la date de naissance</DialogTitle>
          <DialogDescription>
            Le statut adulte ou enfant est recalculé à partir de cette date, et
            décide du formulaire d’examen utilisé.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label
            htmlFor="correction-naissance"
            className="block text-sm font-medium"
          >
            Nouvelle date
            <Input
              id="correction-naissance"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </label>
          <label
            htmlFor="correction-motif"
            className="block text-sm font-medium"
          >
            Motif
            <Input
              id="correction-motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="ex. date lue sur le permis de conduire"
              className="mt-1"
            />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Conservé avec la correction : sans motif, une réparation ne se
              distingue pas d’une faute de frappe.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOuvert(false)}>
            Annuler
          </Button>
          <Button
            disabled={!date || date === dateActuelle || corriger.isPending}
            onClick={() =>
              corriger.mutate({
                patientId,
                dateDeNaissance: date,
                motif,
              })
            }
          >
            Corriger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Retire le statut conducteur en conservant le patient et ses examens.
 *
 * Le pendant manquant de la conversion patient → conducteur. Sans lui, une
 * fiche conducteur créée par erreur ne pouvait que rester en place ou être
 * supprimée avec son patient — donc avec ses examens.
 */
export function BoutonRetirerStatutConducteur({
  patientId,
}: {
  patientId: number;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState('');
  const retirer = useRetirerStatutConducteur({
    onSuccess: () => setOuvert(false),
  });

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserMinus className="mr-1.5 size-3.5" />
          Retirer le statut conducteur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retirer le statut conducteur</DialogTitle>
          <DialogDescription>
            Le patient et ses examens sont conservés. Le dossier conducteur est
            archivé, pas effacé : il peut être restauré sans ressaisir le
            permis.
          </DialogDescription>
        </DialogHeader>

        <label htmlFor="retrait-motif" className="block text-sm font-medium">
          Motif
          <Input
            id="retrait-motif"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="ex. fiche conducteur créée par erreur"
            className="mt-1"
          />
        </label>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOuvert(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            disabled={retirer.isPending}
            onClick={() => retirer.mutate({ patientId, motif })}
          >
            Retirer le statut
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
