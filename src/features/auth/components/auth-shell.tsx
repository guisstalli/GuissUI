import { type ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function CornerOrnament({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base = 'pointer-events-none absolute h-24 w-24 opacity-60';
  const placements: Record<typeof position, string> = {
    tl: 'left-6 top-6 border-l border-t',
    tr: 'right-6 top-6 border-r border-t',
    bl: 'left-6 bottom-6 border-l border-b',
    br: 'right-6 bottom-6 border-r border-b',
  };

  return (
    <div
      aria-hidden
      className={cn(base, placements[position], 'border-cyan-400/30')}
    >
      <span className="absolute -left-1 -top-1 block size-2 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      <span className="absolute -bottom-1 -right-1 block size-2 rounded-full bg-cyan-400/40" />
      <span className="absolute left-3 top-3 block size-1 rounded-full bg-cyan-400/60" />
      <span className="absolute bottom-3 right-3 block size-1 rounded-full bg-blue-400/60" />
    </div>
  );
}

function GuissLogo() {
  return (
    <div className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_24px_rgba(34,211,238,0.45)]">
      <span className="text-2xl font-black tracking-tight text-white">G</span>
      <span className="absolute inset-0 rounded-full ring-1 ring-cyan-300/40" />
    </div>
  );
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-slate-100">
      {/* Ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.10),transparent_45%)]"
      />

      {/* Grid pattern */}
      <div
        aria-hidden
        // eslint-disable-next-line tailwindcss/no-contradicting-classname
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_0_64px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            <div className="space-y-6">
              <div className="space-y-3 text-center">
                <GuissLogo />
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-slate-400">{subtitle}</p>
                )}
              </div>

              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
