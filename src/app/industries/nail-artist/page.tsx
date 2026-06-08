import { Metadata } from "next";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import NailArtistHero from "./components/NailArtistHero";
import NailStats from "./components/NailStats";
import NailFeatures from "./components/NailFeatures";
import NailStepFlow from "./components/NailStepFlow";
import NailComparison from "./components/NailComparison";
import NailSmsNotify from "./components/NailSmsNotify";
import PricingSection from "@/components/Landing/PricingSection";
import NailFAQ from "./components/NailFAQ";
import NailFinalCTA from "./components/NailFinalCTA";
import NailNavigation from "./components/NailNavigation";
import Script from "next/script";
import Link from "next/link";
import { Home, ChevronLeft } from "lucide-react";
import BeautyGallery from "../beauty-salon/components/BeautyGallery";

// ========== متادیتا (بهینه شده برای سئوی ناخن‌کاران) ==========
export const metadata: Metadata = {
  title: "نرم افزار نوبت دهی ناخن کار و کاشت ناخن ★ ۲ هفته رایگان | آنتایم",
  description:
    "مدیریت نوبت کاشت، ترمیم و ژلیش ناخن با نرم افزار آنتایم. پیامک یادآوری خودکار نوبت ترمیم، لینک اختصاصی و ۲ هفته رایگان. کاهش ۸۰ درصدی کنسلی.",
  keywords: [
    "نرم افزار نوبت دهی ناخن کار",
    "سیستم نوبت دهی تخصصی کاشت ناخن",
    "مدیریت نوبت کاشت و ترمیم ناخن",
    "اپلیکیشن نوبت دهی کاشت ناخن",
    "پیامک یادآوری نوبت ترمیم ناخن",
    "نرم افزار مدیریت ناخن کاران",
    "رزرو آنلاین کاشت ناخن",
    "لینک اختصاصی مدیریت نوبت کاشت ناخن",
    "کاهش کنسلی نوبت ترمیم",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries/nail-artist",
  },
  openGraph: {
    title: "نرم افزار نوبت دهی ناخن کار و کاشت ناخن ★ ۲ هفته رایگان",
    description:
      "مدیریت هوشمند نوبت کاشت، ترمیم و ژلیش با سیستم پیامک یادآوری خودکار. صفحه اختصاصی برای هر ناخن‌کار. شروع ۲ هفته رایگان.",
    url: "https://ontimeapp.ir/industries/nail-artist",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/screens/nail-appointment.jpg",
        width: 1200,
        height: 630,
        alt: "نرم افزار نوبت دهی کاشت ناخن آنتایم - پنل مدیریت تخصصی ناخن‌کاران",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "نرم افزار نوبت دهی ناخن کار و کاشت ناخن ★ ۲ هفته رایگان",
    description: "مدیریت هوشمند نوبت کاشت، ترمیم و ژلیش با سیستم پیامک یادآوری خودکار. شروع ۲ هفته رایگان.",
    images: ["/images/screens/nail-appointment.jpg"],
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

export default function NailArtistLanding() {
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
    description: "هوشمندترین نرم افزار نوبت دهی آنلاین برای ناخن‌کاران و متخصصان کاشت ناخن",
    inLanguage: "fa-IR",
  };

  // 2. SoftwareApplication Schema (برای نرم افزار ناخن)
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/industries/nail-artist#software`,
    name: "نرم افزار نوبت دهی ناخن کار آنتایم",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    url: `${baseUrl}/industries/nail-artist`,
    description:
      "نرم افزار تخصصی نوبت دهی ناخن‌کاران و متخصصان کاشت ناخن با قابلیت ارسال پیامک یادآوری خودکار نوبت ترمیم، لینک اختصاصی مدیریت نوبت و ۲ هفته استفاده رایگان",
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
      reviewCount: "850",
    },
    featureList: [
      "ارسال خودکار پیامک یادآوری نوبت ترمیم",
      "لینک اختصاصی مدیریت نوبت برای مشتری",
      "پرونده الکترونیک مشتریان با ثبت رنگ و مدل کاشت",
      "لیست سیاه مشتریان بدقول",
      "تفکیک تخصصی خدمات کاشت، ترمیم، ژلیش و طراحی",
      "تقویم شمسی هوشمند با فیلتر خدمات ناخن",
      "کاهش ۸۰ درصدی کنسلی نوبت ترمیم",
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

  // 4. Service Schema (تخصصی ناخن)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "نرم افزار تخصصی نوبت دهی و مدیریت مشتریان کاشت و ترمیم ناخن",
    provider: {
      "@type": "Organization",
      name: "آنتایم",
    },
    areaServed: "IR",
    audience: {
      "@type": "Audience",
      name: "ناخن‌کاران و متخصصین کاشت، ترمیم و ژلیش ناخن",
    },
    description:
      "راهکار جامع دیجیتال برای ناخن‌کاران جهت مدیریت نوبت‌های کاشت، ترمیم، ژلیش و ارسال پیامک خودکار یادآوری به مشتریان با ۲ هفته استفاده رایگان.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "امکانات تخصصی ناخن",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پیامک یادآوری خودکار نوبت ترمیم" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پرونده تخصصی سوابق کاشت و رنگ مشتری" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لیست سیاه مشتریان بدقول" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "تفکیک خدمات کاشت، ترمیم، ژلیش و طراحی" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لینک اختصاصی مدیریت نوبت بدون نیاز به نصب" } },
      ],
    },
  };

  // 5. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}/industries/nail-artist#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "صنایع", item: `${baseUrl}/#industries` },
      { "@type": "ListItem", position: 3, name: "نرم افزار نوبت دهی ناخن کار و کاشت ناخن", item: `${baseUrl}/industries/nail-artist` },
    ],
  };

  // 6. Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "نرم افزار نوبت دهی ناخن کار آنتایم",
    description: "نرم افزار حرفه‌ای مدیریت نوبت کاشت، ترمیم و ژلیش ویژه ناخن‌کاران",
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
      reviewCount: "850",
    },
  };

  // 7. LocalBusiness Schema (برای ناخن‌کاران هدف)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "سیستم نوبت دهی تخصصی کاشت و ترمیم ناخن آنتایم",
    description: "راهکار مدیریت هوشمند نوبت کاشت، ترمیم و ژلیش برای ناخن‌کاران و سالن‌های تخصصی ناخن",
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

      <NailNavigation />

      <main>
        {/* ========== Breadcrumb بصری ========== */}
        <div className="max-w-7xl mx-auto px-6 pt-28 lg:pt-32">
          <nav className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link
              href="/"
              className="hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              خانه
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <Link
              href="/#industries"
              className="hover:text-rose-600 transition-colors"
            >
              صنایع
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-rose-600 font-bold line-clamp-1 max-w-[200px] sm:max-w-[280px]">
              نرم افزار نوبت دهی ناخن کار و کاشت ناخن
            </span>
          </nav>
        </div>

        <NailArtistHero />
        <NailStats />
        <NailFeatures />
        
        {/* گالری با تم ناخن کار */}
        <BeautyGallery
          accentColor="rose"
          industry="nail"
          title={
            <>
              نمای داخلی <span className="text-rose-500">نرم افزار نوبت دهی ناخن کار</span>
            </>
          }
          description="طراحی ساده و حرفه‌ای برای مدیریت هوشمند نوبت کاشت، ترمیم و ژلیش. تمام آنچه یک ناخن‌کار حرفه‌ای نیاز دارد."
        />
        
        <NailStepFlow />
        <NailComparison />
        <NailSmsNotify />
        <PricingSection />
        <NailFAQ />
        <NailFinalCTA />
      </main>

      <EnhancedFooter />
    </div>
  );
}