import type { Metadata } from 'next';

// Page publique à token affichant les données d'un rendez-vous patient
// (identité, créneau) : NE JAMAIS indexer ni suivre.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AnnulerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
