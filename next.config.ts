import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      // تنظیمات خالی برای غیرفعال کردن اخطار در صورت استفاده از وب‌پک
    },
  },
  async rewrites() {
    return [
      {
        /* توضیح شرط پایین: 
          فقط زمانی ری‌رایت انجام می‌شود که مقدار بعد از اسلش (token) 
          جزء موارد زیر نباشد:
          - فایل‌های سیستمی: robots.txt, sitemap.xml, favicon.ico, manifest.json
          - پوشه‌های اصلی: api, clientdashboard, admindashboard, login, admin-login, customer
          - فایل‌های استاتیک: _next, static, images, icons
        */
        source: "/:token((?!robots\\.txt|sitemap\\.xml|favicon\\.ico|manifest\\.json|api|clientdashboard|admindashboard|login|admin-login|customer|_next|static|images|icons).*)",
        destination: "/customer/booking/:token",
      },
    ];
  },
    turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      // برای صفحات داشبورد: اولویت با شبکه، اگر نبود از کش استفاده کن
      urlPattern: /^\/clientdashboard/,
      handler: "NetworkFirst",
      options: {
        cacheName: "client-dashboard-pages",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 ساعت
        },
      },
    },
    {
      // برای فایل‌های استاتیک مثل عکس‌ها و فونت‌ها
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "static-fonts" },
    },
    {
      // برای API ها
      urlPattern: /^\/api\/client\/.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
      },
    },
  ],
})(nextConfig);