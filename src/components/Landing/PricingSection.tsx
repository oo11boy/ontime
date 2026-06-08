"use client";

import React from "react";
import { usePlans } from "@/hooks/usePlans";
import {
  Check,
  Loader2,

  Zap,
  Gift,
  Star,

  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { freetime } from "@/lib/freetime";

// پلن رایگان استاتیک
const freePlan = {
  id: "free-trial",
  title: "آزمایشی رایگان",
  plan_key: "free_trial",
  monthly_fee: 0,
free_sms_month: typeof freetime.sms === 'number' ? freetime.sms : (parseInt(freetime.sms as string) || 50),
  is_free_trial: true,
};

export default function PricingSection(): React.JSX.Element {
  const { data: plansData, isLoading: plansLoading } = usePlans();

  // ترکیب پلن‌های API با پلن رایگان استاتیک
  const allPlans = plansData?.plans 
    ? [freePlan, ...plansData.plans] 
    : [freePlan];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white" dir="rtl">
      {/* اسکیمای اختصاصی قیمت‌گذاری */}
      <Script
        id="pricing-plans-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",  
            name: "نرم افزار نوبت دهی آنلاین آنتایم",
            description: "انواع تعرفه‌های نوبت‌دهی آنلاین بر اساس نیاز پیامکی کسب‌وکارها با دسترسی کامل به تمام امکانات.",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            image: "https://ontimeapp.ir/icons/icon-192.png",
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "IRR",
              lowPrice: "0",
              highPrice: plansData?.plans.length 
                ? Math.max(...plansData.plans.map((p: any) => p.monthly_fee)) 
                : "500000",
              offerCount: (plansData?.plans.length || 0) + 1,
              offers: [
                {
                  "@type": "Offer",
                  priceValidUntil: "2025-12-31",
                  name: "پلن آزمایشی ۲ هفته رایگان",
                  price: "0",
                  priceCurrency: "IRR",
                  description: `${freetime.sms} پیامک رایگان به همراه تمام امکانات مدیریت نوبت و مشتری به مدت ۲ هفته`,
                  url: "https://ontimeapp.ir/#pricing",
                  availability: "https://schema.org/InStock",
                },
                ...(plansData?.plans.map((plan: any) => ({
                  "@type": "Offer",
                  priceValidUntil: "2025-12-31",
                  name: plan.title,
                  price: plan.monthly_fee.toString(),
                  priceCurrency: "IRR",
                  description: `${plan.free_sms_month.toLocaleString("fa-IR")} پیامک رایگان ماهانه به همراه تمام امکانات مدیریتی.`,
                  url: "https://ontimeapp.ir/#pricing",
                  availability: "https://schema.org/InStock",
                })) || [])
              ],
            },
            provider: {
              "@type": "Organization",
              name: "آنتایم",
              url: "https://ontimeapp.ir"
            }
          }),
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* هدر بخش قیمت‌گذاری */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-slate-100 text-slate-600 font-bold text-xs mb-4 md:mb-6 border border-slate-200 uppercase tracking-widest">
            شفافیت در هزینه‌ها
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 text-slate-900 leading-tight">
            پلن‌های منعطف برای <br />
            <span className="text-blue-600 font-extrabold bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              رشد کسب‌وکار شما
            </span>
          </h2>
          <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed px-4">
            بدون محدودیت فنی؛ تمام امکانات{" "}
            <strong>نرم‌افزار نوبت‌دهی آنتایم</strong> در همه پلن‌ها برای شما
            فعال است. فقط بر اساس نیاز پیامکی خود انتخاب کنید.
          </p>
        </div>

        {plansLoading ? (
          <div className="flex flex-col items-center py-16 md:py-32">
            <div className="relative">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse"></div>
            </div>
            <p className="mt-6 md:mt-8 text-slate-500 font-black text-base md:text-lg animate-pulse">
              در حال دریافت جدیدترین تعرفه‌ها...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8 items-stretch">
            {allPlans.map((plan: any, index: number) => {
              const isFreeTrial = plan.monthly_fee === 0 || plan.is_free_trial;
              const isProfessional = plan.plan_key === "professional";
              const isHighlighted = isFreeTrial || isProfessional;

              return (
                <div
                  key={plan.id || index}
                  className={`relative p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] border-2 transition-all duration-500 flex flex-col group
                    ${
                      isFreeTrial
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white shadow-xl lg:scale-105 z-10"
                        : isProfessional
                        ? "border-blue-600 bg-white shadow-2xl z-20"
                        : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl"
                    }`}
                >
                  {/* نشان‌های متمایز کننده */}
                  {isFreeTrial && (
                    <div className="absolute -top-4 md:-top-6 inset-x-0 flex justify-center">
                      <span className="bg-emerald-600 text-white px-3 md:px-6 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs flex items-center gap-1 md:gap-2 shadow-lg shadow-emerald-200 animate-bounce whitespace-nowrap">
                        <Gift size={12} className="md:w-4 md:h-4" />
                        🎁 {freetime.plan} رایگان
                      </span>
                    </div>
                  )}
                  
                  {!isFreeTrial && isProfessional && (
                    <div className="absolute -top-4 md:-top-6 inset-x-0 flex justify-center">
                      <span className="bg-blue-600 text-white px-3 md:px-6 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs flex items-center gap-1 md:gap-2 shadow-lg shadow-blue-200 whitespace-nowrap">
                        <Star size={12} className="md:w-4 md:h-4" fill="currentColor" />
                        پیشنهاد ویژه
                      </span>
                    </div>
                  )}

                  <div className="mb-6 md:mb-8 lg:mb-10 text-center mt-4 md:mt-6">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 mb-3 md:mb-4 lg:mb-6">
                      {plan.title}
                    </h3>

                    {isFreeTrial ? (
                      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] shadow-xl shadow-emerald-200/50 transform hover:scale-105 transition-transform duration-300">
                        <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 tracking-tighter">
                          {freetime.plan} رایگان
                        </div>
                        <div className="text-xs md:text-sm font-bold border-t border-white/20 mt-2 md:mt-3 pt-2 md:pt-3">
                          {freetime.sms} پیامک هدیه
                        </div>
                        <div className="text-[8px] md:text-[10px] mt-1 md:mt-2 text-emerald-200">
                          بدون نیاز به کارت بانکی
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="flex flex-wrap items-baseline justify-center gap-1">
                          <span className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">
                            {plan.monthly_fee.toLocaleString("fa-IR")}
                          </span>
                          <span className="text-xs md:text-sm text-slate-500 font-bold">
                            تومان / ماه
                          </span>
                        </div>
                        {plan.free_sms_month > 0 && (
                          <div className="mt-3 md:mt-4 text-emerald-700 text-[11px] md:text-[13px] font-black bg-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-emerald-100 inline-flex items-center gap-1 md:gap-2">
                            <Zap size={12} className="md:w-14" />
                            {plan.free_sms_month.toLocaleString("fa-IR")} پیامک
                            رایگان ماهانه
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ویژگی‌های پلن */}
                  <div className="space-y-2 md:space-y-3 lg:space-y-4 mb-6 md:mb-8 lg:mb-12 grow px-1 md:px-2">
                    <p className="text-[8px] md:text-[10px] text-slate-600 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] mb-3 md:mb-4 lg:mb-6 border-b border-slate-50 pb-2 md:pb-3 flex items-center gap-1 md:gap-2">
                      <Zap size={10} className="md:w-3 md:h-3 text-blue-500" />
                      امکانات فول در تمامی پلن‌ها
                    </p>
                    <div className="space-y-2 md:space-y-3">
                      <FeatureItem label="پنل مدیریت هوشمند نوبت‌ها" />
                      <FeatureItem label="ارسال خودکار یادآوری نوبت" />
                      <FeatureItem label="لینک اختصاصی رزرو آنلاین" />
                      <FeatureItem label="سیستم CRM و مدیریت مشتریان" />
                      <FeatureItem label="گزارشات تحلیلی سود و زیان" />
                      <FeatureItem label="امکان جابجایی نوبت توسط کاربر" />
                      <FeatureItem label="پشتیبانی VIP و آموزش رایگان" />
                    </div>
                  </div>

                  <Link
                    href="/clientdashboard"
                    className={`group/btn w-full py-4 md:py-5 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-base md:text-lg lg:text-xl text-center transition-all duration-300 flex items-center justify-center gap-2 md:gap-3
                      ${
                        isFreeTrial
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 hover:-translate-y-1 active:translate-y-0"
                          : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100 hover:-translate-y-1 active:translate-y-0"
                      }`}
                  >
                    {isFreeTrial
                      ? `شروع ${freetime.plan} رایگان`
                      : "شروع اشتراک حرفه‌ای"}
                    <ArrowLeft className="group-hover/btn:-translate-x-1 md:group-hover/btn:-translate-x-2 transition-transform" size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 md:gap-3 group/item">
      <div className="bg-blue-50 rounded-full p-1 shrink-0 group-hover/item:bg-blue-600 transition-colors duration-300">
        <Check
          size={10}
          className="text-blue-600 group-hover/item:text-white md:w-3.5 md:h-3.5"
          strokeWidth={3}
        />
      </div>
      <span className="text-slate-700 text-[11px] md:text-xs lg:text-sm font-bold group-hover/item:text-slate-900 transition-colors">
        {label}
      </span>
    </div>
  );
}