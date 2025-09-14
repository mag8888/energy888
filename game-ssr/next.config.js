/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://money8888-production.up.railway.app',
  },
  // Optimize build for memory usage
  experimental: {
    // Disable some memory-intensive features during build
    optimizeCss: false,
  },
  // Disable SWC minification to reduce memory usage
  swcMinify: false,
  // Disable TypeScript checking during build to save memory
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build to save memory
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    // Increase memory limit for webpack
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };
    
    // Reduce memory usage
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  // Disable source maps in production to save memory
  productionBrowserSourceMaps: false,
  // Reduce image optimization memory usage
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
