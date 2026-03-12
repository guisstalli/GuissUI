import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL = 'https://icdaccessmanagement.who.int/connect/token';
const SEARCH_URL = 'https://id.who.int/icd/release/11/2024-01/mms/search';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.ICD_CLIENT_ID;
  const clientSecret = process.env.ICD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('ICD credentials not configured');
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'icdapi_access',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Expire 60s before actual expiry to avoid edge cases
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ destinationEntities: [] });
  }

  try {
    const token = await getAccessToken();

    const url = new URL(SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('useFlexisearch', 'true');
    url.searchParams.set('flatResults', 'true');
    url.searchParams.set('highlightingEnabled', 'false');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Accept-Language': 'fr',
        'API-Version': 'v2',
      },
    });

    if (!response.ok) {
      // If token expired, clear cache and retry once
      if (response.status === 401) {
        cachedToken = null;
        tokenExpiresAt = 0;
        const newToken = await getAccessToken();
        const retryResponse = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${newToken}`,
            Accept: 'application/json',
            'Accept-Language': 'fr',
            'API-Version': 'v2',
          },
        });
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return NextResponse.json(data);
        }
      }
      return NextResponse.json(
        { error: 'ICD API request failed' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('ICD proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
