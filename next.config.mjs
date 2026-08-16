/** @type {import('next').NextConfig} */
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
};

export default nextConfig;
