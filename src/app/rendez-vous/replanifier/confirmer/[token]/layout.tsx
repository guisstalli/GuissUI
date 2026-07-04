import type { Metadata } from 'next';

// Page publique à token confirmant une replanification (identité patient +
// nouveau créneau) : NE JAMAIS indexer ni suivre.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function ConfirmerReplanificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
