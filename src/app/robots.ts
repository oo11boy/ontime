import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
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
      {
        userAgent: aiBots,
        allow: ['/$', '/_next/static/'], // اجازه دسترسی به صفحه اصلی و استایل‌ها
        disallow: '/', // بستن سایر مسیرها
      },
      {
        userAgent: '*',
        allow: ['/$', '/_next/static/'], // اصلاح: استفاده از آرایه برای چند اجازه دسترسی
        disallow: [
          '/',
          '/admindashboard',
          '/clientdashboard',
          '/api/',
          '/admin-login',
          '/login',
        ],
      },
    ],
    sitemap: 'https://ontimeapp.ir/sitemap.xml',
  }
}