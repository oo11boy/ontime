// app/industries/beauty-salon/page.tsx
import { Metadata } from "next";
import Navigation from "@/components/Landing/Navigation";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import BeautyHero from "./components/BeautyHero";
import BeautyStats from "./components/BeautyStats";
import BeautyFeatures from "./components/BeautyFeatures";
import BeautyGallery from "./components/BeautyGallery"; // گالری تصاویر محیط اپلیکیشن
import BeautyComparison from "./components/BeautyComparison";
import BeautySMS from "./components/BeautySMS";
import BeautyFAQ from "./components/BeautyFAQ";
import FinalCTA from "./components/FinalCTA";
import PricingSection from "@/components/Landing/PricingSection";
import BeautySteps from "./components/BeautySteps";
import BeautyNavigation from "./components/BeautyNavigation";

export const metadata: Metadata = {
  title: "اپلیکیشن نوبت دهی آرایشگاه و مدیریت هوشمند سالن | آنتایم",
  
  description: "بهترین نرم‌افزار مدیریت نوبت و مشتری ویژه آرایشگران. ارسال پیامک یادآوری، لینک اختصاصی مدیریت نوبت برای مشتری، لیست قیمت آنلاین و پرونده الکترونیک.",
  
  keywords: [
    "نوبت دهی آرایشگاه",
    "مدیریت سالن زیبایی",
    "اپلیکیشن آرایشگری",
    "نرم افزار آرایشگاه زنانه",
    "پیامک یادآوری نوبت",
    "پنل مدیریت آرایشگر",
    "رزرو آنلاین آرایشگاه"
  ],

 openGraph: {
    title: "تخصصی‌ترین اپلیکیشن مدیریت نوبت و مشتری ویژه آرایشگران",
    description: "با دفترچه خداحافظی کنید! مدیریت حرفه‌ای نوبت‌ها و کاهش کنسلی با اپلیکیشن هوشمند آنتایم.",
    url: "https://ontimeapp.ir/industries/beauty-salon",
    siteName: "آنتایم",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "https://ontimeapp.ir/images/beauty-og-share.jpg", // حتما این تصویر را در پوشه public قرار دهید
        width: 1200,
        height: 630,
        alt: "محیط اپلیکیشن نوبت دهی آنتایم مخصوص آرایشگران",
      },
    ],
  },

  alternates: {
    canonical: "https://ontimeapp.ir/industries/beauty-salon",
  },

  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function BeautySalonLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white" dir="rtl">
     <BeautyNavigation/>
      
      <main>
        {/* ۱. بخش قهرمان: جذب آنی با کلمات کلیدی اصلی */}
        <BeautyHero />

        {/* ۲. آمار و ارقام: ایجاد اعتماد اولیه (Social Proof) */}
        <BeautyStats />

        {/* ۳. ویژگی‌ها: معرفی قابلیت‌های فنی (خدمات، قیمت، پرونده) */}
        <BeautyFeatures />

        {/* ۴. گالری: نمایش محیط واقعی اپلیکیشن برای رفع ابهام بصری */}
        <BeautyGallery />
       {/* ۲. آمار و ارقام: ایجاد اعتماد اولیه (Social Proof) */}
        <BeautySteps />
        {/* ۵. مقایسه: نشان دادن تضاد بین روش سنتی و مدرن (ایجاد نیاز) */}
        <BeautyComparison />

        {/* ۶. بخش پیامک: تمرکز بر بزرگترین مزیت رقابتی (کاهش کنسلی) */}
        <BeautySMS />

        {/* ۷. قیمت‌گذاری: ارائه پیشنهاد مالی شفاف */}
        <PricingSection />

        {/* ۸. سوالات متداول: رفع آخرین تردیدها و بهبود سئو با اسکیما */}
        <BeautyFAQ />

        {/* ۹. فراخوان نهایی: فشار نهایی برای ثبت‌نام و شروع تست رایگان */}
        <FinalCTA
          title="آماده‌اید بیزینس خود را منظم و حرفه‌ای کنید؟" 
          buttonText="شروع ۲ ماه رایگان ویژه آرایشگران" 
        />
      </main>

      <EnhancedFooter />
    </div>
  );
}