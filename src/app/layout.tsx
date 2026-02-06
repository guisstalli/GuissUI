import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppProvider } from './provider';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Guiss',
  description: 'Administration platform for Guistalli',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
