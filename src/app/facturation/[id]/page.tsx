'use client';

import dayjs from 'dayjs';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Plus,
  Receipt,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';
import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAddPaiement } from '@/features/billing/api/add-paiement';
import { useAnnulerFacture } from '@/features/billing/api/annuler-facture';
import { downloadFacturePdf } from '@/features/billing/api/download-facture-pdf';
import { useEmettreFacture } from '@/features/billing/api/emettre-facture';
import { useFacture } from '@/features/billing/api/get-facture';
import { FactureStatusBadge } from '@/features/billing/components/facture-status-badge';
import { PaiementForm } from '@/features/billing/components/paiement-form';
import { useDialogCleanup } from '@/hooks/use-dialog-cleanup';

const MODE_LABELS: Record<string, string> = {
  especes: 'Espèces',
  cheque: 'Chèque',
  virement: 'Virement',
  carte: 'Carte bancaire',
  mobile_money: 'Mobile Money',
  autre: 'Autre',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value ?? '—'}</span>
    </div>
  );
}

export default function FactureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const factureId = Number(id);

  const [showEmettreDialog, setShowEmettreDialog] = useState(false);
  const [showAnnulerDialog, setShowAnnulerDialog] = useState(false);
  const [showPaiementDialog, setShowPaiementDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { addNotification } = useNotifications();

  useDialogCleanup([showEmettreDialog, showAnnulerDialog, showPaiementDialog]);

  const { data: facture, isLoading } = useFacture(factureId);

  const emettreM = useEmettreFacture({
    mutationConfig: { onSuccess: () => setShowEmettreDialog(false) },
  });

  const annulerM = useAnnulerFacture({
    mutationConfig: { onSuccess: () => setShowAnnulerDialog(false) },
  });

  const addPaiementM = useAddPaiement({
    mutationConfig: { onSuccess: () => setShowPaiementDialog(false) },
  });

  const handleDownloadPdf = async () => {
    if (!facture) return;
    setIsDownloading(true);
    try {
      await downloadFacturePdf(facture.id, facture.numero);
    } catch {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de télécharger la facture.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Shell title="Facture">
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      </Shell>
    );
  }

  if (!facture) {
    return (
      <Shell title="Facture introuvable">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground">
            Cette facture n&apos;existe pas.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => router.back()}
          >
            Retour
          </Button>
        </div>
      </Shell>
    );
  }

  const canEmettre = facture.statut === 'brouillon';
  const canAnnuler =
    facture.statut === 'brouillon' || facture.statut === 'emise';
  const canAddPaiement = facture.statut === 'emise';

  return (
    <Shell title={`Facture ${facture.numero}`}>
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/facturation">
              <ArrowLeft className="mr-1.5 size-4" />
              Retour
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {canEmettre && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEmettreDialog(true)}
              >
                <CheckCircle className="mr-1.5 size-3.5" />
                Émettre
              </Button>
            )}
            {canAnnuler && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowAnnulerDialog(true)}
              >
                <Ban className="mr-1.5 size-3.5" />
                Annuler
              </Button>
            )}
            {canAddPaiement && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPaiementDialog(true)}
              >
                <Plus className="mr-1.5 size-3.5" />
                Ajouter un paiement
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Download className="mr-1.5 size-3.5" />
              )}
              Télécharger PDF
            </Button>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Facture info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" />
                Informations facture
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow
                label="Numéro"
                value={<span className="font-mono">{facture.numero}</span>}
              />
              <InfoRow
                label="Statut"
                value={
                  <FactureStatusBadge
                    statut={facture.statut}
                    statut_display={facture.statut_display}
                  />
                }
              />
              <InfoRow label="Site" value={facture.site_libelle} />
              <InfoRow
                label="Date d'émission"
                value={dayjs(facture.date_emission).format('DD/MM/YYYY')}
              />
              {facture.rendez_vous_numero && (
                <InfoRow
                  label="Rendez-vous"
                  value={facture.rendez_vous_numero}
                />
              )}
              {facture.notes && (
                <InfoRow
                  label="Notes"
                  value={
                    <span className="whitespace-pre-wrap text-left">
                      {facture.notes}
                    </span>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Patient */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow
                label="Nom complet"
                value={
                  `${facture.patient_prenom} ${facture.patient_nom}`.trim() ||
                  '—'
                }
              />
              <InfoRow label="Téléphone" value={facture.patient_phone} />
            </CardContent>
          </Card>
        </div>

        {/* Lignes de facturation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="size-4" />
              Lignes de facturation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {facture.lignes.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                Aucune ligne.
              </p>
            ) : (
              <TableElement className="bg-card">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">P.U.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facture.lignes.map((ligne) => (
                    <TableRow key={ligne.id}>
                      <TableCell>
                        <div>{ligne.description}</div>
                        {ligne.prestation_libelle &&
                          ligne.prestation_libelle !== ligne.description && (
                            <div className="text-xs text-muted-foreground">
                              {ligne.prestation_libelle}
                            </div>
                          )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {ligne.quantite}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {ligne.prix_unitaire}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {ligne.montant_total_display ?? ligne.montant_total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableElement>
            )}

            {/* Summary */}
            <div className="border-t px-6 py-4">
              <div className="ml-auto max-w-xs space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant total</span>
                  <span className="font-semibold tabular-nums">
                    {facture.montant_total_display}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant payé</span>
                  <span className="tabular-nums text-green-700 dark:text-green-400">
                    {facture.montant_paye}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1 text-sm font-semibold">
                  <span>Reste à payer</span>
                  <span className="tabular-nums">{facture.reste_a_payer}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paiements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="size-4" />
                Paiements ({facture.paiements.length})
              </CardTitle>
              {canAddPaiement && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPaiementDialog(true)}
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Ajouter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {facture.paiements.length === 0 ? (
              <p className="px-6 pb-4 text-sm text-muted-foreground">
                Aucun paiement enregistré.
              </p>
            ) : (
              <TableElement className="bg-card">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facture.paiements.map((paiement) => (
                    <TableRow key={paiement.id}>
                      <TableCell className="text-sm">
                        {dayjs(paiement.date_paiement).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {paiement.mode_display ??
                          MODE_LABELS[paiement.mode] ??
                          paiement.mode}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {paiement.reference ?? '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {paiement.montant_display ?? paiement.montant}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableElement>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Émettre dialog */}
      <Dialog
        open={showEmettreDialog}
        onOpenChange={(open) => {
          if (!open) setShowEmettreDialog(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-blue-600" />
              Émettre la facture
            </DialogTitle>
            <DialogDescription>
              La facture{' '}
              <span className="font-mono font-semibold">{facture.numero}</span>{' '}
              sera marquée comme émise. Elle ne pourra plus être modifiée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmettreDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => emettreM.mutate(facture.id)}
              disabled={emettreM.isPending}
            >
              {emettreM.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Émettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Annuler dialog */}
      <Dialog
        open={showAnnulerDialog}
        onOpenChange={(open) => {
          if (!open) setShowAnnulerDialog(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="size-5" />
              Annuler la facture
            </DialogTitle>
            <DialogDescription>
              La facture{' '}
              <span className="font-mono font-semibold">{facture.numero}</span>{' '}
              sera annulée. Cette action est{' '}
              <span className="font-semibold text-destructive">
                irréversible
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAnnulerDialog(false)}
            >
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={() => annulerM.mutate(facture.id)}
              disabled={annulerM.isPending}
            >
              {annulerM.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Annuler la facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Paiement dialog */}
      <Dialog
        open={showPaiementDialog}
        onOpenChange={(open) => {
          if (!open) setShowPaiementDialog(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un paiement</DialogTitle>
            <DialogDescription>
              Enregistrer un paiement pour la facture{' '}
              <span className="font-mono font-semibold">{facture.numero}</span>.
              Reste à payer :{' '}
              <span className="font-semibold">{facture.reste_a_payer}</span>.
            </DialogDescription>
          </DialogHeader>
          <PaiementForm
            onSubmit={(data) =>
              addPaiementM.mutate({ factureId: facture.id, data })
            }
            isPending={addPaiementM.isPending}
          />
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
