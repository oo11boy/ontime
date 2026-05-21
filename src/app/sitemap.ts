import { MetadataRoute } from "next";
import { query } from "@/lib/db";

// ========== خودکار: بدون نیاز به تغییر دستی ==========
export const revalidate = 86400; // 24 ساعت

// تاریخ ثابت – فقط یک بار در زمان build محاسبه می‌شود
// اگر در حال توسعه هستید، تاریخ فعلی را می‌گیرد
const STATIC_DATE = (() => {
  // در محیط production، تاریخ build را نگه می‌دارد
  if (process.env.NODE_ENV === "production") {
    // این مقدار در هر build یکبار محاسبه می‌شود
    return new Date();
  }
  // در محیط development، تاریخ ثابت (برای جلوگیری از تغییر مداوم)
  return new Date("2025-01-01");
})();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ontimeapp.ir";

  try {
    const posts = (await query(
      "SELECT slug, COALESCE(updated_at, created_at) as last_modified FROM blog_posts ORDER BY created_at DESC",
      []
    )) as any[];

    const lastPostDate = posts?.[0]?.last_modified 
      ? new Date(posts[0].last_modified) 
      : STATIC_DATE;

    // ========== صفحات ثابت – با تاریخ خودکار ==========
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: STATIC_DATE,
        changeFrequency: "monthly",
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

    if (!posts?.length) return staticRoutes;

    const dynamicRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.last_modified),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...dynamicRoutes];
    
  } catch (error) {
    console.error("Sitemap error:", error);
    // Fallback: صفحات اصلی
    return [
      { url: baseUrl, lastModified: STATIC_DATE, changeFrequency: "monthly", priority: 1.0 },
      { url: `${baseUrl}/blog`, lastModified: STATIC_DATE, changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/industries/beauty-salon`, lastModified: STATIC_DATE, changeFrequency: "weekly", priority: 0.9 },
      { url: `${baseUrl}/industries/nail-artist`, lastModified: STATIC_DATE, changeFrequency: "weekly", priority: 0.9 },
    ];
  }
}