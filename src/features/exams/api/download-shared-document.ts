import { useQuery } from '@tanstack/react-query';

import { env } from '@/config/env';

/**
 * Erreur typée du téléchargement public d'un dossier partagé.
 * `status` porte le code HTTP renvoyé par l'API (404 introuvable, 410 expiré…).
 */
export class SharedDocumentError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SharedDocumentError';
    this.status = status;
  }
}

export interface SharedDocument {
  /** URL objet (blob:) du PDF — à révoquer après usage. */
  blobUrl: string;
  filename: string;
}

/** Extrait le nom de fichier du header Content-Disposition, avec repli. */
function parseFilename(header: string | null): string {
  if (!header) return 'dossier-medical.pdf';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match?.[1] ? decodeURIComponent(match[1]) : 'dossier-medical.pdf';
}

/**
 * Télécharge le PDF du dossier partagé via son token.
 *
 * IMPORTANT : appel PUBLIC — le token EST l'authentification. On utilise `fetch`
 * directement (jamais l'api-client) pour NE PAS envoyer de header Authorization
 * et pour récupérer le corps binaire (l'api-client fait `response.json()`).
 */
export async function fetchSharedDocument(
  token: string,
): Promise<SharedDocument> {
  const response = await fetch(`${env.API_URL}/share/${token}/`, {
    method: 'GET',
    headers: { Accept: 'application/pdf, */*' },
  });

  if (!response.ok) {
    throw new SharedDocumentError(
      response.status === 410
        ? "Ce lien de partage a expiré ou n'est plus valide."
        : response.status === 404
          ? 'Lien de partage introuvable.'
          : 'Une erreur est survenue lors du chargement du dossier.',
      response.status,
    );
  }

  const blob = await response.blob();
  return {
    blobUrl: URL.createObjectURL(blob),
    filename: parseFilename(response.headers.get('Content-Disposition')),
  };
}

export const sharedDocumentQueryKey = (token: string) =>
  ['shared-document', token] as const;

/**
 * Hook public : charge le dossier partagé une seule fois (pas de retry — un lien
 * invalide/expiré ne devient pas valide en réessayant, et chaque accès est
 * comptabilisé côté API).
 */
export const useSharedDocument = (token: string) =>
  useQuery({
    queryKey: sharedDocumentQueryKey(token),
    queryFn: () => fetchSharedDocument(token),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 0,
  });
