// app/industries/gym/page.tsx
import { Metadata } from "next";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import GymHero from "./components/GymHero";
import GymStats from "./components/GymStats";
import GymFeatures from "./components/GymFeatures";
import GymStepFlow from "./components/GymStepFlow";
import GymComparison from "./components/GymComparison";
import GymSmsNotify from "./components/GymSmsNotify";
import PricingSection from "@/components/Landing/PricingSection";
import GymFAQ from "./components/GymFAQ";
import GymFinalCTA from "./components/GymFinalCTA";
import GymNavigation from "./components/GymNavigation";
import Script from "next/script";
import Link from "next/link";
import { Home, ChevronLeft } from "lucide-react";
import BeautyGallery from "../beauty-salon/components/BeautyGallery";

// ========== متادیتا (بهینه شده برای باشگاه ورزشی) ==========
export const metadata: Metadata = {
  title: "نرم افزار نوبت دهی باشگاه بدنسازی ★ ۲ هفته رایگان | آنتایم",
  description:
    "مدیریت نوبت کلاس‌های ورزشی و رزرو مربی با نرم افزار آنتایم. پیامک یادآوری خودکار جلسات تمرینی، لینک اختصاصی برای اعضا و ۲ هفته رایگان. کاهش ۸۰ درصدی کنسلی.",
  keywords: [
    "نرم افزار نوبت دهی باشگاه بدنسازی",
    "سیستم رزرو کلاس ورزشی",
    "مدیریت نوبت مربی ورزشی",
    "اپلیکیشن نوبت دهی باشگاه",
    "پیامک یادآوری جلسه تمرینی",
    "نرم افزار مدیریت باشگاه ورزشی",
    "رزرو آنلاین کلاس بدنسازی",
    "لینک اختصاصی رزرو باشگاه",
    "کاهش کنسلی کلاس ورزشی",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries/gym",
  },
  openGraph: {
    title: "نرم افزار نوبت دهی باشگاه بدنسازی ★ ۲ هفته رایگان",
    description:
      "مدیریت هوشمند نوبت کلاس‌های ورزشی و رزرو مربی با سیستم پیامک یادآوری خودکار. صفحه اختصاصی برای هر باشگاه. شروع ۲ هفته رایگان.",
    url: "https://ontimeapp.ir/industries/gym",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/screens/gym-appointment.jpg",
        width: 1200,
        height: 630,
        alt: "نرم افزار نوبت دهی باشگاه بدنسازی آنتایم - پنل مدیریت تخصصی باشگاه",
      },
    ],
  },
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
};

