import { create } from 'zustand';

/** Une étape de génération, telle que le serveur l'annonce. */
export type ReportProgress = {
  report_id: number;
  phase: string;
  /** Libellé affichable, fourni par le serveur. */
  label: string;
  status: 'running' | 'done' | 'failed';
  detail?: string;
};

type ReportProgressStore = {
  /** Dernière étape connue, par rapport. */
  parRapport: Record<number, ReportProgress>;
  publier: (progression: ReportProgress) => void;
  oublier: (reportId: number) => void;
};

/**
 * Progression de génération, alimentée par le WebSocket des notifications.
 *
 * Un store plutôt qu'un état local : le message arrive sur la socket globale,
 * montée une seule fois pour toute l'application, alors que l'écran de détail
 * d'un rapport peut être monté, démonté et remonté. Sans point de rendez-vous
 * partagé, une étape reçue pendant que l'écran est fermé serait perdue.
 *
 * On ne conserve que la DERNIÈRE étape par rapport : l'utilisateur veut savoir
 * où on en est, pas relire l'historique. Garder la liste complète ferait
 * grossir la mémoire sans rien apporter.
 */
export const useReportProgressStore = create<ReportProgressStore>((set) => ({
  parRapport: {},
  publier: (progression) =>
    set((etat) => ({
      parRapport: { ...etat.parRapport, [progression.report_id]: progression },
    })),
  oublier: (reportId) =>
    set((etat) => {
      const suite = { ...etat.parRapport };
      delete suite[reportId];
      return { parRapport: suite };
    }),
}));

/** Progression du rapport donné, ou `undefined` si aucune n'est connue. */
export const useReportProgress = (
  reportId: number | null | undefined,
): ReportProgress | undefined =>
  useReportProgressStore((etat) =>
    reportId == null ? undefined : etat.parRapport[reportId],
  );
