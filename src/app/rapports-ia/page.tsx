'use client';

import { FileBarChart } from 'lucide-react';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can';
import { paths } from '@/config/paths';

/**
 * Placeholder — la gestion des rapports IA (liste, génération, détail,
 * workflow approbation/diffusion) correspond aux phases 4-5. La couche API
 * est déjà écrite (src/features/ai-reports/api/), seuls les écrans manquent.
 * Cette page évite une 404 sur le lien « Rapports IA » de la barre latérale.
 */
export default function RapportsIaPage() {
  return (
    <Can permission="ai-reports:view">
      <Shell title="Rapports IA">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
          <div className="bg-primary/10 flex size-14 items-center justify-center rounded-full">
            <FileBarChart className="size-7 text-primary" aria-hidden />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              Rapports IA — bientôt disponible
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              La génération, la relecture et la diffusion des rapports
              analytiques arriveront prochainement. En attendant, posez vos
              questions à l&apos;
              <a
                href={paths.aiReports.chat.getHref()}
                className="font-medium text-primary underline underline-offset-2"
              >
                Assistant IA
              </a>
              .
            </p>
          </div>
        </div>
      </Shell>
    </Can>
  );
}
