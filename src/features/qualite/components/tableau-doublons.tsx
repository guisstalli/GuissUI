'use client';

import Link from 'next/link';

import { Spinner } from '@/components/ui/spinner';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useDoublons } from '../api/get-doublons';
import type { FiltresQualite } from '../types/types';

type TableauDoublonsProps = {
  filtres: FiltresQualite;
};

/**
 * Détail des patients ayant plusieurs examens le même jour.
 *
 * C'est l'anomalie qui a produit l'incident du 23/08/2026 : 114 examens pour
 * 82 patients, données cliniques réparties entre les doublons. Affichée le
 * soir même, cette liste tient sur un écran et se corrige en quelques minutes.
 */
export function TableauDoublons({ filtres }: TableauDoublonsProps) {
  const { data, isLoading, isError } = useDoublons(filtres);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-6 text-center text-sm text-destructive">
        Impossible de charger le détail des doublons.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Aucun patient n’a plusieurs examens sur la période.
      </p>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jour</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead className="text-right">Examens</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((doublon) => (
            <TableRow key={`${doublon.jour}-${doublon.patient_id}`}>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(doublon.jour).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>
                <Link
                  href={`/patients/${doublon.patient_id}`}
                  className="font-medium hover:underline"
                >
                  Patient {doublon.patient_id}
                </Link>
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-destructive">
                {doublon.examens}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
