import { getSession } from 'next-auth/react';

import { env } from '@/config/env';

export async function downloadPdf(
  apiPath: string,
  filename: string,
  options: { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<void> {
  const session = await getSession();
  const { method = 'GET', body } = options;

  const response = await fetch(`${env.API_URL}${apiPath}`, {
    method,
    headers: {
      Accept: 'application/pdf',
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Échec du téléchargement (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
