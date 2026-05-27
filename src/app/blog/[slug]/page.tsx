import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import Navigation from "@/components/Landing/Navigation";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import {
  Clock,
  Eye,
  ChevronLeft,
  Home,
  ArrowLeft,
  Calendar,
  User,
} from "lucide-react";
import BlogSidebar from "./components/BlogSidebar";
import MobileToolbar from "./components/MobileToolbar";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

export const revalidate = 60;

// ========== تابع استخراج شناسه ویدیوهای آپارات از محتوا ==========
const extractVideoIds = (html: string): string[] => {
  if (!html) return [];
  const videoIds: string[] = [];
  const pattern = /data-video-id="([^"]+)"/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    if (!videoIds.includes(match[1])) {
      videoIds.push(match[1]);
    }
  }
  return videoIds;
};

// ========== تابع پردازش ویدیوهای آپارات با استایل ریسپانسیو ==========
const processAparatVideos = (html: string): string => {
  if (!html) return "";
  
  let processedHtml = html;
  
  // الگوی 1: div با data-aparat-video از ادیتور
  const aparatPattern = /<div[^>]*data-aparat-video[^>]*data-video-id="([^"]+)"[^>]*><\/div>/gi;
  
  processedHtml = processedHtml.replace(aparatPattern, (match, videoId) => {
    return `
      <div class="aparat-video-wrapper">
        <style>
          .aparat-video-wrapper {
            position: relative;
            width: 100%;
            margin: 2rem 0;
            background: #000;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.2);
          }
          .aparat-video-wrapper .video-container {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
          }
          .aparat-video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
          @media (max-width: 768px) {
            .aparat-video-wrapper {
              margin: 1rem 0;
              border-radius: 0.75rem;
            }
          }
          @media (max-width: 640px) {
            .aparat-video-wrapper {
              margin: 0.75rem 0;
              border-radius: 0.5rem;
            }
          }
          .aparat-video-wrapper iframe:fullscreen {
            width: 100vw;
            height: 100vh;
          }
          .aparat-video-wrapper iframe:-webkit-full-screen {
            width: 100vw;
            height: 100vh;
          }
        </style>
        <div class="video-container">
          <iframe 
            src="https://www.aparat.com/video/video/embed/videohash/${videoId}/vt/frame?titleShow=true" 
            allowFullScreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true"
            loading="lazy"
            title="آموزش تصویری مدیریت پرسنل آنتایم"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      </div>
    `;
  });
  
  return processedHtml;
};

