/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mentoria/database'],
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

