import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { AppProvider } from './provider';

import '@/styles/globals.css';

const geist = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Guiss',
  description: 'Administration platform for Guistalli',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn('font-sans', geist.variable)}
    >
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
