/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Updated to use remotePatterns (recommended) instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        // optional pathname wildcard to allow any image path
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vathleqimtthmldvhwbq.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
