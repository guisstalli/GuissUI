'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { useDeleteAdultExam } from '@/features/exams/api/adult/mutations';
import { useDeleteChildExam } from '@/features/exams/api/child/mutations';
import { useUser } from '@/lib/auth';
import { hasPermission } from '@/lib/authorization';

type BoutonSupprimerExamenProps = {
  examenId: number;
  /** Libelle montre a l'utilisateur (numero d'examen). */
  numeroExamen: string;
  patientNom: string;
  estAdulte: boolean;
};

/**
 * Suppression d'un examen depuis une liste.
 *
 * DESTRUCTION DEFINITIVE, et c'est le point important : contrairement aux
 * patients et aux conducteurs, les examens n'ont AUCUNE corbeille cote serveur
 * (`ExamensAdult` n'a pas de suppression douce, le service appelle
 * `examen.delete()`). L'examen et ses donnees cliniques et techniques
 * disparaissent sans recours. Le dialogue le dit donc explicitement plutot
 * qu'un « Etes-vous sur ? » qui laisserait croire a un envoi en corbeille.
 *
 * Gate par la permission `exams:delete` : sans elle le bouton n'est pas rendu,
 * plutot que rendu puis refuse par le serveur.
 *
 * Place a la couche APPLICATION comme `create-exam-dialog` : il compose deux
 * features (adulte et enfant), ce qu'un import inter-features interdit.
 */
export function BoutonSupprimerExamen({
  examenId,
  numeroExamen,
  patientNom,
  estAdulte,
}: BoutonSupprimerExamenProps) {
  const { user } = useUser();
  const [ouvert, setOuvert] = useState(false);

  const supprimerAdulte = useDeleteAdultExam({
    mutationConfig: { onSuccess: () => setOuvert(false) },
  });
  const supprimerEnfant = useDeleteChildExam({
    mutationConfig: { onSuccess: () => setOuvert(false) },
  });

  const enCours = supprimerAdulte.isPending || supprimerEnfant.isPending;

  if (!hasPermission(user, 'exams:delete')) return null;

  const confirmer = () => {
    if (estAdulte) {
      supprimerAdulte.mutate(examenId);
    } else {
      supprimerEnfant.mutate(examenId);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setOuvert(true)}
        aria-label={`Supprimer l'examen ${numeroExamen}`}
      >
        <Trash2 className="size-4" />
      </Button>

      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Supprimer définitivement cet examen ?</DialogTitle>
            <DialogDescription>
              L&apos;examen {numeroExamen} de {patientNom} sera supprimé, avec
              toutes ses données cliniques et techniques.
            </DialogDescription>
          </DialogHeader>

          {/* Dit explicitement ce qu'aucune corbeille ne rattrapera : les
              examens n'en ont pas, contrairement aux patients et aux
              conducteurs. */}
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Cette suppression est irréversible : les examens ne passent pas par
            la corbeille et ne pourront pas être restaurés.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmer}
              disabled={enCours}
            >
              {enCours ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
