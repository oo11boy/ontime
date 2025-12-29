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

// --- تولید متادیتای پویا برای گوگل و شبکه‌های اجتماعی ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts: any[] = await query(
    `SELECT title, description FROM blog_posts WHERE slug = ?`,
    [slug]
  );
  const post = posts[0];

  if (!post) return { title: "مقاله پیدا نشد" };

  const baseUrl = "https://ontimeapp.ir";
  const title = `${post.title} | مجله تخصصی آنتایم`;
  const desc =
    post.description || `مطالعه مقاله ${post.title} در مجله نوبت‌دهی آنتایم`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${baseUrl}/blog/${slug}`,
      siteName: "آنتایم",
      locale: "fa_IR",
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
  };
}

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
    `SELECT title, slug, created_at, category ,description FROM blog_posts 
     WHERE category = ? AND slug != ? 
     ORDER BY created_at DESC LIMIT 3`,
    [post.category, slug]
  );

  const baseUrl = "https://ontimeapp.ir";
  const formattedDate = new Date(post.created_at).toISOString();
  const displayDate = new Date(post.created_at).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ۳. پردازش هدینگ‌ها برای TOC و اسکرول داخلی
  const headings: { id: string; title: string; level: number }[] = [];
  const contentWithIds = post.content.replace(
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

  const safeContent = DOMPurify.sanitize(contentWithIds, {
    USE_PROFILES: { html: true },
  });

  // ۴. ساختار Schema Markup (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${baseUrl}/blog/${slug}#article`,
        headline: post.title,
        description: post.description || post.title,
        image: `../icons/icon-192.png`,
        datePublished: formattedDate,
        dateModified: post.updated_at
          ? new Date(post.updated_at).toISOString()
          : formattedDate,
        author: {
          "@type": "Person",
          name: post.author || "تحریریه آنتایم",
          url: baseUrl,
        },
        publisher: { "@id": `${baseUrl}/#organization` },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/blog/${slug}`,
        },
      },
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
            item: `${baseUrl}/blog?category=${post.category}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: post.title,
            item: `${baseUrl}/blog/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div
      dir="rtl"
      className="bg-gray-50 min-h-screen font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-700"
    >
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto pt-24 lg:pt-32 pb-20 px-6">
        {/* Breadcrumb بصری */}
        <nav className="flex items-center gap-2 text-gray-500 text-[10px] md:text-xs mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
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
          <span className="text-blue-600 font-bold">{post.category}</span>
        </nav>

        {/* بخش Header مقاله */}
        <header className="mb-10 lg:mb-16 bg-white border border-gray-100 rounded-[2rem] lg:rounded-[4rem] p-8 lg:p-16 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 -z-0"></div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-5 py-1.5 rounded-full bg-blue-600 text-white font-black text-[10px] tracking-widest uppercase">
                {post.category}
              </span>
              <div className="flex items-center gap-5 text-gray-400 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-4 h-4 text-blue-500" />{" "}
                  {post.reading_time} دقیقه مطالعه
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Eye className="w-4 h-4 text-blue-500" />{" "}
                  {post.views?.toLocaleString("fa-IR")} بازدید
                </span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-6xl font-black leading-[1.2] mb-10 text-slate-900 max-w-4xl">
              {post.title}
            </h1>

            <div className="flex items-center gap-5 pt-8 border-t border-gray-50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <User className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-black text-slate-800">
                  {post.author || "تحریریه آنتایم"}
                </p>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>منتشر شده در {displayDate}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* بدنه مقاله و سایدبار */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-16 items-start">
          <div className="flex flex-col gap-16">
            <article className="min-w-0 bg-white p-8 lg:p-16 rounded-[2.5rem] border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
              <div
                className="prose prose-lg max-w-none prose-slate
                  [&_p]:text-gray-700 [&_p]:leading-[2.2rem] [&_p]:mb-8 [&_p]:text-[1.15rem] [&_p]:text-justify
                  [&_a]:text-blue-600 [&_a]:font-extrabold hover:[&_a]:underline
                  [&_ul]:list-disc [&_ul]:pr-8 [&_ol]:list-decimal [&_ol]:pr-8 [&_li]:mb-3
                  [&_h2]:text-3xl lg:[&_h2]:text-4xl [&_h2]:font-black [&_h2]:mt-16 [&_h2]:mb-8 [&_h2]:text-slate-900 [&_h2]:scroll-mt-32 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3
                  [&_h3]:text-xl lg:[&_h3]:text-2xl [&_h3]:font-black [&_h3]:mt-12 [&_h3]:mb-6 [&_h3]:text-slate-800 [&_h3]:scroll-mt-32
                  [&_blockquote]:border-r-8 [&_blockquote]:border-blue-600 [&_blockquote]:bg-slate-50 [&_blockquote]:py-8 [&_blockquote]:px-10 [&_blockquote]:rounded-3xl [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_blockquote]:font-medium [&_blockquote]:my-10"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            </article>
{/* CTA Box داخل محتوا یا انتهای مقاله */}
<div className="mt-12 p-8 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
  {/* دایره‌های تزئینی پس‌زمینه */}
  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
  
  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
    <div className="text-right">
      <h3 className="text-xl lg:text-2xl font-black mb-3">
        هنوز با دفترچه نوبت‌هاتو مدیریت می‌کنی؟ 
      </h3>
      <p className="text-blue-100 text-sm lg:text-base font-medium opacity-90">
        همین حالا به خانواده ۵۰۰۰ نفره آنتایم بپیوند و ۶۰ روز رایگان تست کن.
      </p>
    </div>
    
    <Link 
      href="../" 
      className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm lg:text-base shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 whitespace-nowrap"
    >
      شروع نوبت‌دهی هوشمند
      <ChevronLeft className="w-5 h-5" />
    </Link>
  </div>
</div>
            {/* مقالات مرتبط */}
            {relatedPosts.length > 0 && (
              <section className="bg-slate-100/50 p-8 lg:p-12 rounded-[3rem] border border-slate-200/50">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-2 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 italic">
                      پیشنهاد مطالعه
                    </h3>
                  </div>
                  <Link
                    href="/blog"
                    className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                  >
                    مشاهده همه <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedPosts.map((rPost: any) => (
                    <Link
                      key={rPost.slug}
                      href={`/blog/${rPost.slug}`}
                      className="group"
                    >
                      <div className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/5 group-hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                        <div className="mb-4 overflow-hidden rounded-xl">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                            {rPost.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed mb-6 flex-grow text-lg">
                          {rPost.title}
                        </h4>
                        <p className="text-slate-500 leading-relaxed mb-8 grow font-medium text-sm line-clamp-3">
                          {rPost.description?.replace(/<[^>]*>/g, "")}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50 text-[10px] text-gray-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{" "}
                            {new Date(rPost.created_at).toLocaleDateString(
                              "fa-IR"
                            )}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
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
