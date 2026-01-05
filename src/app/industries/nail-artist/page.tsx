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

// ۱. متا دیتا تخصصی برای سئو (SEO)
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
};

export default function NailArtistLanding() {
  // ۲. اسکیما تخصصی برای خدمات ناخن (Structured Data)
  const nailIndustrySchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "نرم‌افزار تخصصی نوبت‌دهی و مدیریت مشتریان ناخن",
    "provider": {
      "@type": "Organization",
      "name": "آنتایم",
      "url": "https://ontimeapp.ir"
    },
    "areaServed": "IR",
    "description": "راهکار جامع دیجیتال برای ناخن‌کاران جهت مدیریت نوبت‌های کاشت، ترمیم، ژلیش و ارسال پیامک خودکار یادآوری به مشتریان.",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "خدمات مدیریت ناخن",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "یادآوری خودکار نوبت ترمیم"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "پنل اختصاصی سوابق کلاینت ناخن"
          }
        }
      ]
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">
      {/* تزریق اسکیما برای شناسایی بهتر توسط گوگل */}
      <Script
        id="nail-industry-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(nailIndustrySchema) }}
      />

      <NailNavigation />

      <main>
        {/* ۱. بخش قهرمان (H1 تخصصی ناخن در این کامپوننت است) */}
        <NailArtistHero />

        {/* ۲. آمار اعتماد (تعداد ناخن‌کاران فعال) */}
        <NailStats />

        {/* ۳. ویژگی‌های کلیدی (کاهش کنسلی و نظم میز ناخن) */}
        <NailFeatures />

        {/* ۴. گالری تصاویر با تم Rose و متون تخصصی */}
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

        {/* ۵. نحوه شروع به کار در ۳ مرحله ساده */}
        <NailStepFlow />

        {/* ۶. مقایسه روش سنتی و مدرن ناخن‌کاری */}
        <NailComparison />

        {/* ۷. سیستم پیامک تایید و یادآوری مخصوص کلاینت ناخن */}
        <NailSmsNotify />

        {/* ۸. قیمت‌گذاری و پلن‌های اشتراک */}
        <PricingSection />

        {/* ۹. سوالات متداول ناخن‌کاران (FAQ) */}
        <NailFAQ />

        {/* ۱۰. بخش پایانی و دعوت به شروع رایگان */}
        <NailFinalCTA />
      </main>

      <EnhancedFooter />
    </div>
  );
}