/** @type {import('next').NextConfig} */
const nextConfig = {
  // async rewrites() {
  //   return [
  //     {
  //       source: "/:path((?!auth).*)",
  //       missing: [
  //         {
  //           type: "cookie",
  //           key: "next-auth.session-token",
  //           value:''
  //         },
  //       ],

  //       destination: "/auth/signin",
  //     },
  //   ];
  // },
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
  experimental: {
    scrollRestoration: true,
  },

  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "flowbite.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "customer-mgkas9o5mlq4q3on.cloudflarestream.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "sample-videos.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com", // GCP 샘플 비디오
      },
      {
        protocol: "https",
        hostname: "peach.blender.org", // ✅ 새로 추가
      },
    ],
  },
};

export default nextConfig;
