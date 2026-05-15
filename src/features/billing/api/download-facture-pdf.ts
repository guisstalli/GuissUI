import { getSession } from 'next-auth/react';

import { env } from '@/config/env';

export async function downloadFacturePdf(
  factureId: number,
  numero: string,
): Promise<void> {
  const session = await getSession();
  const token = session?.accessToken ?? null;

  const response = await fetch(
    `${env.API_URL}/billing/factures/${factureId}/pdf/`,
    {
      headers: {
        Accept: 'application/pdf',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Erreur téléchargement PDF : ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `facture-${numero}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
