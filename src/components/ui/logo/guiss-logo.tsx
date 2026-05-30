'use client';

import React from 'react';

import { cn } from '@/utils/cn';

interface GuissIconProps {
  className?: string;
}

// ─── Shared icon internals ──────────────────────────────────────────────────
// Renders the icon elements using pre-resolved def IDs.
// Used by both GuissIcon and GuissLogo so they share identical anatomy.
function IconDefs({ id }: { id: string }) {
  return (
    <defs>
      {/* Background: teal-900 → blue-900 → deep navy, diagonal */}
      <linearGradient id={`${id}a`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0e7490" />
        <stop offset="48%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#060d2e" />
      </linearGradient>

      {/* Iris: off-centre radial, upper-left light source */}
      <radialGradient
        id={`${id}b`}
        cx="38%"
        cy="30%"
        r="70%"
        gradientUnits="objectBoundingBox"
      >
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="22%" stopColor="#0ea5e9" />
        <stop offset="55%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#0c1445" />
      </radialGradient>

      {/* Eyelid shadow: top-to-bottom subtle darkening on upper sclera */}
      <linearGradient id={`${id}c`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" stopOpacity="0.22" />
        <stop offset="50%" stopColor="#0f172a" stopOpacity="0" />
      </linearGradient>

      {/* Glow filter: blur source alpha → flood cyan → merge with graphic */}
      <filter id={`${id}f`} x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
        <feFlood floodColor="#22d3ee" floodOpacity="0.45" result="flood" />
        <feComposite in="flood" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Crescent mask: outer circle minus offset inner circle = crescent */}
      <mask id={`${id}m`}>
        <circle cx="28" cy="28" r="3.8" fill="white" />
        <circle cx="30.2" cy="28" r="3.1" fill="black" />
      </mask>

      {/* Iris clip path for fiber lines */}
      <clipPath id={`${id}k`}>
        <circle cx="28" cy="28" r="10.5" />
      </clipPath>
    </defs>
  );
}

function IconBody({ id }: { id: string }) {
  // 16 radial iris fiber lines from centre to iris edge
  const irisFibers = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `M 28 28 L ${(28 + Math.cos(a) * 10.5).toFixed(2)} ${(28 + Math.sin(a) * 10.5).toFixed(2)}`;
  }).join(' ');

  // Cardinal tick marks on measurement ring (0 / 90 / 180 / 270 °)
  const ticks = [0, 90, 180, 270].map((deg) => {
    const a = (deg / 180) * Math.PI;
    return {
      x1: (28 + Math.cos(a) * 23.5).toFixed(2),
      y1: (28 + Math.sin(a) * 23.5).toFixed(2),
      x2: (28 + Math.cos(a) * 26).toFixed(2),
      y2: (28 + Math.sin(a) * 26).toFixed(2),
    };
  });

  const scleraPath =
    'M 9 28 C 12 16 19.5 10.5 28 10.5 C 36.5 10.5 44 16 47 28 C 44 40 36.5 45.5 28 45.5 C 19.5 45.5 12 40 9 28 Z';

  return (
    <>
      {/* ── Background ─────────────────────────────────────────────── */}
      <circle cx="28" cy="28" r="28" fill={`url(#${id}a)`} />
      {/* Ambient radial overlay, upper-left warm spot */}
      <circle cx="22" cy="20" r="22" fill="#22d3ee" fillOpacity="0.05" />

      {/* ── Outer measurement ring + cardinal ticks + scan arcs ──── */}
      <circle
        cx="28"
        cy="28"
        r="25.5"
        stroke="#22d3ee"
        strokeWidth="0.8"
        strokeOpacity="0.20"
        fill="none"
      />
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#22d3ee"
          strokeWidth="1"
          strokeOpacity="0.40"
        />
      ))}
      {/* Balanced scan arcs: top-right + bottom-left */}
      <path
        d="M 41 8 A 23.5 23.5 0 0 1 51.5 28"
        stroke="#22d3ee"
        strokeWidth="1.2"
        strokeOpacity="0.38"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 15 48 A 23.5 23.5 0 0 1 4.5 28"
        stroke="#22d3ee"
        strokeWidth="1.2"
        strokeOpacity="0.38"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Eye sclera ─────────────────────────────────────────────── */}
      {/* White almond with real SVG cyan glow */}
      <path
        d={scleraPath}
        fill="white"
        fillOpacity="0.96"
        filter={`url(#${id}f)`}
      />
      {/* Upper eyelid shadow overlay */}
      <path d={scleraPath} fill={`url(#${id}c)`} />

      {/* ── Limbal ring: dark border at iris/sclera boundary ──────── */}
      <circle cx="28" cy="28" r="11.4" fill="#0a1535" />

      {/* ── Iris ───────────────────────────────────────────────────── */}
      <circle cx="28" cy="28" r="10.5" fill={`url(#${id}b)`} />

      {/* Iris radial fiber texture (clipped to iris disc) */}
      <g clipPath={`url(#${id}k)`} opacity="0.15">
        <path d={irisFibers} stroke="white" strokeWidth="0.35" fill="none" />
      </g>

      {/* Collarette ring at 65 % of iris radius */}
      <circle
        cx="28"
        cy="28"
        r="6.8"
        stroke="#93c5fd"
        strokeWidth="0.5"
        strokeOpacity="0.30"
        fill="none"
      />

      {/* ── Pupil ──────────────────────────────────────────────────── */}
      <circle cx="28" cy="28" r="5.2" fill="#030712" />

      {/* ── Crescent — Sénégal reference ───────────────────────────── */}
      {/* Proper crescent: outer circle masked by offset inner circle */}
      <circle cx="28" cy="28" r="3.8" fill="#22d3ee" mask={`url(#${id}m)`} />

      {/* ── Specular highlights (upper-left light source) ──────────── */}
      <circle cx="32.5" cy="20" r="2.1" fill="white" fillOpacity="0.88" />
      <circle cx="35.2" cy="17.5" r="0.85" fill="white" fillOpacity="0.50" />

      {/* Subtle corneal lower-sclera reflection */}
      <path
        d="M 23 41.5 Q 28 44 33 41.5"
        stroke="white"
        strokeWidth="0.55"
        strokeOpacity="0.12"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

