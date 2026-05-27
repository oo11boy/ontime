import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 1. ربات‌های AI (دسترسی محدود به محتوای عمومی)
      {
        userAgent: [
          "GPTBot", "ChatGPT-User", "Google-Extended", "DeepSeekBot",
          "anthropic-ai", "Claude-Web", "PerplexityBot", "MetaExternalAgent",
          "Applebot-Extended", "OAI-SearchBot", "cohere-ai", "xai-crawler"
        ],
        allow: ["/", "/blog", "/c", "/businesses", "/industries", "/trainings"],
        disallow: [
          "/admindashboard", "/clientdashboard", "/api", "/admin-login",
          "/login", "/private", "/customer/booking", "/*/edit", "/*/delete"
        ],
      },
      
      // 2. ربات‌های سنتی گوگل، بینگ و غیره (دسترسی بیشتر + اجازه به assets)
      {
        userAgent: ["Googlebot", "Bingbot", "YandexBot", "DuckDuckBot", "Baiduspider"],
        allow: ["/", "/blog", "/c", "/businesses", "/industries", "/trainings", "/_next/static", "/images", "/icons"],
        disallow: [
          "/admindashboard", "/clientdashboard", "/api", "/admin-login",
          "/login", "/private", "/customer/booking"
        ],
      },
      
      // 3. ربات‌های ایرانی
      {
        userAgent: ["ParsijooBot", "SazitoBot", "YaazahBot"],
        allow: ["/", "/blog", "/c", "/businesses", "/industries", "/trainings"],
        disallow: [
          "/admindashboard", "/clientdashboard", "/api", "/admin-login",
          "/login", "/private", "/customer/booking"
        ],
      },
      
      // 4. قانون عمومی (فقط مسیرهای عمومی)
      {
        userAgent: "*",
        allow: ["/", "/blog", "/c", "/businesses", "/industries", "/trainings", "/images", "/icons"],
        disallow: [
          "/admindashboard", "/clientdashboard", "/api", "/admin-login",
          "/login", "/private", "/customer/booking", "/*?*", "/_next"
        ],
      },
    ],
    sitemap: "https://ontimeapp.ir/sitemap.xml",
    
  };
}