'use client';

import { useEffect, useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { useSitesOuverts } from '@/features/campagne/api/campagne';
import { FileDuJour } from '@/features/campagne/components/file-du-jour';
import { FormulaireArrivee } from '@/features/campagne/components/formulaire-arrivee';
import {
  lireCampagneMemorisee,
  SelecteurCampagne,
} from '@/features/campagne/components/selecteur-campagne';
import type { Campagne } from '@/features/campagne/types/types';

/**
 * Écran « Campagne ».
 *
 * Né du terrain : à la Gare Routière de Thiès (23/08/2026) comme à la campagne
 * scolaire du 17/09, enregistrer une personne demandait trois écrans — créer
 * le patient, ouvrir son examen, choisir le site — pour un seul geste. Le
 * site, identique toute la journée, était redemandé à chaque dossier, donc
 * oublié : 189 examens enfant sans lieu, 3 441 patients sans rattachement.
 *
 * Ici, la campagne se déclare une fois. Le reste suit.
 */
export default function CampagnePage() {
  const [campagne, setCampagne] = useState<Campagne>({
    siteId: null,
    eventId: null,
    libelle: '',
  });
  const { data } = useSitesOuverts();

  // Le lieu de la séance survit au rechargement : une campagne dure la
  // journée, et le redemander ramènerait le champ qu'on vient de supprimer.
  useEffect(() => {
    const memorise = lireCampagneMemorisee();
    if (memorise === null || !data?.results) return;
    setCampagne((actuelle) => {
      if (actuelle.siteId !== null) return actuelle;
      const site = data.results?.find((s) => s.id === memorise);
      if (!site) return actuelle;
      return { siteId: site.id, eventId: null, libelle: site.libelle };
    });
  }, [data]);

  return (
    <Shell title="Campagne">
      <div className="space-y-4">
        <SelecteurCampagne campagne={campagne} onChange={setCampagne} />

        <div className="grid gap-4 lg:grid-cols-2">
          <FormulaireArrivee campagne={campagne} />
          <FileDuJour campagne={campagne} />
        </div>
      </div>
    </Shell>
  );
}
