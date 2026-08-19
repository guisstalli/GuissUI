'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateAdultExam } from '@/features/exams/api/adult/mutations';
import { useCreateChildExam } from '@/features/exams/api/child/mutations';
import { PreviousExamSelector } from '@/features/exams/components/previous-exam-selector';
import { SiteSelector } from '@/features/sites/components/site-selector';

type CreateExamDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  patientFullName: string;
  isAdult: boolean;
  /** Reçoit l'examen créé — typiquement pour naviguer vers sa page. */
  onCreated?: (exam: { id: number }) => void;
};

/**
 * Choix du site avant de créer un examen.
 *
 * Extrait de la fiche patient, où il existait déjà, pour servir aussi la fiche
 * conducteur : là-bas le bouton « Nouvel examen adulte » créait directement,
 * sans rien demander. L'examen naissait donc SANS SITE, et la colonne « Site »
 * du tableau juste en dessous affichait « — » à vie. Le contrat l'acceptait
 * pourtant : `site_id` est optionnel côté serveur, seule la saisie manquait.
 *
 * Place a la couche APPLICATION et non dans `features/exams` : il compose deux
 * features (exams pour la mutation, sites pour le selecteur), ce qu'un import
 * inter-features interdit (`import/no-restricted-paths`). Meme convention que
 * `_shell.tsx`.
 *
 * Le site est obligatoire ici — bouton désactivé tant qu'il n'est pas choisi.
 * Un examen de dépistage sans lieu n'est exploitable dans aucun agrégat par
 * site, et c'est précisément ce que l'analytique croise.
 */
export function CreateExamDialog({
  open,
  onOpenChange,
  patientId,
  patientFullName,
  isAdult,
  onCreated,
}: CreateExamDialogProps) {
  const [siteId, setSiteId] = useState<number | null>(null);
  const [examenPrecedentId, setExamenPrecedentId] = useState<number | null>(
    null,
  );

  const fermerEtReinitialiser = () => {
    onOpenChange(false);
    setSiteId(null);
    setExamenPrecedentId(null);
  };

  const succes = (exam: { id: number }) => {
    fermerEtReinitialiser();
    // La navigation est differee d'une frame APRES la fermeture : naviguer
    // pendant le demontage du dialogue Radix laisse `pointer-events: none` sur
    // le body, et la page d'arrivee devient inerte. Comportement repris tel
    // quel de la fiche patient, ou le correctif avait deja ete pose.
    requestAnimationFrame(() => onCreated?.(exam));
  };

  const creerAdulte = useCreateAdultExam({
    mutationConfig: { onSuccess: succes },
  });
  const creerEnfant = useCreateChildExam({
    mutationConfig: { onSuccess: succes },
  });

  const enCours = creerAdulte.isPending || creerEnfant.isPending;

  const confirmer = () => {
    if (!siteId) return;

    if (isAdult) {
      creerAdulte.mutate({
        patient_id: patientId,
        site_id: siteId,
        // Omis plutôt qu'envoyé à null : un examen indépendant n'a pas de
        // référence, il ne « référence pas rien ».
        ...(examenPrecedentId !== null && {
          examen_precedent_id: examenPrecedentId,
        }),
      });
    } else {
      creerEnfant.mutate({ patient_id: patientId, site_id: siteId });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(ouvert) => !ouvert && fermerEtReinitialiser()}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Créer un nouvel examen</DialogTitle>
          <DialogDescription>
            Veuillez sélectionner le site de dépistage avant de poursuivre vers
            l&apos;examen pour {patientFullName}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <span className="text-sm font-medium leading-none">
              Site de dépistage
            </span>
            <SiteSelector value={siteId} onChange={setSiteId} />
          </div>

          {/* Rattachement à un examen antérieur — proposé pour l'adulte, où le
              suivi (contrôle, post-opératoire) a un sens clinique. */}
          {isAdult && (
            <div className="grid gap-2">
              <span className="text-sm font-medium leading-none">
                Fait suite à un examen
                <span className="ml-1 font-normal text-muted-foreground">
                  (facultatif)
                </span>
              </span>
              <PreviousExamSelector
                patientId={patientId}
                value={examenPrecedentId}
                onChange={setExamenPrecedentId}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={fermerEtReinitialiser}>
            Annuler
          </Button>
          <Button onClick={confirmer} disabled={!siteId || enCours}>
            {enCours ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Création...
              </>
            ) : (
              'Créer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
