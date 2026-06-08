import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Scissors, Sparkles, Stethoscope, Dumbbell, UtensilsCrossed, Calendar, MessageSquare, Users, ArrowLeft, Brain, Globe } from "lucide-react";
import Script from "next/script";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import Navigation from "@/components/Landing/Navigation";

export const metadata: Metadata = {
  title: "راهکارهای تخصصی آنتایم برای صنایع مختلف | نوبت‌دهی هوشمند",
  description:
    "آنتایم راهکارهای تخصصی نوبت‌دهی و مدیریت مشتریان را برای آرایشگاه‌ها، سالن‌های زیبایی، ناخن‌کاران، پزشکان، روانشناسان، باشگاه‌های ورزشی و رستوران‌ها ارائه می‌دهد. سیستم هوشمند و تحت وب.",
  keywords: [
    "نوبت دهی آرایشگاه",
    "مدیریت سالن زیبایی",
    "نوبت دهی ناخن کار",
    "نرم افزار مدیریت مطب",
    "سیستم نوبت دهی پزشکان",
    "رزرو آنلاین باشگاه ورزشی",
    "رزرو میز رستوران",
    "نرم افزار نوبت دهی باشگاه",
    "نرم افزار نوبت دهی روانشناس",
    "ساخت صفحه اختصاصی نوبت دهی",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries",
  },
  openGraph: {
    title: "راهکارهای تخصصی آنتایم برای صنایع مختلف",
    description:
      "مدیریت هوشمند نوبت‌ها و مشتریان در هر صنفی. با آنتایم، کسب‌وکار خود را متحول کنید.",
    url: "https://ontimeapp.ir/industries",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/industries-og.jpg",
        width: 1200,
        height: 630,
        alt: "راهکارهای تخصصی آنتایم برای صنایع مختلف",
      },
    ],
  },
};

