import { MetadataRoute } from "next";
import { query } from "@/lib/db";

export const revalidate = 0; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ontimeapp.ir";

  try {
    // ۱. دریافت تمام مقالات
    const posts = (await query(
      "SELECT slug, created_at FROM blog_posts ORDER BY created_at DESC",
      []
    )) as any[];

    const lastPostDate =
      posts && posts.length > 0 ? new Date(posts[0].created_at) : new Date();

    // ۲. صفحات ثابت سایت (اصلاح شده)
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 1,
      },
      {
        url: `${baseUrl}/industries/beauty-salon`, // اضافه شدن لندینگ آرایشگری
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
            {
        url: `${baseUrl}/industries/nail-artist`, // اضافه شدن لندینگ آرایشگری
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: lastPostDate,
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];

    if (!posts || !Array.isArray(posts)) {
      return staticRoutes;
    }

    // ۳. تبدیل مقالات به فرمت نقشه سایت
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
        url: `${baseUrl}/industries/beauty-salon`, // آدرس رزرو در صورت خطا
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
            {
        url: `${baseUrl}/industries/nail-artist`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
    ];
  }
}