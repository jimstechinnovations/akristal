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
}

export default nextConfig
