// app/industries/doctors/page.tsx
import { Metadata } from "next";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import DoctorHero from "./components/DoctorHero";
import DoctorStats from "./components/DoctorStats";
import DoctorFeatures from "./components/DoctorFeatures";
import DoctorStepFlow from "./components/DoctorStepFlow";
import DoctorComparison from "./components/DoctorComparison";
import DoctorSmsNotify from "./components/DoctorSmsNotify";
import PricingSection from "@/components/Landing/PricingSection";
import DoctorFAQ from "./components/DoctorFAQ";
import DoctorFinalCTA from "./components/DoctorFinalCTA";
import DoctorNavigation from "./components/DoctorNavigation";
import Script from "next/script";
import Link from "next/link";
import { Home, ChevronLeft } from "lucide-react";
import BeautyGallery from "../beauty-salon/components/BeautyGallery";

// ========== متادیتا (بهینه شده برای پزشکان) ==========
export const metadata: Metadata = {
  title: "نرم افزار نوبت دهی پزشکان و مطب ★ ۲ هفته رایگان | آنتایم",
  description:
    "مدیریت نوبت مطب پزشکان با نرم افزار آنتایم. پیامک یادآوری خودکار نوبت، لینک اختصاصی برای بیماران و ۲ هفته رایگان. کاهش ۸۰ درصدی کنسلی ویزیت.",
  keywords: [
    "نرم افزار نوبت دهی پزشکان",
    "سیستم نوبت دهی آنلاین مطب",
    "مدیریت نوبت بیماران",
    "اپلیکیشن نوبت دهی پزشک",
    "پیامک یادآوری نوبت ویزیت",
    "نرم افزار مدیریت مطب پزشکان",
    "رزرو آنلاین وقت پزشک",
    "لینک اختصاصی نوبت دهی بیماران",
    "کاهش کنسلی نوبت پزشکی",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries/doctors",
  },
  openGraph: {
    title: "نرم افزار نوبت دهی پزشکان و مطب ★ ۲ هفته رایگان",
    description:
      "مدیریت هوشمند نوبت ویزیت بیماران با سیستم پیامک یادآوری خودکار. صفحه اختصاصی برای هر مطب. شروع ۲ هفته رایگان.",
    url: "https://ontimeapp.ir/industries/doctors",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/screens/doctor-appointment.jpg",
        width: 1200,
        height: 630,
        alt: "نرم افزار نوبت دهی پزشکان آنتایم - پنل مدیریت تخصصی مطب",
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

export default function DoctorLanding() {
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
    description: "هوشمندترین نرم افزار نوبت دهی آنلاین برای پزشکان و مطب‌ها",
    inLanguage: "fa-IR",
  };

  // 2. SoftwareApplication Schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/industries/doctors#software`,
    name: "نرم افزار نوبت دهی پزشکان آنتایم",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    url: `${baseUrl}/industries/doctors`,
    description:
      "نرم افزار تخصصی نوبت دهی پزشکان و مطب‌ها با قابلیت ارسال پیامک یادآوری خودکار نوبت ویزیت، لینک اختصاصی مدیریت نوبت بیماران و ۲ هفته استفاده رایگان",
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
      reviewCount: "450",
    },
    featureList: [
      "ارسال خودکار پیامک یادآوری نوبت ویزیت",
      "لینک اختصاصی مدیریت نوبت برای بیماران",
      "پرونده الکترونیک بیماران با سوابق ویزیت",
      "لیست سیاه بیماران بدقول",
      "مدیریت چندین پزشک و نوبت‌دهی تخصصی",
      "تقویم شمسی هوشمند مطب",
      "کاهش ۸۰ درصدی کنسلی نوبت",
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

  // 4. Service Schema (تخصصی پزشکان)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "نرم افزار تخصصی نوبت دهی و مدیریت بیماران مطب",
    provider: {
      "@type": "Organization",
      name: "آنتایم",
    },
    areaServed: "IR",
    audience: {
      "@type": "Audience",
      name: "پزشکان عمومی، متخصصین و مدیران مطب",
    },
    description:
      "راهکار جامع دیجیتال برای مطب‌های پزشکی جهت مدیریت نوبت‌های ویزیت، ارسال پیامک خودکار یادآوری و کاهش کنسلی با ۲ هفته استفاده رایگان.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "امکانات تخصصی پزشکان",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پیامک یادآوری خودکار نوبت ویزیت" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "پرونده الکترونیک سوابق درمانی بیمار" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لیست سیاه بیماران بدقول" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "لینک اختصاصی رزرو نوبت بدون تماس تلفنی" } },
      ],
    },
  };

  // 5. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${baseUrl}/industries/doctors#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "صنایع", item: `${baseUrl}/#industries` },
      { "@type": "ListItem", position: 3, name: "نرم افزار نوبت دهی پزشکان و مطب", item: `${baseUrl}/industries/doctors` },
    ],
  };

  // 6. Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "نرم افزار نوبت دهی پزشکان آنتایم",
    description: "نرم افزار حرفه‌ای مدیریت نوبت ویزیت و بیماران ویژه مطب‌های پزشکی",
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
      reviewCount: "450",
    },
  };

  // 7. LocalBusiness Schema (برای مطب‌های هدف)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "سیستم نوبت دهی تخصصی مطب پزشکان آنتایم",
    description: "راهکار مدیریت هوشمند نوبت ویزیت بیماران برای مطب‌های پزشکی و کلینیک‌ها",
    medicalSpecialty: "GeneralPractice",
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

      <DoctorNavigation />

      <main>
        {/* ========== Breadcrumb بصری ========== */}
        <div className="max-w-7xl mx-auto px-6 pt-28 lg:pt-32">
          <nav className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link
              href="/"
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              خانه
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <Link
              href="/#industries"
              className="hover:text-blue-600 transition-colors"
            >
              صنایع
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-blue-600 font-bold line-clamp-1 max-w-[200px] sm:max-w-[280px]">
              نرم افزار نوبت دهی پزشکان و مطب
            </span>
          </nav>
        </div>

        <DoctorHero />
        <DoctorStats />
        <DoctorFeatures />
        
        {/* گالری با تم پزشکان */}
        <BeautyGallery
          accentColor="blue"
          industry="doctor"
          title={
            <>
              نمای داخلی <span className="text-blue-500">نرم افزار نوبت دهی پزشکان</span>
            </>
          }
          description="طراحی ساده و حرفه‌ای برای مدیریت هوشمند نوبت ویزیت بیماران. تمام آنچه یک مطب پزشکی نیاز دارد."
        />
        
        <DoctorStepFlow />
        <DoctorComparison />
        <DoctorSmsNotify />
        <PricingSection />
        <DoctorFAQ />
        <DoctorFinalCTA />
      </main>

      <EnhancedFooter />
    </div>
  );
}