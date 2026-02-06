import { getSession, signOut } from 'next-auth/react';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';
import { extractErrorMessage, extractErrorTitle } from '@/types/api';

type ParamValue = string | number | boolean | undefined | null;

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  cookie?: string;
  params?: Record<string, ParamValue>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  accessToken?: string;
  isFormData?: boolean;
  /** Si true, ne pas afficher de toast pour les erreurs */
  silentErrors?: boolean;
  /** Codes de statut HTTP à ignorer silencieusement (retourne l'erreur sans toast) */
  silentStatusCodes?: number[];
};

/**
 * Construit une URL avec les query params pour l'API Django
 * Gère correctement les booléens, les valeurs undefined/null, et les chaînes vides
 */
function buildUrlWithParams(
  url: string,
  params?: RequestOptions['params'],
): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // Ignorer undefined, null et chaînes vides
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Convertir les booléens en string
    if (typeof value === 'boolean') {
      searchParams.set(key, value.toString());
    } else {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  if (!queryString) return url;

  return `${url}?${queryString}`;
}

// Get access token from next-auth session (client-side)
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const session = await getSession();

  // Check if session has an error (e.g., RefreshAccessTokenError)
  if (session?.error === 'RefreshAccessTokenError') {
    // Token refresh failed, sign out the user and redirect to Keycloak
    await signOut({ callbackUrl: '/api/auth/signin/keycloak' });
    return null;
  }

  return session?.accessToken ?? null;
}

// Create a separate function for getting server-side cookies that can be imported where needed
export function getServerCookies() {
  if (typeof window !== 'undefined') return '';

  // Dynamic import next/headers only on server-side
  return import('next/headers').then(({ cookies }) => {
    try {
      const cookieStore = cookies();
      return cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');
    } catch (error) {
      console.error('Failed to access cookies:', error);
      return '';
    }
  });
}

// Handle 401 Unauthorized errors - redirect to Keycloak
async function handleUnauthorized() {
  if (typeof window !== 'undefined') {
    useNotifications.getState().addNotification({
      type: 'error',
      title: 'Session expirée',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
    });
    // Sign out and redirect directly to Keycloak
    await signOut({ callbackUrl: '/api/auth/signin/keycloak' });
  }
}

// Custom error class with status
class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Handle API errors and extract error message
async function handleApiError(
  response: Response,
  silent = false,
): Promise<never> {
  let message = response.statusText;
  let title = 'Erreur';

  try {
    const errorData = await response.json();

    // Utiliser les fonctions d'extraction pour parser l'erreur
    message = extractErrorMessage(errorData);
    title = extractErrorTitle(errorData, response.status);
  } catch {
    // If we can't parse the error, use statusText
  }

  // Only show notification if not silent
  if (!silent && typeof window !== 'undefined') {
    useNotifications.getState().addNotification({
      type: 'error',
      title,
      message,
    });
  }

  throw new ApiError(message, response.status);
}

async function fetchApi<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    cookie,
    params,
    cache = 'no-store',
    next,
    accessToken: providedToken,
    isFormData = false,
    silentErrors = false,
    silentStatusCodes = [],
  } = options;

  // Get cookies from the request when running on server
  let cookieHeader = cookie;
  if (typeof window === 'undefined' && !cookie) {
    cookieHeader = await getServerCookies();
  }

  // Get access token for Authorization header
  const accessToken = providedToken ?? (await getAccessToken());

  const fullUrl = buildUrlWithParams(`${env.API_URL}${url}`, params);

  // Prepare headers - don't set Content-Type for FormData (browser will set it with boundary)
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...headers,
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };

  // Only set Content-Type for non-FormData requests
  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(fullUrl, {
    method,
    headers: requestHeaders,
    body: isFormData
      ? (body as BodyInit)
      : body
        ? JSON.stringify(body)
        : undefined,
    credentials: 'include',
    cache,
    next,
  });

  // Handle 401 Unauthorized - redirect to Keycloak
  if (response.status === 401) {
    await handleUnauthorized();
    throw new Error('Unauthorized');
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    if (typeof window !== 'undefined') {
      useNotifications.getState().addNotification({
        type: 'error',
        title: 'Accès refusé',
        message:
          "Vous n'avez pas les permissions nécessaires pour cette action.",
      });
    }
    throw new Error('Forbidden');
  }

  // Handle other errors
  if (!response.ok) {
    // Check if this status code should be handled silently
    const shouldBeSilent =
      silentErrors || silentStatusCodes.includes(response.status);
    await handleApiError(response, shouldBeSilent);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'GET' });
  },
  post<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'POST', body });
  },
  put<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'PUT', body });
  },
  patch<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'PATCH', body });
  },
  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'DELETE' });
  },
  // Special method for file uploads (FormData)
  upload<T>(
    url: string,
    formData: FormData,
    options?: RequestOptions,
  ): Promise<T> {
    return fetchApi<T>(url, {
      ...options,
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },
};