// صنایع تخصصی آنتایم
const industries = [
  {
    slug: "beauty-salon",
    title: "آرایشگاه و سالن زیبایی",
    shortTitle: "سالن زیبایی",
    description:
      "مدیریت حرفه‌ای نوبت‌های خدمات زیبایی، کاشت ناخن، ترمیم و ژلیش. کاهش کنسلی با پیامک یادآوری خودکار.",
    icon: <Scissors size={48} className="text-pink-500" />,
    bgColor: "from-pink-50 to-white",
    borderColor: "hover:border-pink-200",
    iconBg: "bg-pink-50",
    href: "/industries/beauty-salon",
    features: [
      "تعریف نامحدود خدمات و قیمت",
      "پرونده الکترونیک مشتریان",
      "لیست سیاه مشتریان بدقول",
      "ارسال خودکار پیامک یادآوری",
    ],
    isReady: true,
  },
  {
    slug: "nail-artist",
    title: "ناخن‌کار و خدمات کاشت ناخن",
    shortTitle: "ناخن‌کاران",
    description:
      "سیستم تخصصی مدیریت نوبت‌های کاشت، ترمیم و ژلیش. یادآوری هوشمند زمان ترمیم به کلاینت‌ها.",
    icon: <Sparkles size={48} className="text-rose-500" />,
    bgColor: "from-rose-50 to-white",
    borderColor: "hover:border-rose-200",
    iconBg: "bg-rose-50",
    href: "/industries/nail-artist",
    features: [
      "یادآوری خودکار نوبت ترمیم",
      "سوابق کامل کاشت و ژلیش",
      "تفکیک خدمات (کاشت، ترمیم، ژلیش)",
      "لینک اختصاصی برای هر مشتری",
    ],
    isReady: true,
  },
  {
    slug: "medical",
    title: "پزشکان و کلینیک‌ها",
    shortTitle: "مراکز درمانی",
    description:
      "مدیریت هوشمند نوبت‌های مطب و کلینیک. کاهش زمان انتظار بیماران و ارسال خودکار پیامک تایید و یادآوری.",
    icon: <Stethoscope size={48} className="text-blue-500" />,
    bgColor: "from-blue-50 to-white",
    borderColor: "hover:border-blue-200",
    iconBg: "bg-blue-50",
    href: "/industries/doctors",
    features: [
      "مدیریت چند پزشک و متخصص",
      "نوبت‌دهی آنلاین بیماران",
      "پیامک یادآوری نوبت ویزیت",
      "تاریخچه پزشکی بیماران",
      "کاهش ۸۰ درصدی کنسلی",
    ],
    isReady: true,
  },
  {
    slug: "fitness",
    title: "باشگاه‌های ورزشی",
    shortTitle: "باشگاه ورزشی",
    description:
      "رزرو آنلاین کلاس‌های گروهی بدنسازی، یوگا و کراس فیت و مدیریت ظرفیت سالن‌های ورزشی.",
    icon: <Dumbbell size={48} className="text-emerald-500" />,
    bgColor: "from-emerald-50 to-white",
    borderColor: "hover:border-emerald-200",
    iconBg: "bg-emerald-50",
    href: "/industries/gym",
    features: [
      "رزرو کلاس‌های گروهی",
      "مدیریت مربیان و برنامه‌ها",
      "ظرفیت‌سازی هوشمند",
      "پیامک تایید و یادآوری تمرین",
      "کاهش ۸۰ درصدی کنسلی",
    ],
    isReady: true,
  },
  {
    slug: "consulting",
    title: "مشاوره و روانشناسی",
    shortTitle: "مراکز مشاوره",
    description:
      "مدیریت هوشمند جلسات مشاوره و روانشناسی. جلوگیری از تداخل جلسات و پیامک یادآوری خودکار.",
    icon: <Brain size={48} className="text-indigo-500" />,
    bgColor: "from-indigo-50 to-white",
    borderColor: "hover:border-indigo-200",
    iconBg: "bg-indigo-50",
    href: "/industries/consulting",
    features: [
      "مدیریت چند مشاور و روانشناس",
      "نوبت‌دهی آنلاین مراجعان",
      "یادآوری خودکار جلسات",
      "تاریخچه مشاوره‌ها",
      "کاهش ۸۰ درصدی کنسلی",
    ],
    isReady: true,
  },
  {
    slug: "custom-booking",
    title: "ساخت صفحه اختصاصی نوبت دهی",
    shortTitle: "صفحه اختصاصی",
    description:
      "یک صفحه اختصاصی کامل برای کسب‌وکارتان با لینک یکتا، گالری نمونه کار، لیست خدمات با قیمت و نظرات مشتریان.",
    icon: <Globe size={48} className="text-cyan-500" />,
    bgColor: "from-cyan-50 to-white",
    borderColor: "hover:border-cyan-200",
    iconBg: "bg-cyan-50",
    href: "/industries/custom-booking-page",
    features: [
      "لینک اختصاصی یکتا",
      "گالری نمونه کارها",
      "لیست خدمات با قیمت",
      "نظرات و امتیازدهی مشتریان",
      "تغییر و لغو نوبت توسط مشتری",
    ],
    isReady: true,
  },
  {
    slug: "restaurant",
    title: "رستوران و کافه",
    shortTitle: "رستوران و کافه",
    description:
      "رزرو آنلاین میز و مدیریت ظرفیت سالن در روزهای شلوغ و ایام خاص.",
    icon: <UtensilsCrossed size={48} className="text-orange-500" />,
    bgColor: "from-orange-50 to-white",
    borderColor: "hover:border-orange-200",
    iconBg: "bg-orange-50",
    href: "#",
    features: [
      "رزرو آنلاین میز",
      "مدیریت ظرفیت سالن",
      "پیش‌سفارش غذا",
      "یادآوری نوبت مشتری",
    ],
    isReady: false,
  },
  {
    slug: "education",
    title: "آموزشگاه‌ها",
    shortTitle: "مراکز آموزشی",
    description:
      "مدیریت کلاس‌ها و دوره‌های آموزشی. ثبت‌نام آنلاین و رزرو نوبت مشاوره.",
    icon: <Calendar size={48} className="text-purple-500" />,
    bgColor: "from-purple-50 to-white",
    borderColor: "hover:border-purple-200",
    iconBg: "bg-purple-50",
    href: "#",
    features: [
      "مدیریت دوره‌ها و کلاس‌ها",
      "ثبت‌نام آنلاین",
      "رزرو نوبت مشاوره",
      "گواهی‌های الکترونیک",
    ],
    isReady: false,
  },
  {
    slug: "legal",
    title: "وکلا و دفاتر حقوقی",
    shortTitle: "دفاتر حقوقی",
    description:
      "مدیریت وقت‌های ملاقات موکلان و جلوگیری از تداخل زمانی مشاوره‌ها.",
    icon: <Users size={48} className="text-slate-500" />,
    bgColor: "from-slate-50 to-white",
    borderColor: "hover:border-slate-200",
    iconBg: "bg-slate-50",
    href: "#",
    features: [
      "مدیریت نوبت موکلان",
      "یادآوری خودکار جلسات",
      "پرونده موکلان",
      "تقویم کاری وکلا",
    ],
    isReady: false,
  },
  {
    slug: "beauty-hair",
    title: "لاین‌های تخصصی زیبایی",
    shortTitle: "زیبایی تخصصی",
    description:
      "ویژه ناخن‌کاران، مژه‌کاران، آرایشگران و خدمات تخصصی با لینک اختصاصی رزرو.",
    icon: <Sparkles size={48} className="text-amber-500" />,
    bgColor: "from-amber-50 to-white",
    borderColor: "hover:border-amber-200",
    iconBg: "bg-amber-50",
    href: "#",
    features: [
      "لینک اختصاصی رزرو",
      "مدیریت ترکیب رنگ و مواد",
      "یادآوری ترمیم",
      "سوابق کامل خدمات",
    ],
    isReady: false,
  },
];

