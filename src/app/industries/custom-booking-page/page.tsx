// app/industries/custom-booking-page/page.tsx
import { Metadata } from "next";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import CustomBookingHero from "./components/CustomBookingHero";
import CustomBookingShowcase from "./components/CustomBookingShowcase";
import CustomBookingFeatures from "./components/CustomBookingFeatures";
import CustomBookingComparison from "./components/CustomBookingComparison";
import CustomBookingSteps from "./components/CustomBookingSteps";
import CustomBookingSamples from "./components/CustomBookingSamples";
import CustomBookingCTA from "./components/CustomBookingCTA";
import CustomBookingFAQ from "./components/CustomBookingFAQ";
import Script from "next/script";
import CustomBookingLiveSamples from "./components/CustomBookingLiveSamples";
import Navigation from "@/components/Landing/Navigation";

// ========== متادیتا (فوق العاده قوی برای سئو) ==========
export const metadata: Metadata = {
  title:
    "ساخت صفحه اختصاصی نوبت دهی کسب و کار ★ کاملا رایگان ★ لینک رزرو آنلاین | آنتایم",
  description:
    "ساخت صفحه اختصاصی نوبت دهی کاملا رایگان برای آرایشگاه، سالن زیبایی، ناخن کار، پزشک، باشگاه و هر کسب و کاری. لینک اختصاصی + گالری نمونه کار + قیمت خدمات + نظرات مشتریان + ثبت نوبت آنلاین. بدون نیاز به برنامه‌نویسی و بدون نیاز به نصب اپلیکیشن.",
  keywords: [
    "ساخت صفحه اختصاصی نوبت دهی رایگان",
    "لینک نوبت دهی آنلاین رایگان",
    "صفحه رزرو اختصاصی رایگان کسب و کار",
    "ساخت صفحه نوبت دهی آرایشگاه رایگان",
    "لینک اختصاصی ثبت نوبت مشتری رایگان",
    "صفحه مدیریت نوبت رایگان بدون اپلیکیشن",
    "ساخت صفحه خدمات با قیمت و گالری رایگان",
    "سیستم نوبت دهی رایگان با نظر دهی مشتریان",
    "ثبت درخواست نوبت آنلاین رایگان",
    "کنسلی و تغییر نوبت توسط مشتری رایگان",
    "ساخت صفحه اختصاصی رایگان برای کسب و کار",
    "صفحه اختصاصی نوبت دهی بدون هزینه",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/industries/custom-booking-page",
  },
  openGraph: {
    title:
      "ساخت صفحه اختصاصی نوبت دهی کسب و کار ★ کاملا رایگان ★ لینک رزرو آنلاین | آنتایم",
    description:
      "یک صفحه اختصاصی کامل و رایگان برای کسب‌وکارتان بسازید. شامل معرفی، گالری نمونه کار، قیمت خدمات، نظرات مشتریان و لینک مستقیم نوبت‌گیری. بدون نیاز به برنامه‌نویسی. شروع رایگان.",
    url: "https://ontimeapp.ir/industries/custom-booking-page",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/images/screens/custom-booking-page.jpg",
        width: 1200,
        height: 630,
        alt: "ساخت صفحه اختصاصی نوبت دهی رایگان - نمونه صفحه رزرو آنلاین",
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

export default function CustomBookingPage() {
  const baseUrl = "https://ontimeapp.ir";

  // ========== اسکیماهای جامع ==========

  // 1. WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "آنتایم",
    alternateName: ["OnTime", "نرم افزار آنتایم", "ساخت صفحه نوبت دهی رایگان"],
    description:
      "ساخت صفحه اختصاصی نوبت دهی آنلاین رایگان برای کسب و کارها | لینک رزرو اختصاصی بدون هزینه",
    inLanguage: "fa-IR",
  };

  // 2. SoftwareApplication Schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/industries/custom-booking-page#software`,
    name: "ساخت صفحه اختصاصی نوبت دهی رایگان کسب و کار آنتایم",
    operatingSystem: "Web, Android, iOS",
    applicationCategory: "BusinessApplication",
    url: `${baseUrl}/industries/custom-booking-page`,
    description:
      "ساخت صفحه اختصاصی نوبت دهی کاملا رایگان با قابلیت معرفی کسب و کار، گالری نمونه کار، لیست خدمات با قیمت، نظرات مشتریان، لینک اختصاصی، ثبت نوبت آنلاین، تغییر و لغو نوبت توسط مشتری - بدون نیاز به برنامه‌نویسی و بدون هیچ هزینه اولیه",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IRR",
      availability: "https://schema.org/InStock",
      description: "ساخت صفحه اختصاصی کاملا رایگان - بدون نیاز به کارت بانکی",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1500",
    },
    featureList: [
      "ساخت صفحه اختصاصی کاملا رایگان",
      "لینک اختصاصی یکتا برای کسب و کار شما",
      "گالری نمونه کارها",
      "لیست خدمات با قیمت و زمان",
      "معرفی کامل کسب و کار",
      "لینک شبکه‌های اجتماعی",
      "نظرات و امتیازدهی مشتریان",
      "ثبت نوبت آنلاین توسط مشتری",
      "تغییر و لغو نوبت توسط مشتری با ذکر دلیل",
      "پیامک یادآوری خودکار",
      "بدون نیاز به نصب اپلیکیشن",
      "بدون نیاز به کارت بانکی",
    ],
  };

  // 3. Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "ساخت صفحه اختصاصی نوبت دهی آنلاین رایگان",
    provider: {
      "@type": "Organization",
      name: "آنتایم",
    },
    areaServed: "IR",
    audience: {
      "@type": "Audience",
      name: "صاحبان کسب و کار، آرایشگاه‌ها، سالن‌های زیبایی، ناخن‌کاران، پزشکان، باشگاه‌ها، آموزشگاه‌ها",
    },
    description:
      "ساخت صفحه اختصاصی نوبت دهی کاملا رایگان با امکانات کامل مدیریت کسب و کار. شامل معرفی، گالری، قیمت خدمات، نظرات، لینک اختصاصی و سیستم نوبت‌گیری آنلاین. بدون هیچ هزینه اولیه.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "امکانات صفحه اختصاصی رایگان",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "صفحه اختصاصی کاملا رایگان",
          },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "لینک سفارشی رایگان" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "گالری نمونه کارها" },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "لیست خدمات با قیمت و زمان",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "نظرات و امتیازدهی مشتریان",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "ثبت نوبت آنلاین بدون اپلیکیشن",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "تغییر و لغو نوبت توسط مشتری",
          },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "پیامک یادآوری خودکار" },
        },
      ],
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">
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
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        strategy="afterInteractive"
      />
      <Navigation />
      <CustomBookingHero />
      <CustomBookingShowcase />
      <CustomBookingFeatures />
      <CustomBookingComparison />
      <CustomBookingSteps />
      <CustomBookingLiveSamples />
      <CustomBookingCTA />
      <CustomBookingFAQ />

      <EnhancedFooter />
    </div>
  );
}
