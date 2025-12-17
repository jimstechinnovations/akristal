import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Webpack config for Leaflet compatibility (when using --webpack flag)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
  // Turbopack config - empty config to silence the warning
  turbopack: {},
  // Note: Turbopack handles canvas module differently and typically doesn't need this config
  // If you encounter issues with Turbopack, use --webpack flag: npm run dev:webpack
};

export default nextConfig;
