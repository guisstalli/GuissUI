/** @type {import('next').NextConfig} */

// En-têtes de sécurité appliqués à toutes les routes. La CSP limite les
// origines de scripts/connexions : en cas de XSS, elle borne l'exfiltration
// et l'exécution de script injecté. 'unsafe-inline'/'unsafe-eval' sur script
// restent nécessaires au runtime Next 14 (à durcir avec un nonce ultérieurement).
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : '';
const connectSrc = ["'self'", API_ORIGIN, 'https:', 'wss:']
  .filter(Boolean)
  .join(' ');

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  // Les liens deja envoyes (WhatsApp/email : annulation, replanification,
  // inscriptions) pointent vers les anciens chemins publics — redirections
  // permanentes vers le nouveau prefixe /public.
  async redirects() {
    return [
      {
        source: '/rendez-vous/:path*',
        destination: '/public/rendez-vous/:path*',
        permanent: true,
      },
      { source: '/rendez-vous', destination: '/public/rendez-vous', permanent: true },
      {
        source: '/evenements/:path*',
        destination: '/public/evenements/:path*',
        permanent: true,
      },
      { source: '/evenements', destination: '/public/evenements', permanent: true },
      {
        // QR codes deja imprimes (ancienne URL backend erronee)
        source: '/events/public/:slug',
        destination: '/public/evenements/:slug',
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