// ─── GuissIcon ───────────────────────────────────────────────────────────────
export function GuissIcon({ className }: GuissIconProps) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <IconDefs id={id} />
      <IconBody id={id} />
    </svg>
  );
}

// ─── GuissIconMono ───────────────────────────────────────────────────────────
// Single-colour outline variant — for invoices, print, and dark-on-light contexts.
// Fill with `currentColor` via CSS / className.
interface GuissIconMonoProps {
  className?: string;
}

export function GuissIconMono({ className }: GuissIconMonoProps) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Outer ring */}
      <circle
        cx="28"
        cy="28"
        r="26"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeOpacity="0.6"
      />
      {/* Scan arc top-right */}
      <path
        d="M 41 8 A 23.5 23.5 0 0 1 51.5 28"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      {/* Eye almond */}
      <path
        d="M 9 28 C 12 16 19.5 10.5 28 10.5 C 36.5 10.5 44 16 47 28 C 44 40 36.5 45.5 28 45.5 C 19.5 45.5 12 40 9 28 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Iris ring */}
      <circle
        cx="28"
        cy="28"
        r="10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Collarette */}
      <circle
        cx="28"
        cy="28"
        r="6.8"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        strokeOpacity="0.5"
      />
      {/* Pupil */}
      <circle cx="28" cy="28" r="5.2" fill="currentColor" />
    </svg>
  );
}

// ─── GuissLogo (icon + wordmark) ─────────────────────────────────────────────
interface GuissLogoProps {
  className?: string;
  showTagline?: boolean;
}

export function GuissLogo({ className, showTagline = true }: GuissLogoProps) {
  const id = React.useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 228 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GUISS Ophtalmologie"
      className={className}
    >
      <defs>
        {/* Re-declare all icon defs with the wordmark-scoped id */}
        <linearGradient id={`${id}a`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="48%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#060d2e" />
        </linearGradient>
        <radialGradient
          id={`${id}b`}
          cx="38%"
          cy="30%"
          r="70%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="22%" stopColor="#0ea5e9" />
          <stop offset="55%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0c1445" />
        </radialGradient>
        <linearGradient id={`${id}c`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#0f172a" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}f`} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
          <feFlood floodColor="#22d3ee" floodOpacity="0.45" result="flood" />
          <feComposite in="flood" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <mask id={`${id}m`}>
          <circle cx="28" cy="28" r="3.8" fill="white" />
          <circle cx="30.2" cy="28" r="3.1" fill="black" />
        </mask>
        <clipPath id={`${id}k`}>
          <circle cx="28" cy="28" r="10.5" />
        </clipPath>
        {/* Horizontal gradient for "GUISS" wordmark */}
        <linearGradient id={`${id}tg`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>

      {/* Icon shifted down 8 px for vertical centering in the 72-unit tall canvas */}
      <g transform="translate(0, 8)">
        <IconBody id={id} />
      </g>

      {/* ── Wordmark ─────────────────────────────────────────────── */}
      <text
        x="68"
        y="33"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontSize="23"
        fontWeight="800"
        letterSpacing="3"
        fill={`url(#${id}tg)`}
      >
        GUISS
      </text>
      <text
        x="69"
        y="53"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontSize="13"
        fontWeight="500"
        letterSpacing="5"
        fill="#60a5fa"
        fillOpacity="0.80"
      >
        TALLI
      </text>
      {showTagline && (
        <text
          x="69.5"
          y="67"
          fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
          fontSize="7"
          fontWeight="400"
          letterSpacing="2"
          fill="#64748b"
        >
          OPHTALMOLOGIE
        </text>
      )}
    </svg>
  );
}

// ─── GuissSidebarLogo ────────────────────────────────────────────────────────
interface GuissSidebarLogoProps {
  collapsed?: boolean;
  className?: string;
}

export function GuissSidebarLogo({
  collapsed = false,
  className,
}: GuissSidebarLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <GuissIcon className="size-8 shrink-0" />
      {!collapsed && (
        <div className="flex flex-col gap-0 leading-none">
          <span className="text-sm font-bold tracking-wider text-foreground">
            GUISS
          </span>
          <span className="text-[10px] font-medium tracking-widest text-cyan-500">
            TALLI
          </span>
        </div>
      )}
    </div>
  );
}
