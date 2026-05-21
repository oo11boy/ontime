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
import BeautyGallery from "../beauty-salon/components/BeautyGallery";
import NailNavigation from "./components/NailNavigation";
import Script from "next/script";
import Link from "next/link";
import { Home, ChevronLeft } from "lucide-react";

// ========== متادیتا (بهینه شده) ==========
export const metadata: Metadata = {
  title: "اپلیکیشن نوبت دهی پیامکی کاشت و ترمیم ناخن | مدیریت مشتریان ناخن",
  description:
    "بهترین نرم‌افزار نوبت‌دهی پیامکی ویژه ناخن‌کاران. مدیریت هوشمند زمان ترمیم، یادآوری خودکار پیامکی به کلاینت، حذف دفترچه کاغذی و آرایش دیجیتال سوابق کاشت و ژلیش.",
  keywords: [
    "نوبت دهی پیامکی ناخن",
    "مدیریت مشتریان کاشت ناخن",
    "برنامه نوبت دهی ترمیم ناخن",
    "نرم افزار مدیریت ناخن کار",
    "یادآوری پیامکی ترمیم ناخن",
    "رزرو آنلاین کاشت ناخن",
    "پنل مدیریت ناخن کاران",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries/nail-artist",
  },
  openGraph: {
    title: "پنل هوشمند مدیریت نوبت و ترمیم ویژه متخصصین ناخن",
    description:
      "میز ناخن خود را با آنتایم دیجیتال کنید. کاهش کنسلی و نظم‌دهی به نوبت‌های ترمیم با سیستم یادآوری هوشمند.",
    url: "https://ontimeapp.ir/industries/nail-artist",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/screens/newmain.jpg",
        width: 1200,
        height: 630,
        alt: "مدیریت هوشمند نوبت‌های کاشت و ترمیم ناخن با آنتایم",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "پنل هوشمند مدیریت نوبت و ترمیم ویژه متخصصین ناخن",
    description: "میز ناخن خود را با آنتایم دیجیتال کنید. کاهش کنسلی و نظم‌دهی به نوبت‌های ترمیم با سیستم یادآوری هوشمند.",
    images: ["/images/screens/newmain.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function NailArtistLanding() {
  const baseUrl = "https://ontimeapp.ir";

  // ========== اسکیماهای جامع (7 عدد) ==========

  // 1. WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "آنتایم",
    alternateName: ["OnTime", "اپلیکیشن آنتایم", "سامانه آنتایم"],
    description: "هوشمندترین سامانه نوبت‌دهی آنلاین برای کسب‌وکارهای خدماتی",
    inLanguage: "fa-IR",
  };

  // 2. SoftwareApplication Schema (برای اپلیکیشن ناخن)
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/industries/nail-artist#software`,
    name: "آنتایم (OnTime) - نسخه ناخن‌کار",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    url: baseUrl,
    description:
      "اپلیکیشن تخصصی نوبت دهی ناخن‌کاران با قابلیت ارسال پیامک یادآوری ترمیم و لینک اختصاصی مدیریت نوبت",
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
      reviewCount: "1240",
    },
    featureList: [
      "ارسال خودکار پیامک یادآوری نوبت ترمیم",
      "لینک اختصاصی مدیریت نوبت برای مشتری",
      "پرونده الکترونیک مشتریان ناخن",
      "لیست سیاه مشتریان بدقول",
      "مدیریت چندین پرسنل و لاین",
      "تقویم آنلاین شمسی با فیلتر خدمات (کاشت، ترمیم، ژلیش)",
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
    serviceType: "نرم‌افزار تخصصی نوبت‌دهی و مدیریت مشتریان ناخن",
    provider: {
      "@type": "Organization",
      name: "آنتایم",
    },
    areaServed: "IR",
    audience: {
      "@type": "Audience",
      name: "ناخن‌کاران و متخصصین کاشت و ترمیم ناخن",
    },
    description:
      "راهکار جامع دیجیتال برای ناخن‌کاران جهت مدیریت نوبت‌های کاشت، ترمیم، ژلیش و ارسال پیامک خودکار یادآوری به مشتریان.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "امکانات تخصصی ناخن",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "یادآوری خودکار نوبت ترمیم" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پنل اختصاصی سوابق کلاینت ناخن" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لیست سیاه مشتریان بدقول" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "تفکیک خدمات (کاشت، ترمیم، ژلیش، لمینت)" } },
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
      { "@type": "ListItem", position: 3, name: "ناخن‌کار و خدمات کاشت ناخن", item: `${baseUrl}/industries/nail-artist` },
    ],
  };

  // 6. Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "اپلیکیشن نوبت دهی ناخن آنتایم",
    description: "نرم‌افزار حرفه‌ای مدیریت نوبت و مشتری ویژه ناخن‌کاران",
    brand: { "@type": "Brand", name: "آنتایم" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IRR",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1240",
    },
  };

  // 7. FAQPage Schema (در کامپوننت NailFAQ موجود است - همانجا اضافه شده)

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

      <NailNavigation />

      <main>
        {/* ========== Breadcrumb بصری (اضافه شده) ========== */}
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
            <span className="text-rose-600 font-bold line-clamp-1 max-w-[150px] sm:max-w-[200px]">
              ناخن‌کار و خدمات کاشت ناخن
            </span>
          </nav>
        </div>

        <NailArtistHero />
        <NailStats />
        <NailFeatures />
        <BeautyGallery
          accentColor="rose"
          title={
            <>
              میز ناخن هوشمند با{" "}
              <span className="text-rose-500 text-shadow-sm">
                پنل مدیریت نوبت و ترمیم
              </span>
            </>
          }
          description="دفتـر نوبت‌دهی را کنار بگذارید؛ آنتایم تمامِ جزییات کاشت، ژلیش و زمان دقیق ترمیم مشتریان را برای شما سازماندهی می‌کند."
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