import { Metadata } from "next";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import BeautyHero from "./components/BeautyHero";
import BeautyStats from "./components/BeautyStats";
import BeautyFeatures from "./components/BeautyFeatures";
import BeautyGallery from "./components/BeautyGallery";
import BeautyComparison from "./components/BeautyComparison";
import BeautySMS from "./components/BeautySMS";
import BeautyFAQ from "./components/BeautyFAQ";
import FinalCTA from "@/components/Landing/FinalCTA"; // اصلاح مسیر ایمپورت
import PricingSection from "@/components/Landing/PricingSection";
import BeautySteps from "./components/BeautySteps";
import BeautyNavigation from "./components/BeautyNavigation";
import Script from "next/script";

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
        url: "/images/screens/beauty-og.jpg", // مسیر را در پوشه public چک کنید
        width: 1200,
        height: 630,
        alt: "محیط اپلیکیشن نوبت دهی آنتایم مخصوص آرایشگران",
      },
    ],
  },
};

export default function BeautySalonLanding() {
  // اسکیما برای خدمات تخصصی آرایشگاه (LocalBusiness یا Service)
  const beautySchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "نرم‌افزار مدیریت و نوبت‌دهی آرایشگاه",
    provider: {
      "@type": "Organization",
      name: "آنتایم",
    },
    areaServed: "IR",
    description:
      "راهکار جامع مدیریت سالن‌های زیبایی، نوبت‌دهی آنلاین و سیستم یادآوری پیامکی مشتریان.",
  };

  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">
      {/* تزریق اسکیما اختصاصی این صفحه */}
      <Script
        id="beauty-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(beautySchema) }}
      />

      <BeautyNavigation />

      <main>
        {/* ۱. بخش قهرمان: H1 باید در این کامپوننت باشد */}
        <BeautyHero />

        {/* ۲. اعتبار سنجی و آمار */}
        <BeautyStats />

        {/* ۳. ویژگی‌های تخصصی صنف آرایشگری */}
        <BeautyFeatures />

        {/* ۴. نمایش بصری محیط کاربری */}
        <BeautyGallery
          accentColor="pink"
          title={
            <>
              نمای داخلی <span className="text-pink-500">اپلیکیشن</span>
            </>
          }
          description="سادگی در طراحی، قدرت در مدیریت. تمام آنچه یک آرایشگر حرفه‌ای نیاز دارد."
        />

        {/* ۵. مراحل شروع به کار (How it works) */}
        <BeautySteps />

        {/* ۶. مقایسه سنتی vs مدرن (بسیار تاثیرگذار در تبدیل) */}
        <BeautyComparison />

        {/* ۷. تمرکز بر سیستم پیامکی و کاهش ضرر مالی */}
        <BeautySMS />

        {/* ۸. قیمت‌گذاری (استفاده از کامپوننت مشترک برای یکپارچگی) */}
        <PricingSection />

        {/* ۹. رفع ابهامات نهایی */}
        <BeautyFAQ />

        {/* ۱۰. دعوت به اقدام نهایی با تاکید بر ۶۰ روز رایگان */}
        <FinalCTA />
      </main>

      <EnhancedFooter />
    </div>
  );
}
