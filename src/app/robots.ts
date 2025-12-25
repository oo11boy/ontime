import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // لیست ربات‌های هوش مصنوعی که می‌خواهیم لندینگ را ببینند
  const aiBots = [
    'xai-crawler',      // Grok
    'GPTBot',           // ChatGPT
    'ChatGPT-User',     // ChatGPT Plus
    'Google-Extended',  // Gemini
    'DeepSeekBot',      // DeepSeek
    'anthropic-ai',     // Claude
    'Claude-Web',       // Claude
    'PerplexityBot',    // Perplexity
    'MetaExternalAgent',// Meta AI
    'Applebot-Extended',// Apple Intelligence
    'CCBot'             // Common Crawl
  ];

  return {
    rules: [
      // قانون برای تمام ربات‌های هوش مصنوعی لیست شده
      {
        userAgent: aiBots,
        allow: '/$',
        disallow: '/',
      },
      // قانون کلی برای بقیه ربات‌ها (گوگل، بینگ و غیره)
      {
        userAgent: '*',
        allow: '/$',
        disallow: [
          '/',
          '/admindashboard',
          '/clientdashboard',
          '/api',
          '/admin-login',
          '/login',
        ],
      },
    ],
    sitemap: 'https://ontimeapp.ir/sitemap.xml',
  }
}