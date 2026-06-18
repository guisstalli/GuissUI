import { PublicFooter } from './public-footer';
import { PublicNavbar } from './public-navbar';

interface PublicShellProps {
  children: React.ReactNode;
  /** Pass true when the page manages its own top padding (hero pages) */
  fullBleed?: boolean;
}

/**
 * Public shell — thème clair (light) pour les pages publiques rendez-vous
 * et événements. Le fond est clair et lisible ; les dégradés ambiants sont
 * adoucis (teinte cyan/bleue très légère) plutôt que sombres.
 */
export function PublicShell({ children, fullBleed = false }: PublicShellProps) {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      {/* Ambient radial gradients — version claire, subtile */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse at 15% 20%, rgba(14,165,233,0.07) 0%, transparent 50%)',
            'radial-gradient(ellipse at 85% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)',
          ].join(', '),
        }}
      />

      {/* Repeating grid texture — atténuée en clair */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/grid.svg')] opacity-30"
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
