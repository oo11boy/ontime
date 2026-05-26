// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { query } from "@/lib/db";

export const revalidate = 86400; // 24 ساعت

const STATIC_DATE = (() => {
  if (process.env.NODE_ENV === "production") {
    return new Date();
  }
  return new Date("2025-01-01");
})();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ontimeapp.ir";

  try {
    // ========== 1. دریافت بلاگ پست‌ها ==========
    const posts = (await query(
      "SELECT slug, COALESCE(updated_at, created_at) as last_modified FROM blog_posts ORDER BY created_at DESC",
      []
    )) as any[];

    // ========== 2. دریافت کسب و کارها ==========
    const businesses = (await query(
      `SELECT slug, COALESCE(updated_at, created_at) as last_modified 
       FROM customer_links 
       WHERE is_active = 1 AND is_deleted = 0`,
      []
    )) as any[];

    // ========== 3. دریافت دسته‌های شغلی دارای کسب و کار ==========
    const categories = (await query(
      `SELECT DISTINCT j.english_name, j.persian_name, j.id
       FROM jobs j
       INNER JOIN users u ON u.job_id = j.id
       INNER JOIN customer_links cl ON cl.user_id = u.id
       WHERE cl.is_active = 1 AND cl.is_deleted = 0`,
      []
    )) as any[];

    // ========== 4. دریافت شهرهای دارای کسب و کار ==========
    const cities = (await query(
      `SELECT DISTINCT city 
       FROM customer_links 
       WHERE is_active = 1 AND is_deleted = 0 
         AND city IS NOT NULL AND city != ''`,
      []
    )) as any[];

    // ========== 5. دریافت خدمات محبوب (برای صفحات ترکیبی) ==========
    const popularServices = (await query(
      `SELECT 
        DISTINCT JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) as service_name,
        COUNT(*) as business_count
       FROM customer_links cl
       CROSS JOIN (
         SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
         UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 
         UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
       ) numbers
       WHERE cl.is_active = 1 
         AND cl.is_deleted = 0
         AND cl.services IS NOT NULL
         AND JSON_LENGTH(cl.services) > n
       GROUP BY service_name
       HAVING COUNT(*) >= 3
       LIMIT 100`,
      []
    )) as any[];

    const lastBusinessDate = businesses[0]?.last_modified 
      ? new Date(businesses[0].last_modified) 
      : STATIC_DATE;

    // ========== صفحات ثابت ==========
    const staticRoutes: MetadataRoute.Sitemap = [
      { 
        url: baseUrl, 
        lastModified: STATIC_DATE, 
        changeFrequency: "monthly", 
        priority: 1.0 
      },
      { 
        url: `${baseUrl}/businesses`, 
        lastModified: lastBusinessDate, 
        changeFrequency: "daily", 
        priority: 1.0 
      },
      { 
        url: `${baseUrl}/blog`, 
        lastModified: STATIC_DATE, 
        changeFrequency: "daily", 
        priority: 0.9 
      },
    ];

    // ========== صفحات داینامیک بلاگ ==========
    const blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.last_modified),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // ========== صفحات کسب و کارها ==========
    const businessRoutes = businesses.map((business) => ({
      url: `${baseUrl}/c/${business.slug}`,
      lastModified: new Date(business.last_modified),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    // ========== سطح 1: صفحات فقط شهر ==========
    const cityOnlyRoutes = cities.map((city) => ({
      url: `${baseUrl}/businesses/${encodeURIComponent(city.city)}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // ========== سطح 1: صفحات فقط دسته شغلی ==========
    const categoryOnlyRoutes = categories.map((category) => ({
      url: `${baseUrl}/businesses/${category.english_name}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // ========== سطح 1: صفحات فقط خدمات (به صورت query string) ==========
    const serviceOnlyRoutes = popularServices.map((service) => ({
      url: `${baseUrl}/businesses/${service.service_name.replace(/ /g, "-").toLowerCase()}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // ========== سطح 2: صفحات ترکیبی (شهر + شغل) ==========
    const cityCategoryRoutes: MetadataRoute.Sitemap = [];
    for (const city of cities) {
      for (const category of categories) {
        cityCategoryRoutes.push({
          url: `${baseUrl}/businesses/${encodeURIComponent(city.city)}/${category.english_name}`,
          lastModified: lastBusinessDate,
          changeFrequency: "weekly" as const,
          priority: 0.9,
        });
      }
    }

    // ========== سطح 2: صفحات ترکیبی (شهر + سرویس) ==========
    const cityServiceRoutes: MetadataRoute.Sitemap = [];
    // فقط برای 20 شهر اول و 20 سرویس اول (برای جلوگیری از زیاد شدن بیش از حد)
    const topCities = cities.slice(0, 20);
    const topServices = popularServices.slice(0, 20);
    
    for (const city of topCities) {
      for (const service of topServices) {
        cityServiceRoutes.push({
          url: `${baseUrl}/businesses/${encodeURIComponent(city.city)}/${service.service_name.replace(/ /g, "-").toLowerCase()}`,
          lastModified: lastBusinessDate,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      }
    }

    // ========== سطح 2: صفحات ترکیبی (شغل + سرویس) ==========
    const categoryServiceRoutes: MetadataRoute.Sitemap = [];
    for (const category of categories) {
      for (const service of topServices) {
        categoryServiceRoutes.push({
          url: `${baseUrl}/businesses/${category.english_name}/${service.service_name.replace(/ /g, "-").toLowerCase()}`,
          lastModified: lastBusinessDate,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      }
    }

    // ========== سطح 3: صفحات ترکیبی (شهر + شغل + سرویس) ==========
    const fullCombinedRoutes: MetadataRoute.Sitemap = [];
    // محدودیت: حداکثر 500 صفحه برای این بخش (برای جلوگیری از blow up شدن)
    let comboCount = 0;
    const maxCombos = 500;
    
    for (const city of topCities) {
      for (const category of categories.slice(0, 10)) {
        for (const service of topServices.slice(0, 5)) {
          if (comboCount >= maxCombos) break;
          fullCombinedRoutes.push({
            url: `${baseUrl}/businesses/${encodeURIComponent(city.city)}/${category.english_name}/${service.service_name.replace(/ /g, "-").toLowerCase()}`,
            lastModified: lastBusinessDate,
            changeFrequency: "weekly" as const,
            priority: 0.9,
          });
          comboCount++;
        }
        if (comboCount >= maxCombos) break;
      }
      if (comboCount >= maxCombos) break;
    }

    // ========== جمع‌آوری تمام صفحات ==========
    const allRoutes = [
      ...staticRoutes,
      ...blogRoutes,
      ...businessRoutes,
      ...cityOnlyRoutes,
      ...categoryOnlyRoutes,
      ...serviceOnlyRoutes,
      ...cityCategoryRoutes,
      ...cityServiceRoutes,
      ...categoryServiceRoutes,
      ...fullCombinedRoutes,
    ];

    // حذف موارد تکراری (بر اساس URL)
    const uniqueRoutes = Array.from(
      new Map(allRoutes.map(route => [route.url, route])).values()
    );

    // محدودیت 50,000 صفحه برای sitemap (گوگل)
    const MAX_SITEMAP_URLS = 50000;
    if (uniqueRoutes.length > MAX_SITEMAP_URLS) {
      console.warn(`Sitemap exceeds ${MAX_SITEMAP_URLS} URLs. Truncating.`);
      return uniqueRoutes.slice(0, MAX_SITEMAP_URLS);
    }

    console.log(`Sitemap generated with ${uniqueRoutes.length} URLs`);
    return uniqueRoutes;
    
  } catch (error) {
    console.error("Sitemap error:", error);
    
    // Fallback: صفحات اصلی در صورت خطا
    return [
      { 
        url: baseUrl, 
        lastModified: STATIC_DATE, 
        changeFrequency: "monthly", 
        priority: 1.0 
      },
      { 
        url: `${baseUrl}/businesses`, 
        lastModified: STATIC_DATE, 
        changeFrequency: "daily", 
        priority: 1.0 
      },
      { 
        url: `${baseUrl}/blog`, 
        lastModified: STATIC_DATE, 
        changeFrequency: "daily", 
        priority: 0.9 
      },
    ];
  }
}