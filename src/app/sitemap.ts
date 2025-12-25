import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // از آنجایی که سایت شما تک‌صفحه‌ای است، فقط روت اصلی را برمی‌گردانیم
  return [
    {
      url: "https://ontimeapp.ir",
      lastModified: new Date(),
      changeFrequency: "monthly", // چون لندینگ پیج معمولاً ماهیانه آپدیت می‌شود
      priority: 1, // بالاترین اولویت برای ایندکس شدن
    },
  ];
}
