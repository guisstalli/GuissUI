'use client';

import { AlertCircle, Download, Printer } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Spinner } from '@/components/ui/spinner';
import { env } from '@/config/env';

import { downloadFacturePdf } from '../api/download-facture-pdf';

interface FacturePreviewDialogProps {
  factureId: number | null;
  factureNumero?: string;
  factureLabel?: string;
  open: boolean;
  onClose: () => void;
}

export function FacturePreviewDialog({
  factureId,
  factureNumero,
  factureLabel,
  open,
  onClose,
}: FacturePreviewDialogProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!open || factureId === null) {
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const session = await getSession();
        const token = session?.accessToken ?? null;
        const response = await fetch(
          `${env.API_URL}/billing/factures/${factureId}/pdf/`,
          {
            headers: {
              Accept: 'application/pdf',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Erreur lors du chargement du PDF',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
      setObjectUrl(null);
    };
  }, [factureId, open, reloadKey]);

  const handleDownload = async () => {
    if (factureId === null) return;
    await downloadFacturePdf(factureId, factureNumero ?? String(factureId));
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    const iframe = document.getElementById(
      'facture-preview-iframe',
    ) as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="flex h-[95vh] max-h-[95vh] max-w-5xl flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 border-b px-6 py-3">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-base">
              {factureLabel ?? `Facture ${factureNumero ?? ''}`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Aperçu du PDF avant impression ou archivage.
            </DialogDescription>
          </div>
          <div className="mr-6 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!objectUrl}
            >
              <Printer className="mr-1.5 size-3.5" />
              Imprimer
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              disabled={factureId === null}
            >
              <Download className="mr-1.5 size-3.5" />
              Télécharger
            </Button>
          </div>
        </DialogHeader>
        <div className="relative flex-1 overflow-hidden bg-muted">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertCircle className="size-10 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Impossible de charger la facture.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Réessayer
              </Button>
            </div>
          )}
          {objectUrl && !error && (
            <iframe
              id="facture-preview-iframe"
              src={objectUrl}
              title={factureLabel ?? 'Aperçu facture'}
              className="size-full border-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
