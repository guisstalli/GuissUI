'use client';

import dayjs from 'dayjs';
import { Download, Eye } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { downloadFacturePdf } from '../api/download-facture-pdf';
import type { Facture } from '../types/schemas';

import { FacturePreviewDialog } from './facture-preview-dialog';
import { FactureStatusBadge } from './facture-status-badge';

interface FacturesTableProps {
  factures: Facture[];
}

export function FacturesTable({ factures }: FacturesTableProps) {
  const [previewFacture, setPreviewFacture] = useState<Facture | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (facture: Facture) => {
    setDownloadingId(facture.id);
    try {
      await downloadFacturePdf(facture.id, facture.numero);
    } catch (e) {
      // Surfaced via console; the table action button stays usable.
      // A toast layer can be added by the host page if needed.
      // eslint-disable-next-line no-console
      console.error('Téléchargement facture échoué', e);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <TableElement className="bg-card">
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {factures.map((facture) => (
            <TableRow key={facture.id}>
              <TableCell className="font-mono text-sm font-medium">
                {facture.numero}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {facture.patient_prenom} {facture.patient_nom}
                </div>
                {facture.patient_phone && (
                  <div className="text-xs text-muted-foreground">
                    {facture.patient_phone}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {facture.site_libelle}
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                {facture.montant_total_display}
              </TableCell>
              <TableCell>
                <FactureStatusBadge
                  statut={facture.statut}
                  statut_display={facture.statut_display}
                />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {dayjs(facture.date_emission).format('DD/MM/YYYY')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Visualiser facture ${facture.numero}`}
                    onClick={() => setPreviewFacture(facture)}
                  >
                    <Eye className="mr-1.5 size-3.5" />
                    Visualiser
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Télécharger facture ${facture.numero}`}
                    disabled={downloadingId === facture.id}
                    onClick={() => handleDownload(facture)}
                  >
                    <Download className="mr-1.5 size-3.5" />
                    Télécharger
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableElement>

      <FacturePreviewDialog
        factureId={previewFacture?.id ?? null}
        factureNumero={previewFacture?.numero}
        factureLabel={
          previewFacture
            ? `N° ${previewFacture.numero} — ${previewFacture.patient_prenom} ${previewFacture.patient_nom}`
            : undefined
        }
        open={previewFacture !== null}
        onClose={() => setPreviewFacture(null)}
      />
    </div>
  );
}
