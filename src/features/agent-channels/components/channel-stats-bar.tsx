'use client';

import { AlertTriangle, MessageCircle, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { useChannelStats } from '../api/get-channel-stats';

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  /** Bascule la carte en rouge. Réservé au compteur d'échecs. */
  alerte?: boolean;
};

function StatCard({ label, value, hint, icon: Icon, alerte }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4',
        alerte && 'border-destructive/50 bg-destructive/5',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Icon
          className={cn(
            'size-4 shrink-0 text-muted-foreground',
            alerte && 'text-destructive',
          )}
          aria-hidden="true"
        />
      </div>
      <p
        className={cn(
          'mt-2 text-3xl font-semibold tabular-nums',
          alerte && 'text-destructive',
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/**
 * Bandeau d'indicateurs des canaux.
 *
 * Sa raison d'être tient dans la deuxième carte : un incident fournisseur doit
 * se voir SANS ouvrir le journal. L'erreur 63112 (compte WhatsApp désactivé
 * par Meta) est restée invisible des heures parce que rien, sur cette page,
 * ne signalait que des messages échouaient.
 */
export function ChannelStatsBar() {
  const { data, isLoading, isError, refetch, isFetching } = useChannelStats();

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-lg border bg-card p-8">
        <Spinner size="sm" />
      </div>
    );
  }

  if (isError || !data) {
    // Un bandeau vide laisserait croire à zéro échec — exactement le message
    // inverse de celui qu'il faut envoyer quand on ne sait pas.
    return (
      <div className="border-destructive/50 bg-destructive/5 flex flex-wrap items-center gap-3 rounded-lg border p-4">
        <AlertTriangle
          className="size-4 shrink-0 text-destructive"
          aria-hidden="true"
        />
        <p className="text-sm">
          Indicateurs indisponibles — impossible de savoir si des messages
          échouent.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Identités actives"
        value={data.active_senders}
        hint="Autorisées à discuter avec l'assistant"
        icon={Users}
      />
      <StatCard
        label="Échecs 24 h"
        value={data.failed_messages_24h}
        hint="Messages non remis sur les dernières 24 heures"
        icon={AlertTriangle}
        alerte={data.failed_messages_24h > 0}
      />
      <StatCard
        label="Canaux configurés"
        value={data.configured_channels}
        hint="Canaux ayant au moins une identité autorisée"
        icon={MessageCircle}
      />
    </div>
  );
}
