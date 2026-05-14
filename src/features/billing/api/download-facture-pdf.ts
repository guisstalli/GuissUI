import { clientEnv } from '@/config/env';

/**
 * Fetches the PDF for a facture and triggers a browser download.
 * Uses fetch with the session token so auth cookies are forwarded.
 */
export async function downloadFacturePdf(
  factureId: number,
  numero: string,
): Promise<void> {
  const url = `${clientEnv.API_URL}/billing/factures/${factureId}/pdf/`;

  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(
      `Impossible de télécharger la facture (${response.status})`,
    );
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
