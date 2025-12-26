import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    "xai-crawler",
    "GPTBot",
    "ChatGPT-User",
    "Google-Extended",
    "DeepSeekBot",
    "anthropic-ai",
    "Claude-Web",
    "PerplexityBot",
    "MetaExternalAgent",
    "Applebot-Extended",
    "CCBot",
  ];

  return {
    rules: [
      {
        // تنظیمات برای هوش مصنوعی‌ها: دسترسی به بخش‌های عمومی آزاد باشد
        userAgent: aiBots,
        allow: ["/", "/blog", "/blog/"],
        disallow: [
          "/admindashboard",
          "/clientdashboard",
          "/api/",
          "/admin-login",
          "/login",
        ],
      },
      {
        // تنظیمات برای گوگل و سایر موتورهای جستجو
        userAgent: "*",
        allow: [
          "/", // اجازه به صفحه اصلی
          "/blog", // اجازه به لیست مقالات
          "/blog/", // اجازه به تمام مقالات (خیلی مهم)
          "/_next/static/", // اجازه به فایل‌های سیستمی برای رندر درست
        ],
        disallow: [
          "/admindashboard",
          "/clientdashboard",
          "/api/",
          "/admin-login",
          "/login",
          "/private",
        ],
      },
    ],
    sitemap: "https://ontimeapp.ir/sitemap.xml",
  };
}
