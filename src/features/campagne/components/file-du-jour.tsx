'use client';

import Link from 'next/link';

import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';

import { useFileCampagne } from '../api/campagne';
import type { Campagne, LigneFile } from '../types/types';

/** Trois états, jamais deux : ouvert, commencé, terminé. */
function Etat({ ligne }: { ligne: LigneFile }) {
  if (ligne.complet) {
    return (
      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
        terminé
      </span>
    );
  }
  if (ligne.commence) {
    return (
      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs text-sky-900 dark:bg-sky-900/40 dark:text-sky-100">
        en cours
      </span>
    );
  }
  return (
    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
      à mesurer
    </span>
  );
}

interface FileDuJourProps {
  campagne: Campagne;
}

/**
 * La file de la journée.
 *
 * Elle répond à la question que personne ne pouvait poser à l'application
 * pendant une campagne : qui est passé, et qui attend encore une mesure. Le
 * 17/09/2026, 98 examens enfant sur 189 sont restés vides — personne n'avait
 * de vue pour s'en apercevoir sur place.
 */
export function FileDuJour({ campagne }: FileDuJourProps) {
  const { data, isLoading } = useFileCampagne({
    siteId: campagne.siteId,
    eventId: campagne.eventId,
  });

  const lignes = data ?? [];
  const aMesurer = lignes.filter((l) => !l.commence).length;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3">
        <div>
          <h3 className="font-semibold">File du jour</h3>
          <p className="text-sm text-muted-foreground">
            {campagne.libelle || 'Aucune campagne ouverte'}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          <b className="font-mono text-foreground">{lignes.length}</b>{' '}
          passage(s)
          {aMesurer > 0 && (
            <>
              {' · '}
              <b className="font-mono text-foreground">{aMesurer}</b> sans
              aucune mesure
            </>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : lignes.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Personne n’est encore passé sur cette campagne aujourd’hui.
        </p>
      ) : (
        <ul className="divide-y">
          {lignes.map((ligne) => (
            <li
              key={`${ligne.type_examen}-${ligne.examen_id}`}
              className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm"
            >
              <span className="w-14 font-mono text-xs text-muted-foreground">
                {new Date(ligne.heure).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <Link
                href={
                  ligne.type_examen === 'adulte'
                    ? paths.exams.adult.detail.getHref(ligne.examen_id)
                    : paths.exams.child.detail.getHref(ligne.examen_id)
                }
                className="font-medium hover:underline"
              >
                {ligne.patient.nom_complet}
              </Link>
              <span className="text-xs text-muted-foreground">
                {ligne.patient.age ?? '—'} ans · {ligne.type_examen}
              </span>
              <Etat ligne={ligne} />
              {ligne.motif_reprise && (
                <span className="text-xs text-muted-foreground">
                  reprise : {ligne.motif_reprise}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
