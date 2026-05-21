import { Metadata } from "next";
import Link from "next/link";
import {
  Play,
  Clock,
  Eye,
  Calendar,
  Sparkles,
  ChevronLeft,
  Home,
  Youtube,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import Script from "next/script";
import Navigation from "@/components/Landing/Navigation";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import TrainingsClient from "./components/TrainingsClient";

export const revalidate = 3600; // 1 ساعت

export const metadata: Metadata = {
  title: "آموزش‌های ویدیویی آنتایم | یادگیری مدیریت نوبت‌دهی و کسب‌وکار",
  description:
    "مجموعه‌ای از آموزش‌های ویدیویی رایگان برای مدیریت هوشمند نوبت‌دهی، جذب مشتری و افزایش درآمد کسب‌وکار شما. مناسب آرایشگاه‌ها، ناخن‌کاران، پزشکان و تمام مشاغل خدماتی.",
  keywords: [
    "آموزش نوبت دهی آنلاین",
    "آموزش مدیریت آرایشگاه",
    "آموزش ناخن کار",
    "ویدیو آموزشی آنتایم",
    "مدیریت کسب و کار",
    "یادگیری نرم افزار نوبت دهی",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/trainings",
  },
  openGraph: {
    title: "آموزش‌های ویدیویی رایگان آنتایم",
    description:
      "با تماشای ویدیوهای آموزشی، کسب‌وکار خود را هوشمند مدیریت کنید.",
    url: "https://ontimeapp.ir/trainings",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/trainings-og.jpg",
        width: 1200,
        height: 630,
        alt: "آموزش‌های ویدیویی آنتایم",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// تابع دریافت آموزش‌ها از API جدید
async function getTrainings() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ontimeapp.ir";

  try {
    const res = await fetch(`${baseUrl}/api/trainings`, {
      next: { revalidate: 3600 },
      cache: "force-cache",
    });
    const data = await res.json();
    return data.trainings || [];
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return [];
  }
}

// تابع تبدیل ثانیه به فرمت خوانا
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// اسکیماهای صفحه
const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://ontimeapp.ir/trainings#collection",
  name: "آموزش‌های ویدیویی آنتایم",
  description: "مجموعه آموزش‌های ویدیویی رایگان برای مدیریت هوشمند کسب‌وکار",
  url: "https://ontimeapp.ir/trainings",
  publisher: {
    "@type": "Organization",
    name: "آنتایم",
    url: "https://ontimeapp.ir",
    logo: {
      "@type": "ImageObject",
      url: "https://ontimeapp.ir/icons/icon-512.png",
    },
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://ontimeapp.ir/trainings#breadcrumb",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "خانه",
      item: "https://ontimeapp.ir",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "آموزش‌ها",
      item: "https://ontimeapp.ir/trainings",
    },
  ],
};

export default async function TrainingsPage() {
  const trainings = await getTrainings();

  // آمار کلی
  const totalViews = trainings.reduce(
    (acc: number, t: any) => acc + (t.view_count || 0),
    0,
  );
  const totalVideos = trainings.length;

  // سریالایز داده‌ها برای کلاینت
  const serializedTrainings = trainings.map((t: any) => ({
    id: t.id,
    title: t.title,
    subtitle: t.subtitle,
    video_url: t.video_url,
    cover_image: t.cover_image,
    duration: t.duration,
    view_count: t.view_count,
    created_at: t.created_at,
  }));

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      dir="rtl"
    >
      {/* ========== اسکیماها ========== */}
      <Script
        id="collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />

      {/* ========== هدر اصلی ========== */}
      <Navigation />

      {/* ========== Breadcrumb ========== */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-4">
        <nav className="flex items-center gap-2 text-gray-500 text-xs">
          <Link
            href="/"
            className="hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <Home size={14} />
            خانه
          </Link>
          <ChevronLeft size={12} className="text-gray-300" />
          <span className="text-blue-600 font-bold">آموزش‌های ویدیویی</span>
        </nav>
      </div>

      {/* ========== هدر صفحه ========== */}
      <section className="relative py-20 overflow-hidden">
        {/* المان‌های تزئینی */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-transparent to-transparent -z-10"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs mb-6 shadow-lg shadow-blue-200 animate-in fade-in slide-in-from-top-5 duration-500">
            <Sparkles size={14} />
            آموزش‌های رایگان
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 text-slate-900 leading-tight animate-in fade-in slide-in-from-bottom-5 duration-500">
            فیلم‌های آموزشی
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              اپلیکیشن نوبت دهی آنتایم
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in duration-700">
            با تماشای این ویدیوها، با امکانات آنتایم آشنا شوید و کسب‌وکار خود را
            هوشمندانه مدیریت کنید.
          </p>
        </div>
      </section>

      {/* ========== لیست آموزش‌ها ========== */}
      <section className="py-12 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          {trainings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                آموزشی یافت نشد
              </h3>
              <p className="text-slate-500">
                به زودی آموزش‌های بیشتری اضافه می‌شود.
              </p>
              <Link
                href="/clientdashboard"
                className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                شروع تست رایگان
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serializedTrainings.map((training: any, index: number) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>



      {/* ========== فوتر ========== */}
      <EnhancedFooter />

      {/* کامپوننت کلاینت (مودال) */}
      <TrainingsClient trainings={serializedTrainings} />
    </div>
  );
}

// ========== کارت ویدیو (سمت سرور) ==========
function TrainingCard({ training, index }: { training: any; index: number }) {
  // استخراج تصویر بندانگشتی
  const getThumbnail = () => {
    if (training.cover_image) return training.cover_image;
    const match = training.video_url?.match(/v\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://www.aparat.com/public/thumb/${match[1]}.jpg`;
    }
    return null;
  };

  const thumbnail = getThumbnail();

  return (
    <div
      className="training-card group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      data-video-id={training.id}
      data-video-url={training.video_url}
      data-video-title={training.title}
      data-video-subtitle={training.subtitle}
      data-video-cover={thumbnail}
      data-video-views={training.view_count}
      data-video-date={training.created_at}
      data-video-duration={training.duration}
    >
      {/* تصویر بندانگشتی */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={training.title}
            loading={index < 3 ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <Play size={48} className="text-white/40" />
          </div>
        )}

        {/* اوورلی دکمه پخش */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-500 shadow-xl">
            <Play size={32} className="text-white mr-1" />
          </div>
        </div>
      </div>

      {/* محتوای کارت */}
      <div className="p-5">
        <h3 className="font-black text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-base lg:text-lg">
          {training.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {training.subtitle}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Eye size={11} />
            <span>
              {training.view_count?.toLocaleString("fa-IR") || 0} بازدید
            </span>
          </div>
          <div className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
            تماشا کن
            <ChevronLeft
              size={12}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
