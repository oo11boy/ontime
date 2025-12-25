import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // ۱. اجازه به صفحه اصلی (لندینگ پیج)
      allow: '/$', 
      
      // ۲. بستن تمام دسترسی‌های دیگر به صورت یکجا
      disallow: [
        '/',                // بستن کل سایت (به جز قانون بالا)
        '/admindashboard',  // امنیت مضاعف برای پنل ادمین کل
        '/clientdashboard', // امنیت مضاعف برای پنل کاربران
        '/api',             // مخفی کردن تمام مسیرهای API
        '/admin-login',     // صفحه ورود ادمین
        '/login',           // صفحه ورود کلاینت
      ],
    },
    sitemap: 'https://ontimeapp.ir/sitemap.xml',
  }
}