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
        // دسترسی هوش مصنوعی به محتوای متنی جهت درک بیزینس
        userAgent: aiBots,
        allow: ["/", "/blog", "/blog/", "/industries/"],
        disallow: [
          "/admindashboard",
          "/clientdashboard",
          "/api/",
          "/admin-login",
          "/login",
        ],
      },
      {
        // تنظیمات عمومی برای گوگل، بینگ و غیره
        userAgent: "*",
        allow: [
          "/",
          "/blog",
          "/blog/",
          "/industries/", // اجازه به لندینگ‌های تخصصی مثل آرایشگری
          "/_next/static/",
          "/images/", // بسیار مهم: اجازه به گوگل برای ایندکس تصاویر گالری شما
          "/icons/",
        ],
        disallow: [
          "/admindashboard",
          "/clientdashboard",
          "/api/",
          "/admin-login",
          "/login",
          "/private",
          "/customer/booking/", // جلوگیری از ایندکس شدن صفحات رزرو شخصی مشتریان
        ],
      },
    ],
    sitemap: "https://ontimeapp.ir/sitemap.xml",
  };
}