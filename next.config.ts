import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next 16 only allows quality 75 unless listed here.
    qualities: [60, 75, 85],
    // Fewer candidate widths keeps every srcset (and the page HTML) shorter; these cover phones to large screens.
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Broker logos are uploaded through a server action (up to 2 MB plus form fields).
  experimental: { serverActions: { bodySizeLimit: '3mb' } },
  // Leaflet optionally requires `canvas` (a Node-only package); point it at an empty module.
  turbopack: {
    resolveAlias: { canvas: './lib/canvas-stub.js' },
  },
  async redirects() {
    return [
      { source: '/properties/map', destination: '/properties?view=map', permanent: true },
      // Retired pages: their content now lives on About.
      { source: '/services', destination: '/about', permanent: true },
      { source: '/members', destination: '/management', permanent: true },
    ]
  },
}

export default nextConfig
