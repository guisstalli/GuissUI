'use client';

import { MapPin } from 'lucide-react';

import { useSitesOuverts } from '../api/campagne';
import type { Campagne } from '../types/types';

const CLE_MEMOIRE = 'guiss.campagne.site';

/** Retient le lieu de la séance d'un rechargement à l'autre.
 *
 * Une campagne dure la journée ; redemander le lieu après chaque rafraîchissement
 * ramènerait exactement le champ qu'on cherche à supprimer du formulaire. */
export function lireCampagneMemorisee(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const brut = window.localStorage.getItem(CLE_MEMOIRE);
    return brut ? Number(brut) : null;
  } catch {
    return null;
  }
}

function memoriser(siteId: number | null) {
  try {
    if (siteId === null) window.localStorage.removeItem(CLE_MEMOIRE);
    else window.localStorage.setItem(CLE_MEMOIRE, String(siteId));
  } catch {
    // Navigation privée, stockage bloqué : la séance marche quand même, elle
    // redemandera le lieu au prochain chargement.
  }
}

interface SelecteurCampagneProps {
  campagne: Campagne;
  onChange: (campagne: Campagne) => void;
}

export function SelecteurCampagne({
  campagne,
  onChange,
}: SelecteurCampagneProps) {
  const { data } = useSitesOuverts();
  const sites = data?.results ?? [];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <MapPin className="size-4 text-muted-foreground" />
      <label
        htmlFor="campagne-site"
        className="text-sm font-medium text-foreground"
      >
        Campagne du jour
      </label>
      <select
        id="campagne-site"
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        value={campagne.siteId ?? ''}
        onChange={(e) => {
          const siteId = e.target.value ? Number(e.target.value) : null;
          const site = sites.find((s) => s.id === siteId);
          memoriser(siteId);
          onChange({
            siteId,
            eventId: null,
            libelle: site?.libelle ?? '',
          });
        }}
      >
        <option value="">Choisir le lieu…</option>
        {sites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.libelle}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground">
        Ce lieu est posé sur chaque personne et chaque examen de la séance — il
        n’est plus demandé dossier par dossier.
      </span>
    </div>
  );
}
