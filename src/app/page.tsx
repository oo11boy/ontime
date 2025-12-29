import Navigation from "@/components/Landing/Navigation";
import HeroSection from "@/components/Landing/HeroSection";
import StatsSection from "@/components/Landing/StatsSection";
import SpecificSolutions from "@/components/Landing/SpecificSolutions";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import DetailedSMS from "@/components/Landing/DetailedSMS";
import AnalyticsSection from "@/components/Landing/AnalyticsSection";
import IntegrationEcosystem from "@/components/Landing/IntegrationEcosystem";
import FreeTrialPromo from "@/components/Landing/FreeTrialPromo";
import CalculatorEnhanced from "@/components/Landing/CalculatorEnhanced";
import PricingSection from "@/components/Landing/PricingSection";
import FAQSection from "@/components/Landing/FAQSection";
import FinalCTA from "@/components/Landing/FinalCTA";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import Namad from "@/components/Landing/Namad";
import IndustrySelector from "@/components/Landing/IndustrySelector";

import { Metadata } from "next";
import { mainmetadata } from "./metadata";
import Script from "next/script";
import { landingPageSchemas } from "@/components/Landing/schemas/landing-schemas";
import UniversalAppGallery from "./industries/beauty-salon/components/BeautyGallery";

export const metadata: Metadata = mainmetadata;

export default function OnTimeLandingPage() {
  return (
    <div
      className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700"
      dir="rtl"
    >
      {/* تزریق تمام اسکیماهای سئو به هدر برای شناسایی توسط ربات‌های گوگل */}
      {landingPageSchemas.map((schema) => (
        <Script
          key={schema.id}
          id={schema.id}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema.data),
          }}
        />
      ))}

      {/* ناوبری اصلی سایت */}
      <Navigation />

      {/* استفاده از تگ main برای سئو حیاتی است (Semantic HTML) */}
      <main className="pt-20">
        {/* ۱. بخش قهرمان (H1) - معرفی اصلی محصول و ارزش پیشنهادی */}
        <HeroSection />

        {/* ۲. اعتبار سنجی (Social Proof) و آمار موفقیت */}
        <StatsSection />
<UniversalAppGallery
  accentColor="blue"
  title={<>مدیریت نوبت دهی در <span className="text-blue-500">دستان شما</span></>}
  description="محیط کاربری اپلیکیشن نوبت دهی آنتایم ساده، سریع و متناسب با نیاز تمام کسب‌وکارهای نوبت‌محور طراحی شده است."

/>

        {/* ۱۱. انتخاب سریع صنف و دعوت به اقدام نهایی */}
        <IndustrySelector />

        {/* ۴. ویژگی‌های کلیدی - تمرکز بر رزرو وقت و مدیریت مشتری */}
        <FeaturesSection />

        {/* ۵. اتوماسیون پیامکی (نقطه تمایز محصول) */}
        <DetailedSMS />

        {/* ۶. تحلیل داده‌ها و اکوسیستم یکپارچه */}
        <AnalyticsSection />
        <IntegrationEcosystem />

        {/* ۷. پیشنهاد ویژه (Free Trial) - نرخ تبدیل (Conversion) */}
        <FreeTrialPromo />

        {/* ۸. ماشین حساب ROI - تعامل با کاربر (Engagement) */}
        <CalculatorEnhanced />

        {/* ۹. پلن‌های قیمت‌گذاری شفاف */}
        <PricingSection />

        {/* ۱۰. سوالات متداول و نمادهای اعتماد */}
        <FAQSection />
        <Namad />

        <FinalCTA />
      </main>

      {/* فوتر بهینه شده برای لینک‌سازی داخلی و سئو */}
      <EnhancedFooter />
    </div>
  );
}