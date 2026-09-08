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
import { useNotifications } from '@/components/ui/notifications';
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
  const { addNotification } = useNotifications();
  const [siteId, setSiteId] = useState<number | null>(null);
  const [examenPrecedentId, setExamenPrecedentId] = useState<number | null>(
    null,
  );
  /**
   * Examen deja ouvert aujourd'hui pour ce patient, renvoye par le serveur
   * avec un 409.
   *
   * Le garde-fou refuse un second examen le meme jour — c'est son absence qui
   * a produit 114 examens pour 82 patients le 23/08/2026. Mais refuser ne
   * suffit pas : si l'ecran se contentait d'afficher « interdit », l'operateur
   * chercherait a contourner. On lui propose donc la bonne action : REPRENDRE
   * l'examen en cours.
   */
  const [examenExistant, setExamenExistant] = useState<{
    id: number;
    numero?: string;
  } | null>(null);

  const fermerEtReinitialiser = () => {
    onOpenChange(false);
    setSiteId(null);
    setExamenPrecedentId(null);
    setExamenExistant(null);
  };

  const succes = (exam: { id: number }) => {
    fermerEtReinitialiser();
    // La navigation est differee d'une frame APRES la fermeture : naviguer
    // pendant le demontage du dialogue Radix laisse `pointer-events: none` sur
    // le body, et la page d'arrivee devient inerte. Comportement repris tel
    // quel de la fiche patient, ou le correctif avait deja ete pose.
    requestAnimationFrame(() => onCreated?.(exam));
  };

  const surErreur = (erreur: unknown) => {
    const { status, data } = (erreur ?? {}) as {
      status?: number;
      data?: { examen_existant_id?: number; numero_examen?: string };
    };

    if (status === 409 && data?.examen_existant_id) {
      setExamenExistant({
        id: data.examen_existant_id,
        numero: data.numero_examen,
      });
      return;
    }

    // Fournir `onError` ECRASE celui de la mutation (`...restConfig` passe
    // apres), qui portait la notification d'echec. Sans ce rappel, une panne
    // reseau ou un 500 ne disaient plus rien a l'utilisateur : l'ecran restait
    // muet et le dialogue ouvert.
    addNotification({
      type: 'error',
      title: 'Erreur',
      message: "Impossible de créer l'examen.",
    });
  };

  const creerAdulte = useCreateAdultExam({
    mutationConfig: { onSuccess: succes, onError: surErreur },
  });
  const creerEnfant = useCreateChildExam({
    mutationConfig: { onSuccess: succes },
  });

  const enCours = creerAdulte.isPending || creerEnfant.isPending;

  const reprendre = () => {
    if (!examenExistant) return;
    const exam = { id: examenExistant.id };
    fermerEtReinitialiser();
    requestAnimationFrame(() => onCreated?.(exam));
  };

  const confirmer = () => {
    if (!siteId) return;
    setExamenExistant(null);

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

        {/* Le serveur a refuse un second examen : on propose la bonne action
            plutot qu'un message d'erreur. Un refus sans issue pousse a
            contourner — c'est ainsi qu'on obtient 12 examens pour un patient. */}
        {examenExistant && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">
              Un examen est déjà ouvert pour ce patient aujourd’hui
              {examenExistant.numero ? ` (${examenExistant.numero})` : ''}.
            </p>
            <p className="mt-1 text-muted-foreground">
              Reprenez-le plutôt que d’en créer un second : c’est la
              multiplication des examens qui disperse les mesures entre les
              dossiers.
            </p>
            <Button size="sm" className="mt-3" onClick={reprendre}>
              Reprendre l’examen en cours
            </Button>
          </div>
        )}

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
