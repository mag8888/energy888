/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: { emotion: true },
  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;
