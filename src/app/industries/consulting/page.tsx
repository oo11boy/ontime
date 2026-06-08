// app/industries/consulting/page.tsx
import { Metadata } from "next";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import ConsultingHero from "./components/ConsultingHero";
import ConsultingStats from "./components/ConsultingStats";
import ConsultingFeatures from "./components/ConsultingFeatures";
import ConsultingStepFlow from "./components/ConsultingStepFlow";
import ConsultingComparison from "./components/ConsultingComparison";
import ConsultingSmsNotify from "./components/ConsultingSmsNotify";
import PricingSection from "@/components/Landing/PricingSection";
import ConsultingFAQ from "./components/ConsultingFAQ";
import ConsultingFinalCTA from "./components/ConsultingFinalCTA";
import ConsultingNavigation from "./components/ConsultingNavigation";
import Script from "next/script";
import Link from "next/link";
import { Home, ChevronLeft } from "lucide-react";
import BeautyGallery from "../beauty-salon/components/BeautyGallery";

// ========== متادیتا (بهینه شده برای مشاوره و روانشناسی) ==========
export const metadata: Metadata = {
  title: "نرم افزار نوبت دهی روانشناس و مشاور ★ ۲ هفته رایگان | آنتایم",
  description:
    "مدیریت نوبت جلسات مشاوره و روانشناسی با نرم افزار آنتایم. پیامک یادآوری خودکار جلسات، لینک اختصاصی برای مراجعان و ۲ هفته رایگان. کاهش ۸۰ درصدی کنسلی جلسات.",
  keywords: [
    "نرم افزار نوبت دهی روانشناس",
    "سیستم رزرو وقت مشاوره",
    "مدیریت جلسات مشاوره",
    "اپلیکیشن نوبت دهی مشاور",
    "پیامک یادآوری جلسه مشاوره",
    "نرم افزار مدیریت کلینیک روانشناسی",
    "رزرو آنلاین وقت روانشناس",
    "لینک اختصاصی نوبت دهی مراجعان",
    "کاهش کنسلی جلسات مشاوره",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries/consulting",
  },
  openGraph: {
    title: "نرم افزار نوبت دهی روانشناس و مشاور ★ ۲ هفته رایگان",
    description:
      "مدیریت هوشمند نوبت جلسات مشاوره و روانشناسی با سیستم پیامک یادآوری خودکار. صفحه اختصاصی برای هر مرکز مشاوره. شروع ۲ هفته رایگان.",
    url: "https://ontimeapp.ir/industries/consulting",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/screens/consulting-appointment.jpg",
        width: 1200,
        height: 630,
        alt: "نرم افزار نوبت دهی روانشناس و مشاور آنتایم - پنل مدیریت تخصصی مراکز مشاوره",
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

export default function ConsultingLanding() {
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
    description: "هوشمندترین نرم افزار نوبت دهی آنلاین برای مراکز مشاوره و روانشناسی",
    inLanguage: "fa-IR",
  };

  // 2. SoftwareApplication Schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/industries/consulting#software`,
    name: "نرم افزار نوبت دهی روانشناس و مشاور آنتایم",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    url: `${baseUrl}/industries/consulting`,
    description:
      "نرم افزار تخصصی نوبت دهی مراکز مشاوره و روانشناسی با قابلیت ارسال پیامک یادآوری خودکار جلسات، لینک اختصاصی مدیریت نوبت مراجعان و ۲ هفته استفاده رایگان",
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
      reviewCount: "280",
    },
    featureList: [
      "ارسال خودکار پیامک یادآوری جلسات مشاوره",
      "لینک اختصاصی مدیریت نوبت برای مراجعان",
      "پرونده الکترونیک مراجعان با سوابق جلسات",
      "لیست سیاه مراجعان بدقول",
      "مدیریت چندین مشاور و روانشناس",
      "تقویم شمسی هوشمند مرکز مشاوره",
      "کاهش ۸۰ درصدی کنسلی جلسات",
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

  // 4. Service Schema (تخصصی مشاوره)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "نرم افزار تخصصی نوبت دهی و مدیریت مراکز مشاوره و روانشناسی",
    provider: {
      "@type": "Organization",
      name: "آنتایم",
    },
    areaServed: "IR",
    audience: {
      "@type": "Audience",
      name: "روانشناسان، مشاوران، مدیران کلینیک‌های روانشناسی",
    },
    description:
      "راهکار جامع دیجیتال برای مراکز مشاوره جهت مدیریت نوبت جلسات، رزرو وقت مشاوره و ارسال پیامک خودکار یادآوری با ۲ هفته استفاده رایگان.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "امکانات تخصصی مراکز مشاوره",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پیامک یادآوری خودکار جلسات مشاوره" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پرونده الکترونیک سوابق جلسات مراجع" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لیست سیاه مراجعان بدقول" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لینک اختصاصی رزرو وقت مشاوره بدون تماس تلفنی" } },
      ],
    },
  };

  // 5. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}/industries/consulting#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "صنایع", item: `${baseUrl}/#industries` },
      { "@type": "ListItem", position: 3, name: "نرم افزار نوبت دهی روانشناس و مشاور", item: `${baseUrl}/industries/consulting` },
    ],
  };

  // 6. Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "نرم افزار نوبت دهی روانشناس و مشاور آنتایم",
    description: "نرم افزار حرفه‌ای مدیریت نوبت جلسات مشاوره و روانشناسی ویژه مراکز مشاوره و کلینیک‌ها",
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
      reviewCount: "280",
    },
  };

  // 7. LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "سیستم نوبت دهی تخصصی مراکز مشاوره و روانشناسی آنتایم",
    description: "راهکار مدیریت هوشمند نوبت جلسات مشاوره و رزرو وقت روانشناس برای مراکز مشاوره و کلینیک‌های روانشناسی",
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

      <ConsultingNavigation />

      <main>
        {/* ========== Breadcrumb بصری ========== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-32">
          <nav className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link
              href="/"
              className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              خانه
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <Link
              href="/#industries"
              className="hover:text-indigo-600 transition-colors"
            >
              صنایع
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-indigo-600 font-bold line-clamp-1 max-w-[200px] sm:max-w-[280px]">
              نرم افزار نوبت دهی روانشناس و مشاور
            </span>
          </nav>
        </div>

        <ConsultingHero />
        <ConsultingStats />
        <ConsultingFeatures />
        
        {/* گالری با تم مشاوره */}
        <BeautyGallery
          accentColor="indigo"
          industry="consulting"
          title={
            <>
              نمای داخلی <span className="text-indigo-500">نرم افزار نوبت دهی روانشناس و مشاور</span>
            </>
          }
          description="طراحی ساده و حرفه‌ای برای مدیریت هوشمند نوبت جلسات مشاوره و روانشناسی. تمام آنچه یک مرکز مشاوره نیاز دارد."
        />
        
        <ConsultingStepFlow />
        <ConsultingComparison />
        <ConsultingSmsNotify />
        <PricingSection />
        <ConsultingFAQ />
        <ConsultingFinalCTA />
      </main>

      <EnhancedFooter />
    </div>
  );
}