// اسکیما برای صفحه فهرست صنایع
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://ontimeapp.ir/industries#collection",
  name: "راهکارهای تخصصی آنتایم برای صنایع مختلف",
  description:
    "آنتایم راهکارهای نوبت‌دهی و مدیریت مشتریان را برای اصناف مختلف ارائه می‌دهد.",
  url: "https://ontimeapp.ir/industries",
  publisher: {
    "@type": "Organization",
    name: "آنتایم",
    url: "https://ontimeapp.ir",
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: industries.filter((i) => i.isReady).length,
    itemListElement: industries
      .filter((i) => i.isReady)
      .map((industry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: industry.title,
          url: `https://ontimeapp.ir${industry.href}`,
          description: industry.description,
        },
      })),
  },
};

export default function IndustriesPage() {
  const readyIndustries = industries.filter((i) => i.isReady);
  const comingSoonIndustries = industries.filter((i) => !i.isReady);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* اسکیما */}
      <Script
        id="industries-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
        strategy="afterInteractive"
      />
      {/* ناوبری اصلی سایت */}
      <Navigation />
      {/* هدر صفحه */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 md:mb-6 text-slate-900 leading-tight">
            راهکارهای تخصصی{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              آنتایم برای صنایع مختلف
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            آنتایم یک پلتفرم منعطف و حرفه‌ای است که برای هر صنفی، امکانات تخصصی
            مدیریت نوبت و مشتریان را فراهم می‌کند.
          </p>
        </div>
      </section>

      {/* صنایع آماده */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8 md:mb-12">
            <div className="w-8 sm:w-10 md:w-12 h-1 bg-emerald-500 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800">
              صفحات اختصاصی کسب و کار ها
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6 lg:gap-8">
            {readyIndustries.map((industry) => (
              <Link
                key={industry.slug}
                href={industry.href}
                className={`group relative bg-gradient-to-br ${industry.bgColor} rounded-2xl md:rounded-3xl border-2 border-slate-100 ${industry.borderColor} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-5 md:p-6 lg:p-8 xl:p-10">
                  <div className="flex items-start justify-between mb-4 md:mb-6">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${industry.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}
                    >
                      {industry.icon}
                    </div>
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 text-[8px] md:text-[10px] font-black rounded-full">
                      فعال
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 md:mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">
                    {industry.title}
                  </h3>
                  <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-4 md:mb-6">
                    {industry.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                    {industry.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] md:text-[10px] font-bold bg-slate-100 text-slate-600 px-2 md:px-3 py-1 md:py-1.5 rounded-full"
                      >
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100">
                    <span className="text-blue-600 font-bold text-xs md:text-sm group-hover:gap-2 transition-all flex items-center gap-1">
                      مشاهده جزئیات{" "}
                      <ArrowLeft
                        size={12}
                        className="group-hover:-translate-x-1 transition-transform md:w-3.5 md:h-3.5"
                      />
                    </span>
                    <svg
                      className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-slate-100 group-hover:scale-110 transition-transform"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* صنایع در دست توسعه */}
      <section className="py-16 lg:py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8 md:mb-12">
            <div className="w-8 sm:w-10 md:w-12 h-1 bg-amber-500 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800">
              سایر اصناف
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
            {comingSoonIndustries.map((industry) => (
              <div
                key={industry.slug}
                className={`relative bg-gradient-to-br ${industry.bgColor} rounded-xl md:rounded-2xl border border-slate-200 opacity-80 transition-all duration-300`}
              >
                <div className="p-4 md:p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 ${industry.iconBg} rounded-lg md:rounded-xl flex items-center justify-center`}
                    >
                      {industry.icon}
                    </div>
                    <span className="px-1.5 md:px-2 py-0.5 bg-slate-200 text-slate-500 text-[7px] md:text-[8px] font-black rounded-full">
                      به‌زودی
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-black mb-1 md:mb-2 text-slate-700">
                    {industry.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {industry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EnhancedFooter/>
    </div>
  );
}