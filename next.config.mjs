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
    domains: [
      "images.unsplash.com",
      "flowbite.com",
      "imagedelivery.net",
      "customer-mgkas9o5mlq4q3on.cloudflarestream.com",
    ],
  },
};

export default nextConfig;
