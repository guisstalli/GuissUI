'use client';

import { AlertTriangle, Loader2, UserCheck } from 'lucide-react';
import Link from 'next/link';

import { useDebounce } from '@/hooks/use-debounce';

import {
  LOOKUP_TELEPHONE_DEBOUNCE_MS,
  useLookupTelephone,
} from '../api/lookup-telephone';

interface PhoneLookupHintProps {
  /** Valeur brute du champ téléphone (E.164 dès qu'elle est complète). */
  phoneNumber: string | null | undefined;
  /** Coupe la recherche (ex. formulaire d'édition du patient lui-même). */
  enabled?: boolean;
}

/**
 * Indique, sous un champ téléphone, qu'un patient porte déjà ce numéro.
 *
 * `phone_number` est UNIQUE en base : sans cet avertissement, l'utilisateur
 * remplissait tout le formulaire avant de se heurter à une erreur serveur.
 *
 * La saisie est debouncée ici même (le endpoint est limité à 120 requêtes par
 * minute) et aucune requête n'est émise tant que le numéro n'est pas un E.164
 * valide.
 */
export function PhoneLookupHint({
  phoneNumber,
  enabled = true,
}: PhoneLookupHintProps) {
  const debouncedPhone = useDebounce(
    phoneNumber ?? '',
    LOOKUP_TELEPHONE_DEBOUNCE_MS,
  );

  const { data, isFetching } = useLookupTelephone({
    phoneNumber: debouncedPhone,
    enabled,
  });

  const patient = data?.patient_existant ?? null;

  if (isFetching && !patient) {
    return (
      <p
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
        role="status"
      >
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        Vérification du numéro…
      </p>
    );
  }

  if (!patient) return null;

  if (patient.is_deleted) {
    return (
      <p
        className="flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-800"
        role="alert"
      >
        <AlertTriangle
          className="mt-0.5 size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span>
          Ce numéro appartient à un dossier archivé (
          <strong>{patient.full_name}</strong>). Restaurez-le plutôt que de
          créer un doublon.
        </span>
      </p>
    );
  }

  return (
    <p
      className="flex items-start gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-2.5 py-2 text-xs text-blue-800"
      role="status"
    >
      <UserCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>
        Ce numéro est déjà celui de <strong>{patient.full_name}</strong>,{' '}
        {patient.age} ans — {patient.examens_count} examen
        {patient.examens_count > 1 ? 's' : ''}.{' '}
        <Link
          href={`/patients/${patient.id}`}
          className="font-medium underline underline-offset-2"
        >
          Voir le dossier
        </Link>
      </span>
    </p>
  );
}
