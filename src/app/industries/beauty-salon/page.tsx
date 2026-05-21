import { Metadata } from "next";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import BeautyHero from "./components/BeautyHero";
import BeautyStats from "./components/BeautyStats";
import BeautyFeatures from "./components/BeautyFeatures";
import BeautyGallery from "./components/BeautyGallery";
import BeautyComparison from "./components/BeautyComparison";
import BeautySMS from "./components/BeautySMS";
import BeautyFAQ from "./components/BeautyFAQ";
import FinalCTA from "@/components/Landing/FinalCTA";
import PricingSection from "@/components/Landing/PricingSection";
import BeautySteps from "./components/BeautySteps";
import BeautyNavigation from "./components/BeautyNavigation";
import Script from "next/script";
import Link from "next/link";
import { Home, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "اپلیکیشن نوبت دهی آرایشگاه و مدیریت هوشمند سالن | آنتایم",
  description:
    "بهترین نرم‌افزار مدیریت نوبت و مشتری ویژه آرایشگران. ارسال پیامک یادآوری، لینک اختصاصی مدیریت نوبت برای مشتری، لیست قیمت آنلاین و پرونده الکترونیک.",
  keywords: [
    "نوبت دهی آرایشگاه",
    "مدیریت سالن زیبایی",
    "اپلیکیشن آرایشگری",
    "نرم افزار آرایشگاه زنانه",
    "پیامک یادآوری نوبت",
    "پنل مدیریت آرایشگر",
    "رزرو آنلاین آرایشگاه",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries/beauty-salon",
  },
  openGraph: {
    title: "تخصصی‌ترین اپلیکیشن مدیریت نوبت و مشتری ویژه آرایشگران",
    description:
      "با دفترچه خداحافظی کنید! مدیریت حرفه‌ای نوبت‌ها و کاهش کنسلی با اپلیکیشن هوشمند آنتایم.",
    url: "https://ontimeapp.ir/industries/beauty-salon",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/screens/beauty-og.jpg",
        width: 1200,
        height: 630,
        alt: "محیط اپلیکیشن نوبت دهی آنتایم مخصوص آرایشگران",
      },
    ],
  },
};

export default function BeautySalonLanding() {
  const baseUrl = "https://ontimeapp.ir";

  // ========== اسکیماهای جامع (۷ عدد) ==========
  
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

  // 2. SoftwareApplication Schema (برای اپلیکیشن)
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/#software`,
    name: "آنتایم (OnTime) - نسخه آرایشگاه",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    url: baseUrl,
    description:
      "اپلیکیشن تخصصی نوبت دهی آرایشگاه‌ها و سالن‌های زیبایی با قابلیت ارسال پیامک یادآوری و لینک اختصاصی مدیریت نوبت",
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
      "ارسال خودکار پیامک یادآوری نوبت",
      "لینک اختصاصی مدیریت نوبت برای مشتری",
      "پرونده الکترونیک مشتریان",
      "لیست سیاه مشتریان بدقول",
      "مدیریت چندین پرسنل و لاین",
      "تقویم آنلاین شمسی",
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

  // 4. Service Schema (تخصصی آرایشگاه)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "نرم‌افزار مدیریت و نوبت‌دهی آرایشگاه",
    provider: {
      "@type": "Organization",
      name: "آنتایم",
    },
    areaServed: "IR",
    audience: {
      "@type": "Audience",
      name: "آرایشگران و صاحبان سالن‌های زیبایی",
    },
    description:
      "راهکار جامع مدیریت سالن‌های زیبایی، نوبت‌دهی آنلاین و سیستم یادآوری پیامکی مشتریان.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "امکانات تخصصی آرایشگاه",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "تعریف نامحدود خدمات و قیمت" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پرونده الکترونیک مشتریان" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لیست سیاه مشتریان بدقول" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ارسال خودکار پیامک یادآوری" } },
      ],
    },
  };

  // 5. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}/industries/beauty-salon#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "صنایع", item: `${baseUrl}/#industries` },
      { "@type": "ListItem", position: 3, name: "آرایشگاه و سالن زیبایی", item: `${baseUrl}/industries/beauty-salon` },
    ],
  };

  // 6. Product Schema (برای خدمات نرم‌افزار)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "اپلیکیشن نوبت دهی آرایشگاه آنتایم",
    description: "نرم‌افزار حرفه‌ای مدیریت نوبت و مشتری ویژه آرایشگران",
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

  // 7. FAQPage Schema (از کامپوننت BeautyFAQ استفاده می‌کند - همانجا اضافه شده)

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

      <BeautyNavigation />

      <main>
        {/* ========== Breadcrumb بصری (اضافه شده) ========== */}
        <div className="max-w-7xl mx-auto px-6 pt-28 lg:pt-32">
          <nav className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link
              href="/"
              className="hover:text-pink-600 flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              خانه
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <Link
              href="/#industries"
              className="hover:text-pink-600 transition-colors"
            >
              صنایع
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-pink-600 font-bold line-clamp-1 max-w-[150px] sm:max-w-[200px]">
              آرایشگاه و سالن زیبایی
            </span>
          </nav>
        </div>

        <BeautyHero />
        <BeautyStats />
        <BeautyFeatures />
        <BeautyGallery
          accentColor="pink"
          title={
            <>
              نمای داخلی <span className="text-pink-500">اپلیکیشن</span>
            </>
          }
          description="سادگی در طراحی، قدرت در مدیریت. تمام آنچه یک آرایشگر حرفه‌ای نیاز دارد."
        />
        <BeautySteps />
        <BeautyComparison />
        <BeautySMS />
        <PricingSection />
        <BeautyFAQ />
        <FinalCTA />
      </main>

      <EnhancedFooter />
    </div>
  );
}