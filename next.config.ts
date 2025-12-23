import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/:token",
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
