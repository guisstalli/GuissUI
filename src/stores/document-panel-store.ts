import { create } from 'zustand';

/** Onglet actif du panneau document. */
export type DocumentPanelTab = 'apercu' | 'sources' | 'verification';

/** Document ouvert dans le panneau — aujourd'hui uniquement un rapport. */
export type OpenDocument = {
  type: 'report';
  reportId: number;
};

type DocumentPanelStore = {
  /** `null` = panneau fermé, le fil occupe toute la largeur. */
  document: OpenDocument | null;
  tab: DocumentPanelTab;
  ouvrirRapport: (reportId: number, tab?: DocumentPanelTab) => void;
  changerOnglet: (tab: DocumentPanelTab) => void;
  fermer: () => void;
};

/**
 * Panneau d'aperçu des documents produits par l'assistant.
 *
 * Un store plutôt qu'un état local : l'ouverture est déclenchée depuis une
 * carte enfouie dans le fil (`ReportArtifactCard`), alors que le panneau est
 * monté par le layout du segment `/assistant-ia`, au-dessus du fil. Faire
 * remonter l'état par les props traverserait quatre niveaux de composants
 * pour un booléen et un identifiant.
 *
 * C'est de l'état UI, pas de la donnée serveur : le CONTENU du rapport reste
 * dans le cache TanStack, sondé par le panneau. Le store ne retient que
 * « quel document est ouvert, sur quel onglet ».
 */
export const useDocumentPanelStore = create<DocumentPanelStore>((set) => ({
  document: null,
  tab: 'apercu',
  // Ré-ouvrir un rapport déjà ouvert sans préciser d'onglet conserve l'onglet
  // courant : cliquer deux fois la même carte ne doit pas ramener l'utilisateur
  // à l'aperçu alors qu'il consultait les sources.
  ouvrirRapport: (reportId, tab) =>
    set((etat) => ({
      document: { type: 'report', reportId },
      tab: tab ?? (etat.document?.reportId === reportId ? etat.tab : 'apercu'),
    })),
  changerOnglet: (tab) => set({ tab }),
  fermer: () => set({ document: null }),
}));

/** Rapport actuellement ouvert, ou `null`. Sélecteur pour éviter de réabonner
 *  un composant à l'onglet actif quand il ne s'intéresse qu'au document. */
export const useOpenReportId = (): number | null =>
  useDocumentPanelStore((etat) =>
    etat.document?.type === 'report' ? etat.document.reportId : null,
  );
