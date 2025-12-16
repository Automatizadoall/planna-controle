/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mentoria/database'],
  
  // Otimizações para produção
  poweredByHeader: false,
  
  // Configuração de imagens (se necessário)
  images: {
    remotePatterns: [],
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

