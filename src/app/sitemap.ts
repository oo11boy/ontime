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

// ========== تعریف تایپ‌ها ==========
type CityCategoryCombo = {
  city: string;
  job_slug: string;
  last_modified: Date | string;
};

type CityServiceCombo = {
  city: string;
  service_name: string;
  last_modified: Date | string;
};

type CategoryServiceCombo = {
  job_slug: string;
  service_name: string;
  last_modified: Date | string;
};

type FullCombo = {
  city: string;
  job_slug: string;
  service_name: string;
  last_modified: Date | string;
};

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

    // ========== 6. دریافت ترکیب‌های موجود (شهر + شغل) که واقعاً کسب و کار دارند ==========
    const existingCityCategoryCombos = (await query(
      `SELECT DISTINCT 
         cl.city, 
         j.english_name as job_slug,
         MAX(COALESCE(cl.updated_at, cl.created_at)) as last_modified
       FROM customer_links cl
       LEFT JOIN users u ON cl.user_id = u.id
       LEFT JOIN jobs j ON u.job_id = j.id
       WHERE cl.is_active = 1 
         AND cl.is_deleted = 0
         AND cl.city IS NOT NULL 
         AND cl.city != ''
         AND j.english_name IS NOT NULL
       GROUP BY cl.city, j.english_name`,
      []
    )) as CityCategoryCombo[];

    // ========== 7. دریافت ترکیب‌های موجود (شهر + سرویس) ==========
    const existingCityServiceCombos = (await query(
      `SELECT DISTINCT 
         cl.city,
         JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) as service_name,
         MAX(COALESCE(cl.updated_at, cl.created_at)) as last_modified
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
         AND cl.city IS NOT NULL
         AND cl.city != ''
       GROUP BY cl.city, service_name
       LIMIT 500`,
      []
    )) as CityServiceCombo[];

    // ========== 8. دریافت ترکیب‌های موجود (شغل + سرویس) ==========
    const existingCategoryServiceCombos = (await query(
      `SELECT DISTINCT 
         j.english_name as job_slug,
         JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) as service_name,
         MAX(COALESCE(cl.updated_at, cl.created_at)) as last_modified
       FROM customer_links cl
       LEFT JOIN users u ON cl.user_id = u.id
       LEFT JOIN jobs j ON u.job_id = j.id
       CROSS JOIN (
         SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
         UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 
         UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
       ) numbers
       WHERE cl.is_active = 1 
         AND cl.is_deleted = 0
         AND cl.services IS NOT NULL
         AND JSON_LENGTH(cl.services) > n
         AND j.english_name IS NOT NULL
       GROUP BY j.english_name, service_name
       LIMIT 500`,
      []
    )) as CategoryServiceCombo[];

    // ========== 9. دریافت ترکیب‌های موجود (شهر + شغل + سرویس) ==========
    const existingFullCombos = (await query(
      `SELECT DISTINCT 
         cl.city,
         j.english_name as job_slug,
         JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) as service_name,
         MAX(COALESCE(cl.updated_at, cl.created_at)) as last_modified
       FROM customer_links cl
       LEFT JOIN users u ON cl.user_id = u.id
       LEFT JOIN jobs j ON u.job_id = j.id
       CROSS JOIN (
         SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
         UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 
         UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
       ) numbers
       WHERE cl.is_active = 1 
         AND cl.is_deleted = 0
         AND cl.services IS NOT NULL
         AND JSON_LENGTH(cl.services) > n
         AND cl.city IS NOT NULL
         AND cl.city != ''
         AND j.english_name IS NOT NULL
       GROUP BY cl.city, j.english_name, service_name
       LIMIT 1000`,
      []
    )) as FullCombo[];

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

    // ========== سطح 1: صفحات فقط شهر (که کسب و کار دارند) ==========
    const cityOnlyRoutes = cities.map((city: any) => ({
      url: `${baseUrl}/businesses/${encodeURIComponent(city.city)}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // ========== سطح 1: صفحات فقط دسته شغلی (که کسب و کار دارند) ==========
    const categoryOnlyRoutes = categories.map((category: any) => ({
      url: `${baseUrl}/businesses/${category.english_name}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // ========== سطح 1: صفحات فقط خدمات (که کسب و کار دارند) ==========
    const serviceOnlyRoutes = popularServices.map((service: any) => ({
      url: `${baseUrl}/businesses/${service.service_name.replace(/ /g, "-").toLowerCase()}`,
      lastModified: lastBusinessDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // ========== سطح 2: صفحات ترکیبی (شهر + شغل) - فقط ترکیب‌های موجود ==========
    const cityCategoryRoutes: MetadataRoute.Sitemap = [];
    for (const combo of existingCityCategoryCombos) {
      cityCategoryRoutes.push({
        url: `${baseUrl}/businesses/${encodeURIComponent(combo.city)}/${combo.job_slug}`,
        lastModified: combo.last_modified ? new Date(combo.last_modified) : lastBusinessDate,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      });
    }

    // ========== سطح 2: صفحات ترکیبی (شهر + سرویس) - فقط ترکیب‌های موجود ==========
    const cityServiceRoutes: MetadataRoute.Sitemap = [];
    for (const combo of existingCityServiceCombos) {
      cityServiceRoutes.push({
        url: `${baseUrl}/businesses/${encodeURIComponent(combo.city)}/${combo.service_name.replace(/ /g, "-").toLowerCase()}`,
        lastModified: combo.last_modified ? new Date(combo.last_modified) : lastBusinessDate,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }

    // ========== سطح 2: صفحات ترکیبی (شغل + سرویس) - فقط ترکیب‌های موجود ==========
    const categoryServiceRoutes: MetadataRoute.Sitemap = [];
    for (const combo of existingCategoryServiceCombos) {
      categoryServiceRoutes.push({
        url: `${baseUrl}/businesses/${combo.job_slug}/${combo.service_name.replace(/ /g, "-").toLowerCase()}`,
        lastModified: combo.last_modified ? new Date(combo.last_modified) : lastBusinessDate,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }

    // ========== سطح 3: صفحات ترکیبی (شهر + شغل + سرویس) - فقط ترکیب‌های موجود ==========
    const fullCombinedRoutes: MetadataRoute.Sitemap = [];
    for (const combo of existingFullCombos) {
      fullCombinedRoutes.push({
        url: `${baseUrl}/businesses/${encodeURIComponent(combo.city)}/${combo.job_slug}/${combo.service_name.replace(/ /g, "-").toLowerCase()}`,
        lastModified: combo.last_modified ? new Date(combo.last_modified) : lastBusinessDate,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      });
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

    console.log(`✅ Sitemap generated successfully with ${uniqueRoutes.length} URLs`);
    console.log(`   - City+Category: ${cityCategoryRoutes.length}`);
    console.log(`   - City+Service: ${cityServiceRoutes.length}`);
    console.log(`   - Category+Service: ${categoryServiceRoutes.length}`);
    console.log(`   - Full combos: ${fullCombinedRoutes.length}`);
    
    return uniqueRoutes;
    
  } catch (error) {
    console.error("❌ Sitemap error:", error);
    
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