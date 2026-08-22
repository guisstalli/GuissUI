import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { estHoteVitrine } from '@/lib/vitrine';

import { AppProvider } from './provider';

import '@/styles/globals.css';

const geist = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Guiss',
  description: 'Administration platform for Guistalli',
};

/**
 * L'hote est lu ICI, au rendu SERVEUR, et descendu jusqu'a InternalAppGuard.
 *
 * Pourquoi pas `window.location` dans la garde : elle est cliente, donc le
 * serveur rendrait l'ecran de connexion et le client la vitrine — un ecart
 * d'hydratation, et un clignotement sur une page publique. Lu ici, les deux
 * rendus partagent la meme valeur.
 *
 * Cout assume : `headers()` rend ce layout dynamique. L'application est de
 * toute facon derriere une session, donc le rendu statique n'y apportait rien.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  const hoteVitrine = estHoteVitrine(headers().get('host'));

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn('font-sans', geist.variable)}
    >
      <body>
        <AppProvider hoteVitrine={hoteVitrine}>{children}</AppProvider>
      </body>
    </html>
  );
}
