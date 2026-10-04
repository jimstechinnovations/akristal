import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next 16 only allows quality 75 unless listed here.
    qualities: [60, 75, 85],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Leaflet optionally requires `canvas` (a Node-only package); point it at an empty module.
  turbopack: {
    resolveAlias: { canvas: './lib/canvas-stub.js' },
  },
  async redirects() {
    return [
      { source: '/properties/map', destination: '/properties?view=map', permanent: true },
      // Retired pages: their content now lives on About.
      { source: '/services', destination: '/about', permanent: true },
      { source: '/members', destination: '/about#team', permanent: true },
    ]
  },
}

export default nextConfig