export default function GymLanding() {
  const baseUrl = "https://ontimeapp.ir";

  // ========== اسکیماهای جامع (۸ عدد) ==========

  // 1. WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "آنتایم",
    alternateName: ["OnTime", "نرم افزار آنتایم", "سیستم نوبت دهی آنتایم"],
    description: "هوشمندترین نرم افزار نوبت دهی آنلاین برای باشگاه‌های بدنسازی و ورزشی",
    inLanguage: "fa-IR",
  };

  // 2. SoftwareApplication Schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/industries/gym#software`,
    name: "نرم افزار نوبت دهی باشگاه بدنسازی آنتایم",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    url: `${baseUrl}/industries/gym`,
    description:
      "نرم افزار تخصصی نوبت دهی باشگاه‌های بدنسازی و ورزشی با قابلیت ارسال پیامک یادآوری خودکار جلسات تمرینی، لینک اختصاصی مدیریت نوبت اعضا و ۲ هفته استفاده رایگان",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IRR",
      availability: "https://schema.org/InStock",
      description: "۲ هفته اشتراک رایگان برای شروع",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "320",
    },
    featureList: [
      "ارسال خودکار پیامک یادآوری جلسه تمرینی",
      "لینک اختصاصی رزرو کلاس برای اعضا",
      "پرونده الکترونیک اعضا با سوابق تمرین",
      "لیست سیاه اعضای بدقول",
      "مدیریت چندین مربی و کلاس",
      "تقویم شمسی هوشمند باشگاه",
      "کاهش ۸۰ درصدی کنسلی کلاس‌ها",
    ],
  };

  // 3. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "آنتایم",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/icons/icon-512.png`,
    },
    sameAs: [
      "https://instagram.com/ontimeapp.ir",
      "https://t.me/ontime_sup",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+989981394832",
      contactType: "customer service",
      availableLanguage: "Persian",
    },
  };

  // 4. Service Schema (تخصصی باشگاه)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "نرم افزار تخصصی نوبت دهی و مدیریت باشگاه ورزشی",
    provider: {
      "@type": "Organization",
      name: "آنتایم",
    },
    areaServed: "IR",
    audience: {
      "@type": "Audience",
      name: "مدیران باشگاه‌های بدنسازی، مربیان ورزشی",
    },
    description:
      "راهکار جامع دیجیتال برای باشگاه‌های ورزشی جهت مدیریت نوبت کلاس‌ها، رزرو مربی و ارسال پیامک خودکار یادآوری با ۲ هفته استفاده رایگان.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "امکانات تخصصی باشگاه",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پیامک یادآوری خودکار جلسه تمرینی" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پرونده الکترونیک سوابق تمرین عضو" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لیست سیاه اعضای بدقول" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لینک اختصاصی رزرو کلاس بدون تماس تلفنی" } },
      ],
    },
  };

  // 5. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}/industries/gym#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "صنایع", item: `${baseUrl}/#industries` },
      { "@type": "ListItem", position: 3, name: "نرم افزار نوبت دهی باشگاه بدنسازی", item: `${baseUrl}/industries/gym` },
    ],
  };

  // 6. Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "نرم افزار نوبت دهی باشگاه بدنسازی آنتایم",
    description: "نرم افزار حرفه‌ای مدیریت نوبت کلاس‌های ورزشی و رزرو مربی ویژه باشگاه‌های بدنسازی",
    brand: { "@type": "Brand", name: "آنتایم" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IRR",
      availability: "https://schema.org/InStock",
      description: "۲ هفته استفاده رایگان",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "320",
    },
  };

  // 7. LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "سیستم نوبت دهی تخصصی باشگاه بدنسازی آنتایم",
    description: "راهکار مدیریت هوشمند نوبت کلاس‌های ورزشی و رزرو مربی برای باشگاه‌های بدنسازی",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">
      {/* تزریق تمام اسکیماها */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="localbusiness-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        strategy="afterInteractive"
      />

      <GymNavigation />

      <main>
        {/* ========== Breadcrumb بصری ========== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-32">
          <nav className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link
              href="/"
              className="hover:text-emerald-600 flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              خانه
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <Link
              href="/#industries"
              className="hover:text-emerald-600 transition-colors"
            >
              صنایع
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-emerald-600 font-bold line-clamp-1 max-w-[200px] sm:max-w-[280px]">
              نرم افزار نوبت دهی باشگاه بدنسازی
            </span>
          </nav>
        </div>

        <GymHero />
        <GymStats />
        <GymFeatures />
        
        {/* گالری با تم باشگاه ورزشی */}
        <BeautyGallery
          accentColor="emerald"
          industry="gym"
          title={
            <>
              نمای داخلی <span className="text-emerald-500">نرم افزار نوبت دهی باشگاه</span>
            </>
          }
          description="طراحی ساده و حرفه‌ای برای مدیریت هوشمند نوبت کلاس‌های ورزشی و رزرو مربی. تمام آنچه یک باشگاه بدنسازی نیاز دارد."
        />
        
        <GymStepFlow />
        <GymComparison />
        <GymSmsNotify />
        <PricingSection />
        <GymFAQ />
        <GymFinalCTA />
      </main>

      <EnhancedFooter />
    </div>
  );
}