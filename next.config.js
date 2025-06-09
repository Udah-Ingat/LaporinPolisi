/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        "lh3.googleusercontent.com", // Google profile images
        "avatars.githubusercontent.com", // GitHub profile images
      ],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "*.supabase.co",
          pathname: "/storage/v1/object/public/**",
        },
      ],
    },
    // PWA configuration
    async headers() {
      return [
        {
          source: "/",
          headers: [
            {
              key: "X-DNS-Prefetch-Control",
              value: "on",
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;