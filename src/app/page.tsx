'use client';

import {
  ArrowRight,
  Baby,
  CalendarCheck,
  Eye,
  GraduationCap,
  HeartHandshake,
  MapPin,
  ScanEye,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

import { PublicShell } from '@/components/public/public-shell';
import { cn } from '@/lib/utils';

/**
 * Landing publique de Guiss-Talli — Centre de Promotion de la Vision
 * Madoune Robert Ndiaye (UFR Santé, Université Iba Der Thiam de Thiès).
 * Racine du site (exigence Meta/WhatsApp Business : URL publique).
 * Direction : éditorial clinique-humaniste, prolonge le langage des pages
 * publiques (fond clair, accents cyan, ornements de coin, kickers espacés).
 */

function CornerOrnament({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute size-12', className)}
      aria-hidden
    >
      <div className="absolute left-0 top-0 h-px w-8 bg-slate-900/20" />
      <div className="absolute left-0 top-0 h-8 w-px bg-slate-900/20" />
      <div className="absolute left-1.5 top-1.5 size-1.5 rounded-full bg-cyan-500/70" />
    </div>
  );
}

const SERVICES = [
  {
    icon: Eye,
    title: 'Dépistage adulte',
    description:
      'Acuité visuelle, tension oculaire, réfraction et examen du fond d’œil — un bilan complet de votre santé visuelle.',
  },
  {
    icon: Baby,
    title: 'Dépistage enfant',
    description:
      'Détection précoce des troubles de la vue chez l’enfant, pour un développement scolaire sans obstacle.',
  },
  {
    icon: Truck,
    title: 'Aptitude visuelle des conducteurs',
    description:
      'Qualification médicale de la vue des conducteurs professionnels, au service de la sécurité routière.',
  },
] as const;

const STEPS = [
  {
    number: '01',
    title: 'Choisissez votre créneau',
    description:
      'Réservez en ligne en deux minutes, ou inscrivez-vous à l’une de nos campagnes de dépistage gratuites.',
  },
  {
    number: '02',
    title: 'Venez au centre',
    description:
      'Notre équipe universitaire vous accueille et réalise l’examen — sans ordonnance, sans démarche préalable.',
  },
  {
    number: '03',
    title: 'Repartez informé',
    description:
      'Vos résultats vous sont expliqués sur place, avec une orientation claire si un suivi est nécessaire.',
  },
] as const;

export default function LandingPage() {
  return (
    <PublicShell fullBleed>
      {/* Séquence de révélation sobre — désactivée si reduced-motion */}
      <style>{`
        @keyframes landing-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .landing-rise { animation: landing-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .landing-rise { animation: none; }
        }
      `}</style>

      {/* ── Hero ── */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden px-4 pb-16 pt-[120px] sm:px-8 sm:pb-24 sm:pt-[150px]"
      >
        <CornerOrnament className="left-4 top-24 hidden sm:block" />
        <CornerOrnament className="right-4 top-24 hidden rotate-90 sm:block" />

        <div className="mx-auto max-w-5xl">
          <p
            className="landing-rise text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700"
            style={{ animationDelay: '0ms' }}
          >
            Centre de Promotion de la Vision · UIDT Thiès · Sénégal
          </p>

          <h1
            id="hero-heading"
            className="landing-rise mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl"
            style={{ animationDelay: '90ms' }}
          >
            La santé de vos yeux,
            <br />
            <span className="text-cyan-600">notre mission.</span>
          </h1>

          <p
            className="landing-rise mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
            style={{ animationDelay: '180ms' }}
          >
            Le centre vision Madoune Robert Ndiaye organise des dépistages
            ophtalmologiques{' '}
            <strong className="text-slate-900">gratuits</strong>, portés par
            l’UFR Santé de l’Université Iba Der Thiam de Thiès. Adultes,
            enfants, conducteurs — prenez soin de votre vue.
          </p>

          <div
            className="landing-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: '270ms' }}
          >
            <Link
              href="/public/rendez-vous"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              <CalendarCheck className="size-4" aria-hidden />
              Prendre rendez-vous
            </Link>
            <Link
              href="/public/evenements"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/70 px-7 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:border-cyan-400 hover:text-cyan-700"
            >
              Voir les campagnes de dépistage
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <p
            className="landing-rise mt-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-400"
            style={{ animationDelay: '360ms' }}
          >
            Gratuit · Sans ordonnance · Ouvert à tous
          </p>
        </div>

        {/* Motif œil — grand cercle décoratif décalé (composition asymétrique) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-16 hidden size-[420px] rounded-full border border-cyan-200/60 lg:block"
        >
          <div className="absolute inset-10 rounded-full border border-cyan-200/40" />
          <div className="absolute inset-24 rounded-full border border-cyan-300/40" />
          <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10" />
          <ScanEye className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-cyan-600/70" />
        </div>
      </section>

      {/* ── Bandeau de confiance ── */}
      <section aria-label="Nos engagements" className="px-4 sm:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
          {[
            { icon: HeartHandshake, label: 'Dépistages gratuits' },
            { icon: GraduationCap, label: 'Équipe universitaire' },
            { icon: ShieldCheck, label: 'Adultes & enfants' },
            { icon: Truck, label: 'Vue des conducteurs' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white px-5 py-4"
            >
              <Icon className="size-5 shrink-0 text-cyan-600" aria-hidden />
              <span className="text-sm font-medium text-slate-800">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section
        aria-labelledby="services-heading"
        className="px-4 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Ce que nous faisons
          </p>
          <h2
            id="services-heading"
            className="mt-3 max-w-lg text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Un dépistage pour chaque regard
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className={cn(
                  'relative rounded-2xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-lg hover:shadow-cyan-100',
                  index === 1 && 'md:translate-y-6', // rupture de grille volontaire
                )}
              >
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-cyan-50">
                  <Icon className="size-5 text-cyan-600" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section
        aria-labelledby="steps-heading"
        className="border-y border-slate-200 bg-white/60 px-4 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Simple et rapide
          </p>
          <h2
            id="steps-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Comment ça marche
          </h2>

          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map(({ number, title, description }) => (
              <li key={number} className="relative">
                <span
                  aria-hidden
                  className="text-5xl font-bold tracking-tight text-cyan-100"
                >
                  {number}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Le centre ── */}
      <section
        aria-labelledby="centre-heading"
        className="px-4 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Qui sommes-nous
            </p>
            <h2
              id="centre-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Un centre universitaire au service de la vision
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Le Centre de Promotion de la Vision Madoune Robert Ndiaye est
              porté par l’UFR Santé de l’Université Iba Der Thiam de Thiès. Sa
              mission : rendre le dépistage visuel accessible à tous — au centre
              comme sur le terrain, lors de campagnes organisées dans les
              écoles, les entreprises et les communautés.
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <MapPin
                className="mt-0.5 size-5 shrink-0 text-cyan-600"
                aria-hidden
              />
              <p className="text-sm text-slate-700">
                UFR Santé — Université Iba Der Thiam,
                <br />
                Thiès, Sénégal
              </p>
            </div>
          </div>

          {/* Panneau éditorial — citation-mission */}
          <figure className="relative rounded-3xl bg-slate-900 p-8 text-white sm:p-10">
            <CornerOrnament className="left-3 top-3 [&>div:last-child]:bg-cyan-400/80 [&>div]:bg-white/30" />
            <blockquote className="text-xl font-medium leading-snug sm:text-2xl">
              « Une mauvaise vue non dépistée, c’est une scolarité freinée, un
              métier fragilisé, une route plus dangereuse. »
            </blockquote>
            <figcaption className="mt-6 text-sm text-slate-300">
              La raison d’être de nos dépistages gratuits.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section aria-label="Prendre rendez-vous" className="px-4 pb-24 sm:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 to-sky-700 px-8 py-14 text-center sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] opacity-10"
          />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Votre vue mérite deux minutes.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-cyan-50">
            Réservez votre créneau de dépistage gratuit dès maintenant.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/public/rendez-vous"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition-transform hover:scale-[1.03]"
            >
              <CalendarCheck className="size-4" aria-hidden />
              Prendre rendez-vous
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-cyan-100 underline-offset-4 hover:underline"
            >
              Accès personnel du centre
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
