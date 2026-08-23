'use client';

import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { useCorrigerSiteExamen } from '@/features/exams/api/update-exam-site';
import { SiteSelector } from '@/features/sites/components/site-selector';

type BoutonModifierSiteProps = {
  examenId: number;
  numeroExamen: string;
  estAdulte: boolean;
  /** Site actuel, pour pré-sélectionner et montrer ce qu'on corrige. */
  siteActuelId?: number | null;
  siteActuelLibelle?: string | null;
};

/**
 * Correction du site de dépistage d'un examen.
 *
 * Le site est omissible à la création : jusqu'ici un examen saisi sans lieu le
 * restait DÉFINITIVEMENT — la colonne « Site » affichait « — » et l'examen
 * manquait dans tout agrégat par site, sans qu'aucun écran ne le signale.
 * L'action « Voir » et « Supprimer » existaient ; se rattraper, non.
 *
 * Volontairement disponible aussi sur un examen finalisé : l'oubli se
 * découvre après la clôture, et imposer une réouverture ferait renoncer à la
 * correction. Le site est une donnée administrative ; les mesures cliniques
 * restent verrouillées par ailleurs.
 *
 * Place a la couche APPLICATION, comme create-exam-dialog : il compose deux
 * features (exams et sites), ce qu'un import inter-features interdit.
 */
export function BoutonModifierSite({
  examenId,
  numeroExamen,
  estAdulte,
  siteActuelId = null,
  siteActuelLibelle = null,
}: BoutonModifierSiteProps) {
  const [ouvert, setOuvert] = useState(false);
  const [siteId, setSiteId] = useState<number | null>(siteActuelId);

  const corriger = useCorrigerSiteExamen({
    onSuccess: () => setOuvert(false),
  });

  const ouvrir = () => {
    setSiteId(siteActuelId);
    setOuvert(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={ouvrir}
        aria-label={`Modifier le site de l'examen ${numeroExamen}`}
      >
        <Pencil className="size-4" />
      </Button>

      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Site de dépistage</DialogTitle>
            <DialogDescription>
              {siteActuelLibelle
                ? `L'examen ${numeroExamen} est rattaché à « ${siteActuelLibelle} ».`
                : `L'examen ${numeroExamen} n'a aucun site renseigné.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <span className="text-sm font-medium leading-none">
              Nouveau site
            </span>
            <SiteSelector value={siteId} onChange={setSiteId} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
            <Button
              onClick={() =>
                siteId && corriger.mutate({ examenId, siteId, estAdulte })
              }
              disabled={
                !siteId || siteId === siteActuelId || corriger.isPending
              }
            >
              {corriger.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
