import { PublicFooter } from './public-footer';
import { PublicNavbar } from './public-navbar';

interface PublicShellProps {
  children: React.ReactNode;
  /** Pass true when the page manages its own top padding (hero pages) */
  fullBleed?: boolean;
}

/**
 * Public shell — premium dark theme regardless of the user's app theme.
 * The public booking/events design is dark-first (text-white, white/[0.06]
 * borders, etc.); rendering it on light backgrounds makes most copy
 * unreadable. The `dark` class scopes Tailwind's `dark:` variants to this
 * subtree so all `dark:` rules apply even when the rest of the app uses
 * the light theme.
 */
export function PublicShell({ children, fullBleed = false }: PublicShellProps) {
  return (
    <div className="dark relative min-h-screen bg-[#060b17] text-slate-100">
      {/* Ambient radial gradients */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse at 15% 20%, rgba(34,211,238,0.06) 0%, transparent 50%)',
            'radial-gradient(ellipse at 85% 80%, rgba(59,130,246,0.05) 0%, transparent 50%)',
          ].join(', '),
        }}
      />

      {/* Repeating grid texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/grid.svg')] opacity-100"
      />

      {/* Page content */}
      <div
        className={`relative z-10 flex min-h-screen flex-col ${fullBleed ? '' : 'pt-[72px]'}`}
      >
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </div>
  );
}
