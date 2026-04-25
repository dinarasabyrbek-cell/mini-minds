/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kqhfkvxyvoexdbpanjzk.supabase.co',
      },
    ],
  },
};

export default nextConfig;
