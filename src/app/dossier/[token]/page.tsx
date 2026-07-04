'use client';

import { AlertTriangle, Download, FileText, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { PublicShell } from '@/components/public/public-shell';
import { Button } from '@/components/ui/button';
import {
  SharedDocumentError,
  useSharedDocument,
} from '@/features/exams/api/download-shared-document';

export default function DossierPartagePage() {
  const params = useParams();
  const token = (params?.token as string) ?? '';

  const { data, isLoading, isError, error } = useSharedDocument(token);

  // Révoque l'URL objet à la sortie pour éviter la fuite mémoire.
  useEffect(() => {
    const blobUrl = data?.blobUrl;
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [data?.blobUrl]);

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Dossier médical
          </h1>
          <p className="text-slate-500">Service ophtalmologique — UIDT</p>
        </div>

        {isLoading && (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16"
            data-testid="dossier-loading"
          >
            <Loader2 className="size-8 animate-spin text-cyan-500" />
            <p className="text-sm text-slate-500">Chargement du dossier…</p>
          </div>
        )}

        {isError && (
          <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-red-700">
              Dossier indisponible
            </h2>
            <p className="text-sm text-red-600">
              {error instanceof SharedDocumentError
                ? error.message
                : 'Une erreur est survenue lors du chargement du dossier.'}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez
              le service qui vous a transmis ce lien.
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-50">
                  <FileText className="size-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {data.filename}
                  </p>
                  <p className="text-xs text-slate-500">
                    Votre dossier est prêt.
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="w-full bg-cyan-500 font-semibold text-white hover:bg-cyan-400 sm:w-auto"
              >
                <a href={data.blobUrl} download={data.filename}>
                  <Download className="mr-2 size-4" aria-hidden="true" />
                  Télécharger le PDF
                </a>
              </Button>
            </div>

            <object
              data={data.blobUrl}
              type="application/pdf"
              aria-label="Aperçu du dossier médical"
              className="h-[70vh] w-full rounded-xl border border-slate-200 bg-white"
            >
              <p className="p-6 text-center text-sm text-slate-500">
                L&apos;aperçu n&apos;est pas disponible sur cet appareil.
                Utilisez le bouton « Télécharger le PDF ».
              </p>
            </object>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
