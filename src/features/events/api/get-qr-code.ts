import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

import { env } from '@/config/env';

/**
 * Le QR code est servi en PNG par un endpoint protégé JWT côté Django.
 * On le récupère via fetch (avec Authorization: Bearer) puis on convertit
 * en blob URL — l'<img src="blob:..."> n'a pas besoin de headers, donc cela
 * fonctionne dans un <img> classique.
 */
async function fetchQRCodeBlob(eventId: number): Promise<string> {
  const session = await getSession();
  const token = session?.accessToken;
  const res = await fetch(`${env.API_URL}/events/${eventId}/qr-code/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`QR code unavailable (HTTP ${res.status})`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export const useEventQRCode = (eventId: number, enabled = false) =>
  useQuery({
    queryKey: ['events', eventId, 'qr-code'],
    queryFn: () => fetchQRCodeBlob(eventId),
    enabled: enabled && eventId > 0,
    staleTime: 5 * 60 * 1000,
  });
