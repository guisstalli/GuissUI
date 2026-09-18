'use client';

import { useEffect, useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useDocumentPanelStore } from '@/stores/document-panel-store';

import { ReportDocumentPanel } from './report-document-panel';

/** Doit correspondre au `lg:` de Tailwind utilisé ci-dessous. */
const LG_BREAKPOINT = 1024;

/**
 * Vrai sous le point de rupture `lg`. Rend `false` au premier rendu (serveur et
 * hydratation) : la colonne latérale est de toute façon masquée en CSS sous
 * `lg`, donc aucun scintillement visible.
 */
function useEstEtroit(): boolean {
  const [etroit, setEtroit] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
    const onChange = () => setEtroit(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return etroit;
}

/**
 * Panneau d'aperçu des documents produits par l'assistant.
 *
 * Deux rendus pour un seul état :
 * - desktop (≥ lg) : colonne latérale persistante à droite du fil ;
 * - mobile : feuille plein écran, car mettre un document lisible à côté d'une
 *   conversation sur 400 px de large rendrait les deux illisibles.
 *
 * UNE SEULE instance est montée à la fois. Rendre les deux et n'en masquer une
 * qu'en CSS dupliquerait les états locaux (dialogues d'approbation) et les
 * abonnements : une action déclenchée dans l'une n'ouvrirait rien dans l'autre.
 *
 * Le composant ne rend RIEN quand aucun document n'est ouvert : le fil reprend
 * alors toute la largeur, sans conteneur vide qui mangerait de la place.
 */
export function DocumentPanel() {
  const document = useDocumentPanelStore((etat) => etat.document);
  const fermer = useDocumentPanelStore((etat) => etat.fermer);
  const etroit = useEstEtroit();

  if (!document) return null;

  if (etroit) {
    return (
      <Sheet open onOpenChange={(ouvert) => !ouvert && fermer()}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
          {/* Titre requis par Radix pour l'accessibilité du dialogue ; le
              panneau affiche son propre en-tête, plus riche. */}
          <SheetHeader className="sr-only">
            <SheetTitle>Aperçu du document</SheetTitle>
          </SheetHeader>
          <ReportDocumentPanel reportId={document.reportId} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      id="panneau-document"
      aria-label="Aperçu du document"
      className="flex min-h-0 w-[26rem] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background xl:w-[32rem]"
    >
      <ReportDocumentPanel reportId={document.reportId} />
    </aside>
  );
}
