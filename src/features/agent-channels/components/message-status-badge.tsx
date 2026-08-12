'use client';

import { AlertTriangle, Check, CheckCheck, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import {
  INBOUND_STATUS_LABELS,
  OUTBOUND_STATUS_LABELS,
  type InboundStatus,
  type OutboundStatus,
} from '../types';

type MessageStatusBadgeProps = {
  status: string;
  direction: 'in' | 'out';
};

/**
 * Statut d'un message, avec une règle non négociable : ne jamais promettre
 * plus que ce que l'on sait.
 *
 * `queued` signifie « le fournisseur a accepté la requête », pas « le
 * destinataire a reçu ». Les afficher pareil a coûté un incident : des
 * réponses marquées « Envoyé » avaient en réalité échoué (erreur 63112,
 * compte WhatsApp désactivé par Meta), et personne ne l'a vu.
 *
 * D'où trois niveaux visuellement distincts — accepté (ambre), envoyé
 * (neutre), remis (vert) — et un échec en rouge, impossible à manquer.
 */
export function MessageStatusBadge({
  status,
  direction,
}: MessageStatusBadgeProps) {
  const libelle =
    direction === 'out'
      ? (OUTBOUND_STATUS_LABELS[status as OutboundStatus] ?? status)
      : (INBOUND_STATUS_LABELS[status as InboundStatus] ?? status);

  if (status === 'failed' || status === 'rejected') {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="size-3" aria-hidden="true" />
        {libelle}
      </Badge>
    );
  }

  if (status === 'queued' || status === 'pending') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-1 border-amber-500/40 text-amber-700',
          'dark:text-amber-400',
        )}
        title="Accepté par le fournisseur — la remise n'est pas confirmée"
      >
        <Clock className="size-3" aria-hidden="true" />
        {libelle}
      </Badge>
    );
  }

  if (status === 'delivered') {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
      >
        <CheckCheck className="size-3" aria-hidden="true" />
        {libelle}
      </Badge>
    );
  }

  if (status === 'sent') {
    return (
      <Badge variant="outline" className="gap-1">
        <Check className="size-3" aria-hidden="true" />
        {libelle}
      </Badge>
    );
  }

  return <Badge variant="secondary">{libelle}</Badge>;
}
