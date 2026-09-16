'use client';

import {
  CheckCircle,
  ExternalLink,
  MoreHorizontal,
  Play,
  RotateCcw,
  Trash2,
  Undo2,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog/confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown/dropdown';
import { useNotifications } from '@/components/ui/notifications';
import {
  useCancelEvent,
  useCloseEvent,
  useDeleteEvent,
  useReopenEvent,
  useRestoreEvent,
  useStartEvent,
} from '@/features/events/api/event-actions';
import type { EventStaff } from '@/features/events/types/schemas';
import {
  CAPABILITY,
  hasCapability,
  useMyCapabilities,
} from '@/lib/capabilities';

/**
 * Actions d'un événement.
 *
 * Les deux gestes du quotidien — pointer les inscrits et faire avancer le
 * statut — étaient enfouis dans le menu « … », donc invisibles : depuis la
 * liste, rien ne montrait qu'on pouvait faire un check-in. Ils passent en
 * boutons explicites ; le menu ne garde que le secondaire et le destructif.
 *
 * Sorti de `page.tsx` pour être testable : un fichier de page Next.js ne peut
 * pas exporter autre chose que ce que le routeur attend.
 */
export function EventActions({ event }: { event: EventStaff }) {
  const { addNotification } = useNotifications();
  const { mutate: start, isPending: starting } = useStartEvent(event.id);
  const { mutate: close, isPending: closing } = useCloseEvent(event.id);
  // Annulation confirmée dans une fenêtre pilotée par état : ouverte depuis un
  // élément du menu, elle ne peut pas vivre DANS le menu, qui se referme.
  const [confirmerAnnulation, setConfirmerAnnulation] = useState(false);
  const { mutate: cancel, isPending: cancelling } = useCancelEvent(event.id, {
    onSuccess: () => setConfirmerAnnulation(false),
  });
  const { mutate: del } = useDeleteEvent(event.id);
  const { mutate: restore, isPending: restoring } = useRestoreEvent(event.id, {
    onSuccess: () =>
      addNotification({
        type: 'success',
        title: 'Événement rétabli',
        message:
          "L'événement est de nouveau planifié. Les inscrits sont prévenus qu'il est maintenu.",
      }),
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Rétablissement impossible',
        message: "L'événement n'a pas pu être rétabli. Il reste annulé.",
      }),
  });

  const { mutate: reopen, isPending: reopening } = useReopenEvent(event.id, {
    onSuccess: ({ inscriptions_remises }) =>
      addNotification({
        type: 'success',
        title: 'Événement rouvert',
        message: `${inscriptions_remises} inscription(s) marquée(s) absente(s) sont de nouveau inscrites.`,
      }),
  });

  // Même capacité que le serveur (`CanRestoreEvent`, `CanReopenEvent`) : l'écran et l'API ne
  // peuvent pas diverger. `config.manage` reproduit l'accès administrateur.
  const { data: capacites } = useMyCapabilities();
  const peutRetablir = hasCapability(capacites, CAPABILITY.CONFIG_MANAGE);

  const isClosed = event.statut === 'annule' || event.statut === 'termine';

  return (
    <div className="flex shrink-0 items-center gap-2">
      {/* Le check-in se fait sur l'écran Inscriptions : on y mène directement. */}
      <Button variant="outline" size="sm" asChild>
        <Link href={`/gestion/evenements/${event.id}/inscriptions`}>
          <Users className="mr-1.5 size-4" />
          Inscrits
        </Link>
      </Button>

      {event.statut === 'planifie' && (
        <Button
          size="sm"
          onClick={() => start()}
          disabled={starting}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Play className="mr-1.5 size-4" />
          Démarrer
        </Button>
      )}
      {/* Confirmation : la clôture marque absents tous les inscrits non
          pointés. Le 16/09/2026, un clic la veille de l'événement en a
          marqué 29 à tort. */}
      {event.statut === 'en_cours' && (
        <ConfirmationDialog
          icon="danger"
          title="Clôturer l'événement ?"
          body="Les inscrits qui n'ont pas été pointés seront marqués absents."
          cancelButtonText="Annuler"
          isDone={!closing}
          triggerButton={
            <Button size="sm" variant="secondary" disabled={closing}>
              <CheckCircle className="mr-1.5 size-4" />
              Clôturer
            </Button>
          }
          confirmButton={
            <Button
              variant="destructive"
              onClick={() => close()}
              disabled={closing}
            >
              Clôturer l&apos;événement
            </Button>
          }
        />
      )}

      {/* modal={false} : la fenêtre de confirmation s'ouvre depuis ce menu.
          Menu modal + fenêtre modale se disputent le focus et laissent le
          `pointer-events: none` de Radix bloqué sur la page. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Autres actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link href={`/public/evenements/${event.slug}`} target="_blank">
              <ExternalLink className="mr-2 size-4" />
              Page publique
            </Link>
          </DropdownMenuItem>
          {!isClosed && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmerAnnulation(true)}
                className="text-red-600"
              >
                <XCircle className="mr-2 size-4" />
                Annuler l&apos;événement
              </DropdownMenuItem>
            </>
          )}
          {/* L'annulation était irréversible : le 14/09/2026, un événement
              annulé par erreur a dû être corrigé en base de production. */}
          {event.statut === 'annule' && peutRetablir && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => restore()} disabled={restoring}>
                <RotateCcw className="mr-2 size-4" />
                Rétablir l&apos;événement
              </DropdownMenuItem>
            </>
          )}
          {event.statut === 'termine' && peutRetablir && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => reopen()} disabled={reopening}>
                <Undo2 className="mr-2 size-4" />
                Rouvrir l&apos;événement
              </DropdownMenuItem>
            </>
          )}
          {event.statut === 'planifie' && (
            <DropdownMenuItem onClick={() => del()} className="text-red-600">
              <Trash2 className="mr-2 size-4" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Le 14/09/2026, un clic dans ce menu a annulé un événement par erreur :
          l'annulation prévient aussi les inscrits, elle doit être délibérée. */}
      <Dialog open={confirmerAnnulation} onOpenChange={setConfirmerAnnulation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Annuler « {event.titre} » ?</DialogTitle>
            <DialogDescription>
              Les inscrits seront prévenus que l&apos;événement est annulé. Un
              administrateur pourra le rétablir si c&apos;est une erreur.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmerAnnulation(false)}
              disabled={cancelling}
            >
              Garder l&apos;événement
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancel({})}
              disabled={cancelling}
            >
              Oui, annuler l&apos;événement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
