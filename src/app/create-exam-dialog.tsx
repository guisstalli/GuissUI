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

/**
 * Raisons courantes d'un second examen le même jour.
 *
 * Proposées plutôt que laissées au champ libre : le centre tient des dossiers
 * physiques, ces trois cas couvrent l'essentiel, et un vocabulaire commun rend
 * la relecture possible. Le champ reste libre pour le reste.
 */
const MOTIFS_SUGGERES = [
  'Reprise après dilatation',
  'Contrôle de fin de séance',
  'Nouvelle mesure',
];

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
  /**
   * Motif saisi quand l'opérateur déclare un second examen assumé.
   *
   * C'est la seconde issue du refus. Sans elle, un centre qui enregistre
   * légitimement deux examens dans la journée n'a aucun moyen de le faire —
   * et un garde-fou sans issue pousse à contourner.
   */
  const [motifReprise, setMotifReprise] = useState('');
  const [declareReprise, setDeclareReprise] = useState(false);

  const fermerEtReinitialiser = () => {
    onOpenChange(false);
    setSiteId(null);
    setExamenPrecedentId(null);
    setExamenExistant(null);
    setMotifReprise('');
    setDeclareReprise(false);
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
        // Envoyé seulement s'il est renseigné : un motif vide vaut « examen
        // ordinaire », et le serveur doit alors continuer de refuser.
        ...(motifReprise.trim() !== '' && {
          motif_reprise: motifReprise.trim(),
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
              Reprenez-le si c’est le même passage. S’il s’agit réellement d’un
              second examen, dites pourquoi : c’est ce qui le distinguera d’un
              doublon et l’exclura du nettoyage automatique.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={reprendre}>
                Reprendre l’examen en cours
              </Button>
              {!declareReprise && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeclareReprise(true)}
                >
                  C’est un second examen
                </Button>
              )}
            </div>

            {declareReprise && (
              <div className="mt-3 flex flex-col gap-2">
                <label
                  htmlFor="motif-reprise"
                  className="text-xs font-medium text-foreground"
                >
                  Motif du second examen
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MOTIFS_SUGGERES.map((motif) => (
                    <Button
                      key={motif}
                      type="button"
                      size="sm"
                      variant={motifReprise === motif ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setMotifReprise(motif)}
                    >
                      {motif}
                    </Button>
                  ))}
                </div>
                <input
                  id="motif-reprise"
                  value={motifReprise}
                  onChange={(e) => setMotifReprise(e.target.value)}
                  maxLength={200}
                  placeholder="ou saisir une autre raison"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button
                  size="sm"
                  className="self-start"
                  disabled={motifReprise.trim() === '' || enCours}
                  onClick={confirmer}
                >
                  Créer le second examen
                </Button>
              </div>
            )}
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
