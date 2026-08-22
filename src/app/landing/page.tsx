import type { Metadata } from 'next';

import { PublicShell } from '@/components/public/public-shell';
import { Hero } from '@/features/landing/components/hero';
import { PlateauTechnique } from '@/features/landing/components/plateau-technique';
import { SecuriteRoutiere } from '@/features/landing/components/securite-routiere';
import { CENTRE } from '@/features/landing/utils/contenu';

export const metadata: Metadata = {
  title: `${CENTRE.nom} — dépistage ophtalmologique à Thiès`,
  description:
    'Dépistages ophtalmologiques gratuits pour adultes, enfants et conducteurs. ' +
    "Centre de Vision Madoune Robert Ndiaye, UFR Santé de l'Université Iba Der Thiam de Thiès.",
  openGraph: {
    title: CENTRE.nom,
    description:
      'Un conducteur peut lire 10/10 et avoir un champ visuel amputé sans le savoir. Dépistage gratuit à Thiès.',
    locale: 'fr_SN',
    type: 'website',
  },
};

/**
 * Vitrine publique du CVMRN — servie sur guisstalli.com.
 *
 * Direction : ÉDITORIAL CLINIQUE. Fond clair, accent cyan, hiérarchie portée
 * par l'échelle typographique plutôt que par des cartes. Une seule inversion
 * de contraste, sur le programme sécurité routière, et un seul moment animé,
 * le relevé de champ visuel — mis en scène parce qu'il dit ce que le centre
 * fait, non parce qu'une animation était facile à ajouter.
 *
 * Rendu côté SERVEUR : seuls les composants qui observent le défilement sont
 * clients. Le texte et les liens sont donc dans le HTML initial — ce qui
 * compte pour le référencement et pour un premier affichage rapide sur une
 * connexion mobile.
 */
export default function LandingPage() {
  return (
    <PublicShell fullBleed>
      <Hero />
      <SecuriteRoutiere />
      <PlateauTechnique />
    </PublicShell>
  );
}
