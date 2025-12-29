import Link from 'next/link';
import { query } from '@/lib/db';
import { Calendar, Clock, ChevronLeft, Zap, Sparkles, Home } from 'lucide-react';
import Navigation from '@/components/Landing/Navigation';
import EnhancedFooter from '@/components/Landing/EnhancedFooter';
import type { Metadata } from "next";
import { blogMetadata } from '../metadata';

export const metadata: Metadata = blogMetadata;

// استفاده از force-dynamic اگر دیتابیس مرتباً آپدیت می‌شود
export const revalidate = 60; // آپدیت محتوا هر یک دقیقه (بهینه‌تر از 0)

export default async function BlogListPage() {
  // اضافه کردن بلاک try-catch برای جلوگیری از کرش در صورت مشکل دیتابیس
  let posts: any[] = [];
  try {
    posts = await query(
      `SELECT title, slug, description, created_at, reading_time, category FROM blog_posts ORDER BY created_at DESC`
    ) as any[];
  } catch (error) {
    console.error("Database error:", error);
  }

  const baseUrl = "https://ontimeapp.ir";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/blog/#collection`,
        "name": "مجله تخصصی آنتایم",
        "description": "آخرین مقالات و آموزش‌های تخصصی مدیریت کسب‌وکار و نوبت‌دهی آنلاین",
        "url": `${baseUrl}/blog`,
        "publisher": { "@id": `${baseUrl}/#organization` },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": posts.length,
          "itemListElement": posts.map((post: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${baseUrl}/blog/${post.slug}`,
            "name": post.title
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/blog/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "خانه", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "مجله آنتایم", "item": `${baseUrl}/blog` }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Navigation />
      
      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto w-full relative">
        {/* پس‌زمینه‌های تزئینی */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Breadcrumb بصری برای کاربر */}
        <nav className="flex items-center gap-2 text-gray-500 text-xs mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <Home size={14} /> خانه
          </Link>
          <ChevronLeft size={12} className="text-gray-300" />
          <span className="text-blue-600 font-bold">مجله آنتایم</span>
        </nav>

        <header className="text-center mb-20 relative">
          <div className="inline-flex items-center gap-3 py-2 px-6 rounded-full bg-blue-600 text-white font-bold text-xs mb-6 shadow-xl shadow-blue-500/20">
            <Zap size={14} className="text-amber-300" />
            <span>آموزش و رشد کسب‌وکار</span>
            <Sparkles size={14} className="text-amber-300" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            مجله تخصصی <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">آنتایم</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            راهکارهای عملی برای افزایش نوبت‌ها، مدیریت هوشمند مشتریان و رشد درآمد شما
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full">
              <article 
                className="relative bg-white rounded-[2.5rem] p-8 h-full flex flex-col border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="mb-6">
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    {post.category || 'آموزش'}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black mb-4 text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                  {post.title}
                </h2>
                
                <p className="text-slate-500 leading-relaxed mb-8 grow font-medium text-sm line-clamp-3">
                  {post.description?.replace(/<[^>]*>/g, '')}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.created_at).toLocaleDateString('fa-IR')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {post.reading_time || '۵'} دقیقه
                    </span>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-slate-300 w-10 h-10" />
            </div>
            <p className="text-xl text-slate-400 font-bold">به زودی مقالات جدید منتشر خواهند شد ✨</p>
          </div>
        )}
      </main>

      <EnhancedFooter />
    </div>
  );
}