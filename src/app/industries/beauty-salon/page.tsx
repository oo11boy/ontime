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
  title: "نرم افزار نوبت دهی آرایشگاه و سالن زیبایی ★ ۲ هفته رایگان | آنتایم",
  description:
    "مدیریت نوبت و مشتریان آرایشگاه با نرم افزار آنتایم. صفحه اختصاصی، پیامک یادآوری خودکار و ۲ هفته رایگان. کاهش ۸۰ درصدی کنسلی و افزایش رضایت مشتری.",
  keywords: [
    "نرم افزار نوبت دهی آرایشگاه",
    "سیستم نوبت دهی آنلاین سالن زیبایی",
    "مدیریت نوبت مشتریان آرایشگاه",
    "اپلیکیشن نوبت دهی آرایشگاه",
    "پیامک یادآوری نوبت خودکار",
    "نرم افزار مدیریت سالن زیبایی",
    "رزرو آنلاین آرایشگاه",
    "لینک اختصاصی مدیریت نوبت",
    "کاهش کنسلی نوبت",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries/beauty-salon",
  },
  openGraph: {
    title: "نرم افزار نوبت دهی آرایشگاه و سالن زیبایی ★ ۲ هفته رایگان",
    description:
      "مدیریت هوشمند نوبت و مشتریان آرایشگاه با سیستم پیامک یادآوری خودکار. صفحه اختصاصی برای هر کسب و کار. شروع ۲ هفته رایگان.",
    url: "https://ontimeapp.ir/industries/beauty-salon",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/screens/beauty-og.jpg",
        width: 1200,
        height: 630,
        alt: "نرم افزار نوبت دهی آرایشگاه آنتایم - پنل مدیریت هوشمند",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function BeautySalonLanding() {
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
    description: "هوشمندترین نرم افزار نوبت دهی آنلاین برای آرایشگاه‌ها و سالن‌های زیبایی",
    inLanguage: "fa-IR",
  };

  // 2. SoftwareApplication Schema (برای نرم افزار)
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/industries/beauty-salon#software`,
    name: "نرم افزار نوبت دهی آرایشگاه آنتایم",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    url: `${baseUrl}/industries/beauty-salon`,
    description:
      "نرم افزار تخصصی نوبت دهی آرایشگاه‌ها و سالن‌های زیبایی با قابلیت ارسال پیامک یادآوری خودکار، لینک اختصاصی مدیریت نوبت و ۲ هفته استفاده رایگان",
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
      "تعریف نامحدود خدمات و قیمت",
      "تقویم شمسی هوشمند",
      "کاهش ۸۰ درصدی کنسلی",
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
    serviceType: "نرم افزار مدیریت و نوبت دهی آرایشگاه و سالن زیبایی",
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
      "راهکار جامع مدیریت سالن‌های زیبایی، نوبت دهی آنلاین و سیستم پیامک یادآوری خودکار مشتریان با ۲ هفته استفاده رایگان.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "امکانات تخصصی آرایشگاه",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "تعریف نامحدود خدمات و قیمت" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پرونده الکترونیک مشتریان" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لیست سیاه مشتریان بدقول" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "ارسال خودکار پیامک یادآوری" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لینک اختصاصی مدیریت نوبت" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "تقویم شمسی هوشمند" } },
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
      { "@type": "ListItem", position: 3, name: "نرم افزار نوبت دهی آرایشگاه و سالن زیبایی", item: `${baseUrl}/industries/beauty-salon` },
    ],
  };

  // 6. Product Schema (برای خدمات نرم افزار)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "نرم افزار نوبت دهی آرایشگاه آنتایم",
    description: "نرم افزار حرفه‌ای مدیریت نوبت و مشتری ویژه آرایشگران و سالن‌های زیبایی",
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
      reviewCount: "1240",
    },
  };

  // 7. LocalBusiness Schema (برای سالن‌های هدف)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "سیستم نوبت دهی آرایشگاه آنتایم",
    description: "راهکار مدیریت هوشمند نوبت و مشتری برای آرایشگاه‌ها و سالن‌های زیبایی",
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
            <span className="text-pink-600 font-bold line-clamp-1 max-w-[200px] sm:max-w-[280px]">
              نرم افزار نوبت دهی آرایشگاه و سالن زیبایی
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
              نمای داخلی <span className="text-pink-500">نرم افزار نوبت دهی آرایشگاه</span>
            </>
          }
          description="سادگی در طراحی، قدرت در مدیریت. تمام آنچه یک آرایشگر حرفه‌ای برای مدیریت هوشمند نوبت و مشتری نیاز دارد."
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