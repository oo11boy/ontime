import withPWAInit from "next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-fonts",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /^\/_next\/image\?url=.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-image-cache",
      },
    },
    {
      urlPattern: /^\/clientdashboard/,
      handler: "NetworkFirst",
      options: {
        cacheName: "client-dashboard-pages",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /^\/api\/client\/.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  turbopack: {}, 
  images: {
    formats: ["image/avif", "image/webp"] as any, // استفاده از any برای عبور از تداخل پکیج PWA
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      {
        source: "/:token((?!robots\\.txt|sitemap\\.xml|favicon\\.ico|manifest\\.json|api|clientdashboard|admindashboard|login|admin-login|customer|_next|static|images|icons).*)",
        destination: "/customer/booking/:token",
      },
    ];
  },
};

export default withPWA(nextConfig as any);