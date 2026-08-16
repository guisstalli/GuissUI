'use client';

import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { Spinner } from '@/components/ui/spinner';
import {
  type CapabilityCode,
  hasCapability,
  useMyCapabilities,
} from '@/lib/capabilities';

type CapabilityGateProps = {
  capability: CapabilityCode;
  children: ReactNode;
};

/**
 * Enveloppe une page sur une capacité serveur. Pendant le chargement des
 * capacités on affiche un spinner ; sans la capacité, un état « accès non
 * autorisé » gracieux (miroir des pages admin) plutôt qu'un crash.
 */
export function CapabilityGate({ capability, children }: CapabilityGateProps) {
  const { data, isLoading, isError } = useMyCapabilities();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError || !hasCapability(data, capability)) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <ShieldAlert className="size-12" />
        <p className="text-sm font-medium">Accès non autorisé</p>
        <p className="text-xs">
          Vous n&apos;avez pas les droits pour accéder à cette section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
