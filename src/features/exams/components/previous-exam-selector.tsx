'use client';

import { Check } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { useAdultExamsByPatient } from '../api/adult/get-adult-exams';

/**
 * Choix de l'examen auquel le nouvel examen fait suite.
 *
 * LE PROBLÈME N'EST PAS LA SÉLECTION, C'EST LA LECTURE. Un numéro seul —
 * `EXA-2026-AC8A471A` — ne permet à personne de reconnaître le bon examen.
 *
 * La réponse tient à une observation métier : un examen de suivi porte
 * presque toujours sur le MÊME patient. On n'a donc pas besoin d'une
 * recherche globale sur des numéros, mais de la courte liste des examens
 * antérieurs de ce patient, du plus récent au plus ancien, avec ce dont un
 * praticien se souvient réellement : la date, le site, l'état. Le choix se
 * réduit à deux ou trois lignes.
 */
export function PreviousExamSelector({
  patientId,
  value,
  onChange,
}: {
  patientId: number;
  value: number | null;
  onChange: (examenId: number | null) => void;
}) {
  const { data, isLoading } = useAdultExamsByPatient(patientId);
  const examens = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-3">
        <Spinner size="sm" />
      </div>
    );
  }

  if (examens.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
        Aucun examen antérieur pour ce patient.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
          value === null
            ? 'bg-primary/5 border-primary'
            : 'border-input hover:bg-muted',
        )}
      >
        <span className="text-foreground">Examen indépendant</span>
        {value === null && (
          <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
        )}
      </button>

      {examens.map((examen) => {
        const selectionne = value === examen.id;
        return (
          <button
            key={examen.id}
            type="button"
            onClick={() => onChange(examen.id)}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors',
              selectionne
                ? 'bg-primary/5 border-primary'
                : 'border-input hover:bg-muted',
            )}
          >
            <span className="min-w-0">
              {/* La date d'abord : c'est le repère naturel. Le numéro suit,
                  pour lever toute ambiguïté entre deux examens du même jour. */}
              <span className="block text-sm text-foreground">
                {new Date(examen.created).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {examen.site_libelle && (
                  <span className="text-muted-foreground">
                    {' '}
                    · {examen.site_libelle}
                  </span>
                )}
              </span>
              <span className="block truncate font-mono text-xs text-muted-foreground">
                {examen.numero_examen}
                {' · '}
                {examen.is_completed ? 'Complet' : 'En cours'}
              </span>
            </span>
            {selectionne && (
              <Check
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
