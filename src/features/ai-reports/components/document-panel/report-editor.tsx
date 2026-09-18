'use client';

import { Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';

import { useUpdateReportMarkdown } from '../../api/update-report-markdown';
import type { ReportDetail } from '../../types';
import { MarkdownContent } from '../markdown-content';

/**
 * Aperçu d'un rapport, corrigeable sur place tant qu'il est au brouillon.
 *
 * La relecture se faisait dans un traitement de texte : le médecin
 * téléchargeait le DOCX, le corrigeait, approuvait — et la correction quittait
 * la plateforme. On perdait la seule donnée qui dise ce qu'est un bon rapport
 * ici : l'écart entre ce que le modèle a écrit et ce que le médecin garde.
 *
 * Le serveur conserve le texte d'origine ; on l'affiche en regard quand il
 * existe, pour que le relecteur suivant voie ce qui a été retouché.
 */
export function ReportEditor({ report }: { report: ReportDetail }) {
  const { addNotification } = useNotifications();
  const [enEdition, setEnEdition] = useState(false);
  const [brouillon, setBrouillon] = useState(report.markdown ?? '');
  const [montrerOrigine, setMontrerOrigine] = useState(false);

  const { mutate: enregistrer, isPending } = useUpdateReportMarkdown({
    mutationConfig: {
      onSuccess: () => {
        setEnEdition(false);
        addNotification({
          type: 'success',
          title: 'Rapport corrigé',
          message:
            "Votre version remplace le texte généré. L'original reste conservé.",
        });
      },
      onError: () =>
        addNotification({
          type: 'error',
          title: 'Correction non enregistrée',
          message: 'Le rapport n’a pas été modifié.',
        }),
    },
  });

  const corrigeable = report.status === 'DRAFT';
  const texte = report.markdown ?? '';
  const aEteCorrige = Boolean(report.markdown_original);

  if (enEdition) {
    return (
      <div className="space-y-3">
        <label htmlFor="correction-rapport" className="sr-only">
          Texte du rapport
        </label>
        <textarea
          id="correction-rapport"
          value={brouillon}
          onChange={(event) => setBrouillon(event.target.value)}
          rows={24}
          className="w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed"
          spellCheck
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={isPending || !brouillon.trim()}
            onClick={() =>
              enregistrer({ reportId: report.id, markdown: brouillon })
            }
          >
            <Check className="mr-1.5 size-3.5" aria-hidden />
            Enregistrer la correction
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              setBrouillon(texte);
              setEnEdition(false);
            }}
          >
            <X className="mr-1.5 size-3.5" aria-hidden />
            Annuler
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Les chiffres ne sont pas revérifiés sur votre version : vous pouvez
          ajouter ce que les données ne portent pas (seuils réglementaires,
          interprétation clinique).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {corrigeable && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setBrouillon(texte);
              setEnEdition(true);
            }}
          >
            <Pencil className="mr-1.5 size-3.5" aria-hidden />
            Corriger le rapport
          </Button>
          {aEteCorrige && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMontrerOrigine((visible) => !visible)}
            >
              {montrerOrigine
                ? 'Masquer le texte généré'
                : 'Voir le texte généré'}
            </Button>
          )}
        </div>
      )}

      {aEteCorrige && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          Ce rapport a été corrigé après génération.
        </p>
      )}

      {montrerOrigine && report.markdown_original && (
        <section
          aria-label="Texte généré avant correction"
          className="rounded-md border border-dashed border-border p-3 opacity-80"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Texte généré
          </p>
          <MarkdownContent content={report.markdown_original} />
        </section>
      )}

      {texte ? (
        <MarkdownContent content={texte} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun contenu disponible pour ce rapport.
        </p>
      )}
    </div>
  );
}
