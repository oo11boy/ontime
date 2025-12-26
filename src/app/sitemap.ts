import { MetadataRoute } from "next";
import { query } from "@/lib/db";

export const revalidate = 0; // اطمینان از اینکه نقشه سایت همیشه تازه‌ترین داده‌ها را می‌گیرد

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ontimeapp.ir";

  try {
    // ۱. دریافت تمام مقالات به ترتیب جدیدترین
    const posts = (await query(
      "SELECT slug, created_at FROM blog_posts ORDER BY created_at DESC",
      []
    )) as any[];

    // پیدا کردن زمان آخرین مقاله (اگر مقاله‌ای وجود داشت)
    const lastPostDate =
      posts && posts.length > 0 ? new Date(posts[0].created_at) : new Date();

    // ۲. صفحات ثابت سایت
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: lastPostDate, // زمان آپدیت لیست برابر با زمان آخرین مقاله
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];

    if (!posts || !Array.isArray(posts)) {
      return staticRoutes;
    }

    // ۳. تبدیل مقالات دیتابیس به فرمت نقشه سایت
    const dynamicRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Sitemap Auto-Update Error:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];
  }
}
