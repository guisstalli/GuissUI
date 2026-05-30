'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { GuissIcon } from '@/components/ui/logo/guiss-logo';
import { cn } from '@/lib/utils';

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isEvents =
    pathname === '/evenements' || pathname?.startsWith('/evenements/');
  const isBooking = pathname === '/rendez-vous';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/[0.06] bg-[#060b17]/90 shadow-[0_1px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4 sm:px-6">
        {/* Logo */}
        <Link href="/evenements" className="group flex items-center gap-3">
          <div className="relative">
            <GuissIcon className="size-9 shrink-0" />
            <div className="absolute inset-0 rounded-full bg-cyan-400/0 blur-md transition-all duration-300 group-hover:bg-cyan-400/20" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-extrabold tracking-wider text-white">
              GUISS
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-400/70">
              Ophtalmologie
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/evenements"
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all',
              isEvents
                ? 'bg-black/[0.08] text-slate-900 dark:bg-white/[0.08] dark:text-white'
                : 'text-slate-500 hover:bg-black/[0.06] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white',
            )}
          >
            Événements
          </Link>
          <Link
            href="/rendez-vous"
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
              isBooking
                ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] dark:bg-cyan-400 dark:text-slate-900'
                : 'bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] dark:bg-cyan-400 dark:text-slate-900 dark:hover:bg-cyan-300',
            )}
          >
            Prendre RDV
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-black/[0.06] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#060b17] md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="/evenements"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-black/[0.06] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Événements de dépistage
            </Link>
            <Link
              href="/rendez-vous"
              className="rounded-lg bg-cyan-500/10 px-3 py-2.5 text-sm font-semibold text-cyan-600 transition-colors hover:bg-cyan-500/20 dark:bg-cyan-400/10 dark:text-cyan-400 dark:hover:bg-cyan-400/20"
              onClick={() => setMobileOpen(false)}
            >
              Prendre un rendez-vous
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-black/[0.06] hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-slate-300"
              onClick={() => setMobileOpen(false)}
            >
              Espace professionnel →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
