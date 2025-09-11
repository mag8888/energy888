/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://botenergy-7to1-production.up.railway.app',
  },
};

module.exports = nextConfig;