// ========== تولید متادیتای پویا (بهینه برای سئو) ==========
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts: any[] = await query(
    `SELECT title, description, content, category, author FROM blog_posts WHERE slug = ?`,
    [slug]
  );
  const post = posts[0];

  if (!post) return { title: "مقاله پیدا نشد" };

  const baseUrl = "https://ontimeapp.ir";
  const title = `${post.title} | مجله تخصصی آنتایم`;
  const desc = post.description || `مطالعه مقاله ${post.title} در مجله نوبت‌دهی آنتایم`;
  
  const videoIds = extractVideoIds(post.content || "");
  const hasVideo = videoIds.length > 0;

  return {
    title,
    description: desc,
    keywords: [
      post.category,
      "مدیریت پرسنل",
      "سیستم نوبت دهی",
      "آنتایم",
      "اپلیکیشن نوبت دهی",
      "مدیریت کسب و کار",
    ].join(", "),
    authors: [{ name: post.author || "تحریریه آنتایم", url: baseUrl }],
    category: post.category,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": 150,
      },
    },
    openGraph: {
      title,
      description: desc,
      url: `${baseUrl}/blog/${slug}`,
      siteName: "آنتایم",
      locale: "fa_IR",
      type: "article",
      publishedTime: new Date().toISOString(),
      authors: [post.author || "تحریریه آنتایم"],
      tags: [post.category],
      ...(hasVideo && {
        videos: videoIds.map(id => `https://www.aparat.com/v/${id}`),
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      site: "@ontimeapp",
      creator: "@ontimeapp",
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
    verification: {
      google: "کد_تایید_گوگل_شما",
    },
    other: {
      "article:published_time": new Date().toISOString(),
      "article:modified_time": new Date().toISOString(),
      "article:section": post.category,
    },
  };
}

// ========== کامپوننت اصلی صفحه ==========
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ۱. دریافت مقاله اصلی
  const posts: any[] = await query(`SELECT * FROM blog_posts WHERE slug = ?`, [
    slug,
  ]);
  const post = posts[0];
  if (!post) notFound();

  // ۲. دریافت مقالات مرتبط از همان دسته‌بندی
  const relatedPosts: any[] = await query(
    `SELECT title, slug, created_at, category, description, likes FROM blog_posts 
     WHERE category = ? AND slug != ? 
     ORDER BY created_at DESC LIMIT 3`,
    [post.category, slug]
  );

  const baseUrl = "https://ontimeapp.ir";
  const formattedDate = new Date(post.created_at).toISOString();
  const modifiedDate = post.updated_at
    ? new Date(post.updated_at).toISOString()
    : formattedDate;
  const displayDate = new Date(post.created_at).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ۳. پردازش هدینگ‌ها برای TOC
  const headings: { id: string; title: string; level: number }[] = [];
  
  let processedContent = post.content || "";
  
  processedContent = processedContent.replace(
    /<h([2-3])(.*?)>([\s\S]*?)<\/h[2-3]>/gi,
    (_: any, level: string, attrs: string, html: string) => {
      const title = html.replace(/<[^>]+>/g, "").trim();
      const id = title
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      headings.push({ id, title, level: Number(level) });
      return `<h${level} id="${id}" ${attrs}>${html}</h${level}>`;
    }
  );
  
  // پردازش ویدیوهای آپارات
  processedContent = processAparatVideos(processedContent);

  // ۴. استخراج ویدیوها برای اسکیما
  const videoIds = extractVideoIds(post.content || "");
  
  // ۵. Sanitize محتوا برای امنیت
  const safeContent = DOMPurify.sanitize(processedContent, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["style", "iframe", "div", "span"],
    ADD_ATTR: ["allowfullscreen", "webkitallowfullscreen", "mozallowfullscreen", "loading", "class", "style", "src", "title", "allow"],
  });

  // ۶. ساخت آبجکت‌های ویدیویی برای اسکیما
  const videoObjects = videoIds.map((videoId, index) => ({
    "@type": "VideoObject",
    "@id": `${baseUrl}/blog/${slug}#video-${index + 1}`,
    name: `آموزش تصویری: ${post.title}`,
    description: post.description || `ویدیو آموزشی مرتبط با مقاله ${post.title} در آنتایم`,
    thumbnailUrl: `https://www.aparat.com/public/thumb/${videoId}.jpg`,
    contentUrl: `https://www.aparat.com/v/${videoId}`,
    embedUrl: `https://www.aparat.com/video/embed/videohash/${videoId}/vt/frame?titleShow=true`,
    uploadDate: formattedDate,
    duration: "PT2M30S",
    interactionCount: "0",
    publisher: {
      "@type": "Organization",
      name: "آنتایم",
      logo: {
        "@type": "ImageObject",
        url: "https://ontimeapp.ir/icons/icon-192.png",
      },
    },
  }));

  // ۷. ساختار Schema Markup نهایی (JSON-LD) - بهینه برای سئو
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${baseUrl}/blog/${slug}#article`,
        headline: post.title,
        description: post.description || post.title,
        image: "https://ontimeapp.ir/icons/icon-512.png",
        datePublished: formattedDate,
        dateModified: modifiedDate,
        author: {
          "@type": "Person",
          name: post.author || "تحریریه آنتایم",
          url: baseUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "آنتایم",
          logo: {
            "@type": "ImageObject",
            url: "https://ontimeapp.ir/icons/icon-192.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/blog/${slug}`,
        },
        keywords: `${post.category}, مدیریت پرسنل, سیستم نوبت دهی آنتایم`,
        articleSection: post.category,
        inLanguage: "fa-IR",
        ...(videoIds.length > 0 && {
          video: videoObjects.map(v => v["@id"]),
        }),
      },
      ...videoObjects,
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/blog/${slug}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: baseUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "مجله آنتایم",
            item: `${baseUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.category,
            item: `${baseUrl}/blog?category=${encodeURIComponent(post.category)}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: post.title,
            item: `${baseUrl}/blog/${slug}`,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/blog/${slug}`,
        url: `${baseUrl}/blog/${slug}`,
        name: post.title,
        isPartOf: { "@id": `${baseUrl}/blog` },
        breadcrumb: { "@id": `${baseUrl}/blog/${slug}#breadcrumb` },
      },
    ],
  };

  return (
    <div
      dir="rtl"
      className="bg-gray-50 min-h-screen font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-700"
    >
      {/* اسکیماهای JSON-LD */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />
      
      {/* اسکیما اضافی برای سازمان (بهبود سئوی برند) */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "آنتایم",
            url: baseUrl,
            logo: "https://ontimeapp.ir/icons/icon-512.png",
            sameAs: [
              "https://instagram.com/ontimeapp",
              "https://t.me/ontimeapp",
            ],
          }),
        }}
      />

      <Navigation />

      <main className="max-w-7xl mx-auto pt-24 lg:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb بصری */}
        <nav className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link
            href="/"
            className="hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
          <Link href="/blog" className="hover:text-blue-600 transition-colors">
            مجله آنتایم
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-blue-600 font-bold line-clamp-1 max-w-[150px] sm:max-w-[200px]">
            {post.category}
          </span>
        </nav>

        {/* بخش Header مقاله */}
        <header className="mb-8 sm:mb-10 lg:mb-16 bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[4rem] p-6 sm:p-8 lg:p-16 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-50 rounded-bl-full opacity-50 -z-0"></div>
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-indigo-50 rounded-tr-full opacity-50 -z-0"></div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <span className="px-3 sm:px-5 py-1 sm:py-1.5 rounded-full bg-blue-600 text-white font-black text-[8px] sm:text-[10px] tracking-widest uppercase">
                {post.category}
              </span>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-gray-400 text-[10px] sm:text-xs font-bold">
                <span className="flex items-center gap-1 sm:gap-1.5 text-slate-500">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{" "}
                  {post.reading_time || "5"} دقیقه مطالعه
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5 text-slate-500">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />{" "}
                  {(post.views || 0).toLocaleString("fa-IR")} بازدید
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-6xl font-black leading-[1.2] mb-6 sm:mb-10 text-slate-900 max-w-4xl">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 sm:gap-5 pt-6 sm:pt-8 border-t border-gray-50">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <User className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-800">
                  {post.author || "تحریریه آنتایم"}
                </p>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] sm:text-xs font-medium mt-1">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>منتشر شده در {displayDate}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* بدنه مقاله و سایدبار */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 sm:gap-8 lg:gap-16 items-start">
          <div className="flex flex-col gap-8 sm:gap-12 lg:gap-16">
            <article className="min-w-0 bg-white p-5 sm:p-8 lg:p-16 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
              <div
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-slate
                  [&_p]:text-gray-700 [&_p]:leading-[1.8rem] sm:[&_p]:leading-[2rem] lg:[&_p]:leading-[2.2rem] [&_p]:mb-6 sm:[&_p]:mb-8 [&_p]:text-[0.95rem] sm:[&_p]:text-[1rem] lg:[&_p]:text-[1.15rem] [&_p]:text-justify
                  [&_a]:text-blue-600 [&_a]:font-extrabold hover:[&_a]:underline
                  [&_ul]:list-disc [&_ul]:pr-6 sm:[&_ul]:pr-8 [&_ul]:space-y-1 sm:[&_ul]:space-y-2
                  [&_ol]:list-decimal [&_ol]:pr-6 sm:[&_ol]:pr-8 [&_ol]:space-y-1 sm:[&_ol]:space-y-2
                  [&_li]:mb-2 sm:[&_li]:mb-3 [&_li]:text-gray-700 [&_li]:text-sm sm:[&_li]:text-base
                  [&_h2]:text-2xl sm:[&_h2]:text-3xl lg:[&_h2]:text-4xl [&_h2]:font-black [&_h2]:mt-10 sm:[&_h2]:mt-12 lg:[&_h2]:mt-16 [&_h2]:mb-5 sm:[&_h2]:mb-6 lg:[&_h2]:mb-8 [&_h2]:text-slate-900 [&_h2]:scroll-mt-32 [&_h2]:border-r-4 [&_h2]:border-blue-600 [&_h2]:pr-3 sm:[&_h2]:pr-4
                  [&_h3]:text-lg sm:[&_h3]:text-xl lg:[&_h3]:text-2xl [&_h3]:font-black [&_h3]:mt-8 sm:[&_h3]:mt-10 lg:[&_h3]:mt-12 [&_h3]:mb-4 sm:[&_h3]:mb-5 lg:[&_h3]:mb-6 [&_h3]:text-slate-800 [&_h3]:scroll-mt-32
                  [&_h4]:text-base sm:[&_h4]:text-lg lg:[&_h4]:text-xl [&_h4]:font-bold [&_h4]:mt-6 sm:[&_h4]:mt-7 lg:[&_h4]:mt-8 [&_h4]:mb-3 sm:[&_h4]:mb-4 [&_h4]:text-slate-700
                  [&_blockquote]:border-r-4 sm:[&_blockquote]:border-r-8 [&_blockquote]:border-blue-600 [&_blockquote]:bg-slate-50 [&_blockquote]:py-5 sm:[&_blockquote]:py-6 lg:[&_blockquote]:py-8 [&_blockquote]:px-6 sm:[&_blockquote]:px-8 lg:[&_blockquote]:px-10 [&_blockquote]:rounded-2xl sm:[&_blockquote]:rounded-3xl [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_blockquote]:font-medium [&_blockquote]:my-6 sm:[&_blockquote]:my-8 lg:[&_blockquote]:my-10 [&_blockquote]:text-sm sm:[&_blockquote]:text-base
                  [&_img]:rounded-xl sm:[&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:my-6 sm:[&_img]:my-8
                  [&_iframe]:rounded-xl [&_iframe]:shadow-xl"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            </article>

            {/* CTA Box - بدون تغییر */}
            <div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute -bottom-10 -left-10 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -top-10 -right-10 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                <div className="text-right">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black mb-2 sm:mb-3">
                    هنوز با دفترچه نوبت‌هاتو مدیریت می‌کنی؟ 
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm lg:text-base font-medium opacity-90">
                    همین حالا به خانواده ۵۰۰۰ نفره آنتایم بپیوند و ۶۰ روز رایگان تست کن.
                  </p>
                </div>
                
                <Link 
                  href="/" 
                  className="bg-white text-blue-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm lg:text-base shadow-lg hover:bg-blue-50 hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  شروع نوبت‌دهی هوشمند
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>

            {/* مقالات مرتبط - بدون تغییر */}
            {relatedPosts.length > 0 && (
              <section className="bg-slate-100/50 p-6 sm:p-8 lg:p-12 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] border border-slate-200/50">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-8 sm:h-10 w-1 sm:w-2 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                      پیشنهاد مطالعه
                    </h3>
                  </div>
                  <Link
                    href="/blog"
                    className="text-blue-600 font-bold text-xs sm:text-sm hover:underline flex items-center gap-1 transition-all hover:gap-2"
                  >
                    مشاهده همه <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {relatedPosts.map((rPost: any) => (
                    <Link
                      key={rPost.slug}
                      href={`/blog/${rPost.slug}`}
                      className="group"
                    >
                      <div className="bg-white p-5 sm:p-6 lg:p-7 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/5 group-hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                        <div className="mb-3 sm:mb-4 overflow-hidden rounded-xl">
                          <span className="text-[8px] sm:text-[10px] font-black text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-lg">
                            {rPost.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed mb-4 sm:mb-6 flex-grow text-base sm:text-lg">
                          {rPost.title}
                        </h4>
                        <p className="text-slate-500 leading-relaxed mb-6 sm:mb-8 font-medium text-xs sm:text-sm line-clamp-3">
                          {rPost.description?.replace(/<[^>]*>/g, "") || "مطالعه این مقاله را به شما پیشنهاد می‌کنیم"}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 sm:pt-5 border-t border-gray-50 text-[8px] sm:text-[10px] text-gray-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
                            {new Date(rPost.created_at).toLocaleDateString("fa-IR")}
                          </span>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* سایدبار دسکتاپ چسبان */}
          <aside className="hidden lg:block sticky top-32">
            <BlogSidebar
              headings={headings}
              slug={slug}
              initialLikes={post.likes || 0}
            />
          </aside>
        </div>
      </main>

      {/* ابزارک‌های تعاملی موبایل */}
      <MobileToolbar
        headings={headings}
        slug={slug}
        initialLikes={post.likes || 0}
      />

      <EnhancedFooter />
    </div>
  );
}