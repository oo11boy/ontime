
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

import { Metadata } from "next";
import { mainmetadata } from "./metadata";
import Script from "next/script";
import { landingPageSchemas } from "@/components/Landing/schemas/landing-schemas";

export const metadata: Metadata = mainmetadata;

export default function OnTimeLandingPage() {
  return (
    <div 
      className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700" 
      dir="rtl"
    >
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
      {/* هدر سایت با دسترسی سریع */}
      <Navigation />
      
      {/* استفاده از تگ main برای سئو حیاتی است */}
      <main className="pt-20">
        
        {/* ۱. بخش قهرمان (H1) - معرفی اصلی محصول */}
        <HeroSection />

        {/* ۲. اعتبار سنجی (Social Proof) */}
        <StatsSection />

        {/* ۳. راهکارهای صنفی (H2) - کلمات کلیدی: آرایشگاه، مطب، وکیل */}
        <SpecificSolutions />

        {/* ۴. ویژگی‌های کلیدی - کلمات کلیدی: رزرو وقت، مدیریت مشتری */}
        <FeaturesSection />

        {/* ۵. ارسال پیامک هوشمند (نقطه فروش اصلی) */}
        <DetailedSMS />

        {/* ۶. تحلیل داده‌ها و اکوسیستم */}
        <AnalyticsSection />
        <IntegrationEcosystem />

        {/* ۷. آفر ۳ ماه رایگان (هوک بازاریابی) */}
        <FreeTrialPromo />

        {/* ۸. ماشین حساب بازگشت سرمایه (ROI) */}
        <CalculatorEnhanced />

        {/* ۹. قیمت گذاری شفاف */}
        <PricingSection />

        {/* ۱۰. سوالات متداول (Schema FAQ) */}
        <FAQSection />

        {/* ۱۱. دعوت به اقدام نهایی */}
        <FinalCTA />
        
      </main>

      {/* فوتر بهینه شده برای لینک‌سازی داخلی */}
      <EnhancedFooter />
    </div>
  );
}