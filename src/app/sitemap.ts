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
    // 1. دریافت بلاگ پست‌ها
    const posts = (await query(
      "SELECT slug, COALESCE(updated_at, created_at) as last_modified FROM blog_posts ORDER BY created_at DESC",
      []
    )) as any[];

    // 2. دریافت کسب و کارها
    const businesses = (await query(
      `SELECT slug, COALESCE(updated_at, created_at) as last_modified 
       FROM customer_links 
       WHERE is_active = 1 AND is_deleted = 0`,
      []
    )) as any[];

    // 3. دریافت دسته‌های شغلی دارای کسب و کار
    const categories = (await query(
      `SELECT DISTINCT j.english_name, j.persian_name
       FROM jobs j
       INNER JOIN users u ON u.job_id = j.id
       INNER JOIN customer_links cl ON cl.user_id = u.id
       WHERE cl.is_active = 1 AND cl.is_deleted = 0`,
      []
    )) as any[];

    // 4. دریافت شهرهای دارای کسب و کار
    const cities = (await query(
      `SELECT DISTINCT city 
       FROM customer_links 
       WHERE is_active = 1 AND is_deleted = 0 
         AND city IS NOT NULL AND city != ''`,
      []
    )) as any[];

    // 5. دریافت خدمات محبوب (برای ساخت صفحات جداگانه خدمات)
    const popularServices = (await query(
      `SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) as service_name
       FROM customer_links cl
       CROSS JOIN (
         SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
         UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 
         UNION SELECT 8 UNION SELECT 9
       ) numbers
       WHERE cl.is_active = 1 
         AND cl.is_deleted = 0
         AND cl.services IS NOT NULL
         AND JSON_LENGTH(cl.services) > n
       GROUP BY service_name
       HAVING COUNT(*) > 5
       LIMIT 50`,
      []
    )) as any[];

    const lastBusinessDate = businesses[0]?.last_modified 
      ? new Date(businesses[0].last_modified) 
      : STATIC_DATE;

    // ========== صفحات ثابت ==========
    const staticRoutes: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 1.0 },
      { url: `${baseUrl}/businesses`, lastModified: lastBusinessDate, changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/blog`, lastModified: STATIC_DATE, changeFrequency: "daily", priority: 0.9 },
    ];

    // ========== صفحات داینامیک ==========
    const blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.last_modified),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const businessRoutes = businesses.map((business) => ({
      url: `${baseUrl}/c/${business.slug}`,
      lastModified: new Date(business.last_modified),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    // صفحات فقط شهر
    const cityOnlyRoutes = cities.map((city) => ({
      url: `${baseUrl}/businesses/${city.city}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // صفحات فقط دسته شغلی
    const categoryOnlyRoutes = categories.map((category) => ({
      url: `${baseUrl}/businesses/${category.english_name}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // صفحات ترکیبی (شهر + دسته شغلی) ← مهمترین بخش
    const combinedRoutes: MetadataRoute.Sitemap = [];
    for (const city of cities) {
      for (const category of categories) {
        combinedRoutes.push({
          url: `${baseUrl}/businesses/${city.city}/${category.english_name}`,
          lastModified: lastBusinessDate,
          changeFrequency: "weekly" as const,
          priority: 0.9,
        });
      }
    }

    // صفحات فقط خدمات (امکانات جدید)
    const serviceRoutes = popularServices.map((service) => ({
      url: `${baseUrl}/businesses?service=${encodeURIComponent(service.service_name)}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const allRoutes = [
      ...staticRoutes,
      ...blogRoutes,
      ...businessRoutes,
      ...cityOnlyRoutes,
      ...categoryOnlyRoutes,
      ...combinedRoutes,
      ...serviceRoutes,
    ];

    // حذف موارد تکراری (بر اساس URL)
    const uniqueRoutes = Array.from(
      new Map(allRoutes.map(route => [route.url, route])).values()
    );

    return uniqueRoutes.slice(0, 50000);
    
  } catch (error) {
    console.error("Sitemap error:", error);
    return [
      { url: baseUrl, lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 1.0 },
      { url: `${baseUrl}/businesses`, lastModified: STATIC_DATE, changeFrequency: "daily", priority: 1.0 },
    ];
  }
}