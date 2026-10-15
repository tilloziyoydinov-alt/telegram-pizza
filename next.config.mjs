/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Server kutubxonalari bundle qilinmaydi (Sequelize dinamik require ishlatadi)
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'winston'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Mini App faqat Telegram ichida iframe'da ochiladi
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
