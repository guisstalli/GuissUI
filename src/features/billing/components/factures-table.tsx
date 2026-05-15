'use client';

import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Facture } from '../types/schemas';

import { FactureStatusBadge } from './facture-status-badge';

interface FacturesTableProps {
  factures: Facture[];
}

export function FacturesTable({ factures }: FacturesTableProps) {
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
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/facturation/${facture.id}`}>
                    <Eye className="mr-1.5 size-3.5" />
                    Ouvrir
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableElement>
    </div>
  );
}
