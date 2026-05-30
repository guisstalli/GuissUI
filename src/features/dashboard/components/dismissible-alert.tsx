'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface DismissibleAlertProps {
  /** Clé localStorage stable, ex: `dashboard.alert.rdv_pending` */
  storageKey: string;
  /**
   * Signature qui invalide la fermeture quand le contenu change.
   * Ex: `${count}_${YYYYMMDD}` — si le compteur change ou si la journée
   * change, l'alerte réapparaît automatiquement.
   */
  signature: string;
  href: string;
  className?: string;
  icon?: React.ReactNode;
  cta?: string;
  children: React.ReactNode;
}

/**
 * Alerte cliquable du tableau de bord avec bouton de fermeture persistant.
 *
 * Persistance : `localStorage[storageKey] === signature` → masquée. Si la
 * signature change (nouveau compteur, nouvelle journée), l'alerte
 * réapparaît automatiquement.
 *
 * SSR-safe : caché par défaut jusqu'au montage côté client pour éviter le
 * flash d'hydratation.
 */
export function DismissibleAlert({
  storageKey,
  signature,
  href,
  className,
  icon,
  cta = 'Voir →',
  children,
}: DismissibleAlertProps) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(storageKey);
      setDismissed(stored === signature);
    } catch {
      // localStorage indisponible (mode privé strict) — on affiche
    }
  }, [storageKey, signature]);

  if (!mounted || dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      window.localStorage.setItem(storageKey, signature);
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors',
        className,
      )}
    >
      <Link href={href} className="flex flex-1 items-center gap-3">
        {icon}
        <span className="flex-1 font-medium">{children}</span>
        <span className="text-xs opacity-80">{cta}</span>
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Masquer cette alerte"
        className="rounded p-1 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/**
 * Renvoie une signature standard à utiliser avec `DismissibleAlert` —
 * change si le compteur ou le jour change.
 */
export function alertSignature(count: number): string {
  const today = new Date();
  const yyyymmdd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  return `${count}_${yyyymmdd}`;
}
