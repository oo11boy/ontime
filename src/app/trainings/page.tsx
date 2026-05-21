import Link from 'next/link';
import { query } from '@/lib/db';
import { ChevronLeft, Zap, Sparkles, Home } from 'lucide-react';
import Navigation from '@/components/Landing/Navigation';
import EnhancedFooter from '@/components/Landing/EnhancedFooter';
import type { Metadata } from "next";
import VideoModalController from './components/VideoModalController';

export const metadata: Metadata = {
  title: "آموزش‌های ویدیویی آنتایم | دوره‌های تخصصی مدیریت کسب‌وکار",
  description: "مجموعه کامل آموزش‌های ویدیویی مدیریت نوبت‌دهی، افزایش فروش و بهینه‌سازی کسب‌وکار شما",
};

export const revalidate = 3600;

async function getVideoTrainings() {
  try {
    const trainings = await query(
      `SELECT id, title, subtitle, video_url, cover_image, duration, category, view_count, created_at
       FROM video_trainings 
       WHERE is_active = 1
       ORDER BY order_index ASC, created_at DESC`
    ) as any[];
    
    return trainings;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export default async function VideoTrainingsPage() {
  const trainings = await getVideoTrainings();
  const baseUrl = "https://ontimeapp.ir";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/trainings/#collection`,
        "name": "آموزش‌های ویدیویی آنتایم",
        "description": "دوره‌های آموزشی ویدیویی تخصصی برای مدیریت کسب‌وکار",
        "url": `${baseUrl}/trainings`,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": trainings.length,
          "itemListElement": trainings.map((training: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${baseUrl}/trainings/${training.id}`,
            "name": training.title
          }))
        }
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

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-gray-500 text-xs mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <Home size={14} /> خانه
          </Link>
          <ChevronLeft size={12} className="text-gray-300" />
          <span className="text-blue-600 font-bold">آموزش‌های ویدیویی</span>
        </nav>

        <header className="text-center mb-20 relative">
          <div className="inline-flex items-center gap-3 py-2 px-6 rounded-full bg-blue-600 text-white font-bold text-xs mb-6 shadow-xl shadow-blue-500/20">
            <Zap size={14} className="text-amber-300" />
            <span>دوره‌های آموزشی حرفه‌ای</span>
            <Sparkles size={14} className="text-amber-300" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            آموزش‌های <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">ویدیویی</span> آنتایم
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            با تماشای دوره‌های آموزشی ما، کسب‌وکار خود را متحول کنید و فروش خود را چندین برابر کنید
          </p>
        </header>

        {/* کامپوننت کلاینت کنترلر */}
        <VideoModalController trainings={trainings} />
      </main>

      <EnhancedFooter />
    </div>
  );
}