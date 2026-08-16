import type { Metadata } from 'next';

// Page publique à token exposant un dossier médical (PHI) : NE JAMAIS indexer
// ni suivre. Empêche l'apparition d'un dossier patient dans un moteur de
// recherche même si un token venait à fuiter dans un lien partagé.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function DossierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
