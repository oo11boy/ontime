// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { query } from "@/lib/db";

// ========== خودکار: بدون نیاز به تغییر دستی ==========
export const revalidate = 86400; // 24 ساعت

// تاریخ ثابت – فقط یک بار در زمان build محاسبه می‌شود
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

    const lastPostDate = posts?.[0]?.last_modified 
      ? new Date(posts[0].last_modified) 
      : STATIC_DATE;

    // ========== 2. دریافت کسب و کارها ==========
    const businesses = (await query(
      `SELECT slug, COALESCE(updated_at, created_at) as last_modified 
       FROM customer_links 
       WHERE is_active = 1 AND is_deleted = 0 
       ORDER BY created_at DESC`,
      []
    )) as any[];

    // ========== 3. دریافت دسته‌های شغلی دارای کسب و کار ==========
    const categories = (await query(
      `SELECT DISTINCT j.english_name, j.persian_name
       FROM jobs j
       INNER JOIN users u ON u.job_id = j.id
       INNER JOIN customer_links cl ON cl.user_id = u.id
       WHERE cl.is_active = 1 AND cl.is_deleted = 0
       ORDER BY j.persian_name ASC`,
      []
    )) as any[];

    // ========== 4. دریافت شهرهای دارای کسب و کار ==========
    const cities = (await query(
      `SELECT DISTINCT city 
       FROM customer_links 
       WHERE is_active = 1 AND is_deleted = 0 
         AND city IS NOT NULL AND city != ''
       ORDER BY city ASC`,
      []
    )) as any[];

    // تاریخ آخرین بروزرسانی کسب و کارها
    const lastBusinessDate = businesses?.[0]?.last_modified 
      ? new Date(businesses[0].last_modified) 
      : STATIC_DATE;

    // تاریخ آخرین بروزرسانی دسته‌ها
    const lastCategoryDate = categories?.length > 0 ? lastBusinessDate : STATIC_DATE;

    // تاریخ آخرین بروزرسانی شهرها
    const lastCityDate = cities?.length > 0 ? lastBusinessDate : STATIC_DATE;

    // ========== صفحات ثابت ==========
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: STATIC_DATE,
        changeFrequency: "monthly",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/businesses`,
        lastModified: lastBusinessDate,
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: lastPostDate,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/industries`,
        lastModified: STATIC_DATE,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/trainings`,
        lastModified: STATIC_DATE,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/industries/beauty-salon`,
        lastModified: STATIC_DATE,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/industries/nail-artist`,
        lastModified: STATIC_DATE,
        changeFrequency: "weekly",
        priority: 0.9,
      },
    ];

    // ========== صفحات داینامیک بلاگ ==========
    const blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.last_modified),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // ========== صفحات داینامیک کسب و کارها ==========
    const businessRoutes = businesses.map((business) => ({
      url: `${baseUrl}/c/${business.slug}`,
      lastModified: new Date(business.last_modified),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    // ========== صفحات دسته‌بندی مشاغل ==========
    const categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/businesses/${category.english_name}`,
      lastModified: lastCategoryDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // ========== صفحات شهرها ==========
    const cityRoutes = cities.map((city) => ({
      url: `${baseUrl}/businesses/${city.city}`,
      lastModified: lastCityDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // ========== صفحات ترکیبی (شهر + دسته) ==========
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

    // ========== جمع‌آوری تمام صفحات ==========
    const allRoutes = [
      ...staticRoutes,
      ...blogRoutes,
      ...businessRoutes,
      ...categoryRoutes,
      ...cityRoutes,
      ...combinedRoutes,
    ];

    // محدودیت 50,000 صفحه برای sitemap (گوگل)
    const MAX_SITEMAP_URLS = 50000;
    if (allRoutes.length > MAX_SITEMAP_URLS) {
      console.warn(`Sitemap exceeds ${MAX_SITEMAP_URLS} URLs. Truncating.`);
      return allRoutes.slice(0, MAX_SITEMAP_URLS);
    }

    return allRoutes;
    
  } catch (error) {
    console.error("Sitemap error:", error);
    
    // Fallback: صفحات اصلی در صورت خطا
    return [
      { url: baseUrl, lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 1.0 },
      { url: `${baseUrl}/businesses`, lastModified: STATIC_DATE, changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/blog`, lastModified: STATIC_DATE, changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/industries/beauty-salon`, lastModified: STATIC_DATE, changeFrequency: "weekly", priority: 0.9 },
      { url: `${baseUrl}/industries/nail-artist`, lastModified: STATIC_DATE, changeFrequency: "weekly", priority: 0.9 },
    ];
  }
}