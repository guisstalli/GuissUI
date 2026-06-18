import { ArrowLeft, Calendar, CheckCircle2, Clock, Phone } from 'lucide-react';
import Link from 'next/link';

import { PublicShell } from '@/components/public/public-shell';

import type { RendezVousConfirmation } from '../../types/schemas';
import { formatDateFr, formatSlot } from '../../utils/format';

export function ConfirmationPage({
  confirmation,
  wantReminder,
}: {
  confirmation: RendezVousConfirmation;
  wantReminder: boolean;
}) {
  const details = [
    {
      icon: Calendar,
      label: 'Date',
      value: (
        <span className="capitalize">{formatDateFr(confirmation.date)}</span>
      ),
    },
    {
      icon: Clock,
      label: 'Horaire',
      value: `${formatSlot(confirmation.heure_debut)} – ${formatSlot(confirmation.heure_fin)}`,
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: confirmation.patient_phone,
    },
  ];

  return (
    <PublicShell>
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md text-center">
          {/* animated checkmark */}
          <div className="animate-pop-in mx-auto mb-8 flex size-24 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/[0.08]">
            <CheckCircle2 className="size-12 text-emerald-500 dark:text-emerald-400" />
          </div>

          <h2 className="mb-3 text-3xl font-bold text-foreground">
            Rendez-vous confirmé !
          </h2>
          <p className="mb-8 text-muted-foreground">
            Bonjour{' '}
            <span className="font-semibold text-foreground">
              {confirmation.patient_prenom} {confirmation.patient_nom}
            </span>
            , votre consultation a bien été enregistrée.
          </p>

          {/* details card */}
          <div className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-6 text-left">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/15 bg-cyan-50 dark:border-cyan-400/15 dark:bg-cyan-400/[0.08]">
                  <Icon className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex flex-1 justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* RDV number */}
          <div
            className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-6 py-4"
            style={{ boxShadow: '0 0 32px rgba(34,211,238,0.06)' }}
          >
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Numéro de rendez-vous
            </p>
            <p
              className="font-mono text-3xl font-bold tracking-[0.15em] text-cyan-600 dark:text-cyan-400"
              style={{ textShadow: '0 0 24px rgba(34,211,238,0.3)' }}
            >
              {confirmation.numero_rdv}
            </p>
          </div>

          {wantReminder && (
            <p className="mb-8 text-sm text-muted-foreground">
              💬 Un rappel SMS vous sera envoyé avant votre rendez-vous.
            </p>
          )}

          <Link
            href="/evenements"
            className="hover:border-border/60 inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voir les événements de dépistage
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
