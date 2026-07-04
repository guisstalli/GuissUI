'use client';

import { ArrowLeft, CalendarX2, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { PublicShell } from '@/components/public/public-shell';
import { Button } from '@/components/ui/button';
import { useCancelRdvPublic } from '@/features/appointments/api/cancel-rdv-public';

export default function AnnulerRendezVousPage() {
  const params = useParams();
  const token = (params?.token as string) ?? '';
  const [cancelled, setCancelled] = useState(false);

  const {
    mutate: cancelRdv,
    isPending,
    error,
  } = useCancelRdvPublic({
    onSuccess: () => setCancelled(true),
  });

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Ce lien d'annulation n'est plus valide."
        : null;

  return (
    <PublicShell>
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md text-center">
          {cancelled ? (
            <div>
              <div className="animate-pop-in mx-auto mb-8 flex size-24 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-50">
                <CheckCircle2 className="size-12 text-emerald-500" />
              </div>
              <h1 className="mb-3 text-3xl font-bold text-slate-900">
                Rendez-vous annulé
              </h1>
              <p className="mb-8 text-slate-500">
                Votre rendez-vous a bien été annulé. Vous pouvez en reprendre un
                à tout moment.
              </p>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="size-4" />
                Prendre un nouveau rendez-vous
              </Link>
            </div>
          ) : (
            <div>
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-50">
                <CalendarX2 className="size-10 text-amber-500" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-slate-900">
                Annuler votre rendez-vous
              </h1>
              <p className="mb-8 text-slate-500">
                Confirmez-vous l&apos;annulation de votre rendez-vous ? Cette
                action est définitive.
              </p>

              {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={() => cancelRdv(token)}
                  disabled={isPending || !token}
                  className="w-full bg-red-500 font-semibold text-white hover:bg-red-400 sm:w-auto"
                >
                  {isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CalendarX2 className="mr-2 size-4" />
                  )}
                  Confirmer l&apos;annulation
                </Button>
                <Link
                  href="/evenements"
                  className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                >
                  Non, garder mon rendez-vous
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
