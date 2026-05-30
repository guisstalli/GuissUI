import { useQuery } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { useCallback, useEffect, useRef } from 'react';

import { env } from '@/config/env';
import { downloadPdf } from '@/utils/download-pdf';

/**
 * Fetches the PDF for a given facture as a Blob and returns a managed
 * object URL string. Throws if the response is not OK.
 *
 * The returned object URL MUST be revoked by the caller via
 * URL.revokeObjectURL when no longer needed.
 */
export async function getFacturePdfBlob(factureId: number): Promise<string> {
  const session = await getSession();
  const token = session?.accessToken ?? null;

  const response = await fetch(
    `${env.API_URL}/billing/factures/${factureId}/pdf/`,
    {
      headers: {
        Accept: 'application/pdf',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`Erreur chargement PDF (${response.status})`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export const facturePdfQueryKey = (factureId: number) =>
  ['factures', factureId, 'pdf'] as const;

type UseFacturePdfBlobResult = {
  objectUrl: string | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Imperatively fetches the PDF blob for a facture as an object URL.
 *
 * - Triggered when `factureId` is set AND `enabled !== false`.
 * - The generated PDF is treated as stable until the underlying facture
 *   is mutated — `staleTime: Infinity` avoids needless re-fetches.
 * - The created object URL is revoked on unmount and whenever a new
 *   URL replaces it (factureId change or refetch).
 */
export function useFacturePdfBlob(
  factureId: number | null | undefined,
  options: { enabled?: boolean } = {},
): UseFacturePdfBlobResult {
  const { enabled = true } = options;
  const id = factureId ?? null;
  const isEnabled = enabled && id !== null;

  const query = useQuery({
    queryKey: id !== null ? facturePdfQueryKey(id) : ['factures', 'pdf', null],
    queryFn: () => getFacturePdfBlob(id as number),
    enabled: isEnabled,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Track the latest object URL so we can revoke it on cleanup or replacement.
  const currentUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const next = query.data;
    const previous = currentUrlRef.current;

    if (previous && previous !== next) {
      URL.revokeObjectURL(previous);
    }

    currentUrlRef.current = next;
  }, [query.data]);

  // Revoke on unmount.
  useEffect(() => {
    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = undefined;
      }
    };
  }, []);

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    objectUrl: query.data,
    isLoading: query.isLoading || query.isFetching,
    error: (query.error as Error) ?? null,
    refetch,
  };
}

type UseDownloadFacturePdfResult = {
  download: (factureId: number, numero: string) => Promise<void>;
};

/**
 * Imperative hook that triggers a PDF download for a facture using the
 * shared `downloadPdf` utility (which handles auth + Accept headers).
 */
export function useDownloadFacturePdf(): UseDownloadFacturePdfResult {
  const download = useCallback(
    async (factureId: number, numero: string): Promise<void> => {
      await downloadPdf(
        `/billing/factures/${factureId}/pdf/`,
        `facture-${numero}.pdf`,
        { method: 'GET' },
      );
    },
    [],
  );

  return { download };
}
