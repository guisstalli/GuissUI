import { MapPin } from 'lucide-react';
import Link from 'next/link';

import { GuissIcon } from '@/components/ui/logo/guiss-logo';

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-[#040810]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <GuissIcon className="size-11 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-base font-extrabold tracking-wider text-white">
                  GUISS
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-400/70">
                  Ophtalmologie
                </span>
              </div>
            </div>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-slate-400">
              Service de dépistage ophtalmologique de l&apos;Université Iba Der
              Thiam. Des consultations accessibles à tous, gratuitement.
            </p>
            <div className="flex items-start gap-2 text-sm text-slate-500">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-cyan-400/50" />
              <span>Université Iba Der Thiam · Thiès, Sénégal</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/70">
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/evenements', label: 'Événements de dépistage' },
                { href: '/rendez-vous', label: 'Prendre un rendez-vous' },
                { href: '/auth/login', label: 'Espace professionnel' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/70">
              À propos
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Initiative portée par le service d&apos;ophtalmologie de
              l&apos;UIDT dans le cadre du programme national de santé visuelle.
            </p>
            <p className="text-sm text-slate-500">
              Consultations{' '}
              <span className="font-semibold text-emerald-400">
                100% gratuites
              </span>{' '}
              · Sans compte requis
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-slate-600 sm:flex-row">
          <p>
            © {year} GUISS Ophtalmologie · Kamal Moustoifa · Université Iba Der
            Thiam
          </p>
          <div className="flex gap-5">
            <Link
              href="/evenements"
              className="transition-colors hover:text-slate-400"
            >
              Événements
            </Link>
            <Link
              href="/rendez-vous"
              className="transition-colors hover:text-slate-400"
            >
              Rendez-vous
            </Link>
            <Link
              href="/auth/login"
              className="transition-colors hover:text-slate-400"
            >
              Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
