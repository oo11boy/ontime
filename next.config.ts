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
    // استثنا برای فایل‌های آپلودی - همیشه از شبکه بگیر
    {
      urlPattern: /^\/uploads\/.*/i,
      handler: "NetworkOnly", // فقط از شبکه، هیچ کشی نکن
      options: {
        cacheName: "uploaded-images",
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
    formats: ["image/avif", "image/webp"] as any,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['localhost', 'ontimeapp.ir'],
  },
  
  // اضافه کردن هدرهای ضد کش برای فایل‌های آپلودی
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
  
  async rewrites() {
    return [
      {
        source: "/:token((?!robots\\.txt|sitemap\\.xml|favicon\\.ico|manifest\\.json|api|blog|clientdashboard|admindashboard|login|admin-login|customer|c|_next|static|images|icons|businesses|uploads).*)",
        destination: "/customer/booking/:token",
      },
    ];
  },
};

export default withPWA(nextConfig as any);