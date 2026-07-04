'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { PublicShell } from '@/components/public/public-shell';
import { useConfirmReschedulePublic } from '@/features/appointments/api/confirm-reschedule-public';
import { formatDateFr, formatSlot } from '@/features/appointments/utils/format';

export default function ConfirmerReplanificationPage() {
  const params = useParams();
  const token = (params?.token as string) ?? '';

  const {
    mutate: confirm,
    data: rdv,
    isPending: isLoading,
    isError,
    isIdle,
    error,
  } = useConfirmReschedulePublic(token);

  return (
    <PublicShell>
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md text-center">
          {/* État initial : on ne confirme RIEN au chargement (l'appel mute
              l'état). Le patient déclenche explicitement la confirmation. */}
          {isIdle && (
            <div data-testid="confirm-idle">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-2 border-cyan-500/20 bg-cyan-50">
                <CalendarCheck className="size-10 text-cyan-500" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-slate-900">
                Confirmer votre nouveau créneau
              </h1>
              <p className="mb-8 text-slate-500">
                Cliquez ci-dessous pour valider la replanification de votre
                rendez-vous. Ce lien est valable quelques minutes seulement.
              </p>
              <button
                type="button"
                onClick={() => confirm()}
                disabled={!token}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" />
                Confirmer le nouveau créneau
              </button>
            </div>
          )}

          {isLoading && (
            <div
              className="flex flex-col items-center gap-3"
              data-testid="confirm-loading"
            >
              <Loader2 className="size-8 animate-spin text-cyan-500" />
              <p className="text-sm text-slate-500">
                Confirmation de votre nouveau créneau…
              </p>
            </div>
          )}

          {isError && (
            <div>
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-2 border-red-200 bg-red-50">
                <AlertTriangle className="size-10 text-red-500" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-slate-900">
                Lien invalide ou expiré
              </h1>
              <p className="mb-8 text-slate-500">
                {error instanceof Error
                  ? error.message
                  : "Ce lien de confirmation n'est plus valide. Il a peut-être expiré ou déjà été utilisé."}
              </p>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="size-4" />
                Prendre un nouveau rendez-vous
              </Link>
            </div>
          )}

          {rdv && (
            <div>
              <div className="animate-pop-in mx-auto mb-8 flex size-24 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-50">
                <CheckCircle2 className="size-12 text-emerald-500" />
              </div>

              <h1 className="mb-3 text-3xl font-bold text-slate-900">
                Nouveau créneau confirmé !
              </h1>
              <p className="mb-8 text-slate-500">
                Bonjour{' '}
                <span className="font-semibold text-slate-900">
                  {rdv.patient_prenom} {rdv.patient_nom}
                </span>
                , votre rendez-vous a bien été replanifié.
              </p>

              <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/15 bg-cyan-50">
                    <Calendar className="size-3.5 text-cyan-600" />
                  </div>
                  <div className="flex flex-1 justify-between">
                    <span className="text-sm text-slate-500">Date</span>
                    <span className="text-sm font-medium capitalize text-slate-900">
                      {formatDateFr(rdv.date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/15 bg-cyan-50">
                    <Clock className="size-3.5 text-cyan-600" />
                  </div>
                  <div className="flex flex-1 justify-between">
                    <span className="text-sm text-slate-500">Horaire</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatSlot(rdv.heure_debut)} –{' '}
                      {formatSlot(rdv.heure_fin)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-6 py-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Numéro de rendez-vous
                </p>
                <p className="font-mono text-2xl font-bold tracking-[0.15em] text-cyan-600">
                  {rdv.numero_rdv}
                </p>
              </div>

              <Link
                href="/evenements"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="size-4" />
                Voir les événements de dépistage
              </Link>
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
