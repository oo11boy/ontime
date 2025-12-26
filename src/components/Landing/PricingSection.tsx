"use client";

import React from "react";
import { usePlans } from "@/hooks/usePlans";
import {
  Check,
  Loader2,
  MessageSquare,
  Phone,
  Zap,
  Gift,
  Star,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function PricingSection(): React.JSX.Element {
  const { data: plansData, isLoading: plansLoading } = usePlans();

  return (
    <section id="pricing" className="py-24 bg-white" dir="rtl">
      {/* اسکیمای اختصاصی قیمت‌گذاری و تعرفه‌های آنتایم (Pricing Schema) */}
<Script
  id="pricing-plans-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: "پلن‌های اشتراک آنتایم",
      description: "انواع تعرفه‌های نوبت‌دهی آنلاین بر اساس نیاز پیامکی کسب‌وکارها با دسترسی کامل به تمام امکانات.",
      provider: {
        "@type": "Organization",
        name: "آنتایم",
      },
      itemListElement: plansData?.plans.map((plan: any, index: number) => ({
        "@type": "Offer",
        position: index + 1,
        name: plan.title,
        price: plan.monthly_fee.toString(),
        priceCurrency: "IRR",
        description: `${plan.free_sms_month.toLocaleString("fa-IR")} پیامک رایگان ماهانه به همراه تمام امکانات مدیریتی.`,
        url: "https://ontimeapp.ir/#pricing",
        // اگر recurring باشد (ماهانه):
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.monthly_fee.toString(),
          priceCurrency: "IRR",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "MON", // ماهانه
          },
        },
        availability: "https://schema.org/InStock",
      })) || [],
    }),
  }}
/>
      <div className="max-w-7xl mx-auto px-6">
        {/* هدر بخش قیمت‌گذاری - سئو شده */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-slate-100 text-slate-600 font-bold text-xs mb-6 border border-slate-200 uppercase tracking-widest">
            شفافیت در هزینه‌ها
          </div>
          <h2 className="text-3xl lg:text-6xl font-black mb-6 text-slate-900 leading-tight">
            پلن‌های منعطف برای <br />
            <span className="text-blue-600 font-extrabold bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              رشد کسب‌وکار شما
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            بدون محدودیت فنی؛ تمام امکانات{" "}
            <strong>نرم‌افزار نوبت‌دهی آنتایم</strong> در همه پلن‌ها برای شما
            فعال است. فقط بر اساس نیاز پیامکی خود انتخاب کنید.
          </p>
        </div>

        {plansLoading ? (
          <div className="flex flex-col items-center py-32">
            <div className="relative">
              <Loader2 className="animate-spin text-blue-600" size={60} />
              <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse"></div>
            </div>
            <p className="mt-8 text-slate-500 font-black text-lg animate-pulse">
              در حال دریافت جدیدترین تعرفه‌ها...
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plansData?.plans.map((plan: any) => {
              const isFreeTrial = plan.monthly_fee === 0;
              const isProfessional = plan.plan_key === "professional";

              return (
                <div
                  key={plan.id}
                  className={`relative p-8 lg:p-12 rounded-[3.5rem] border-2 transition-all duration-500 flex flex-col group
                    ${
                      isFreeTrial
                        ? "border-emerald-500 bg-emerald-50/20 shadow-xl scale-105 z-10"
                        : isProfessional
                        ? "border-blue-600 bg-white shadow-2xl z-20"
                        : "border-slate-100 bg-white hover:border-blue-200"
                    }`}
                >
                  {/* نشان‌های متمایز کننده */}
                  {isFreeTrial ? (
                    <div className="absolute -top-6 inset-x-0 flex justify-center">
                      <span className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-200 animate-bounce">
                        <Gift size={16} />
                        هدیه شروع ( ۲ ماه رایگان)
                      </span>
                    </div>
                  ) : isProfessional ? (
                    <div className="absolute -top-6 inset-x-0 flex justify-center">
                      <span className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-200">
                        <Star size={16} fill="currentColor" />
                        پیشنهاد ویژه آنتایم
                      </span>
                    </div>
                  ) : null}

                  <div className="mb-10 text-center">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">
                      {plan.title}
                    </h3>

                    {isFreeTrial ? (
                      <div className="bg-emerald-700 text-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-200/50 transform -rotate-1 group-hover:rotate-0 transition-transform">
                        <div className="text-4xl font-black mb-1 tracking-tighter">
                          ۲ ماه رایگان
                        </div>
                        <div className="text-sm font-bold  border-t border-white/20 mt-3 pt-3">
                          ۱۵۰ پیامک هدیه / ماهانه
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black text-slate-900 tracking-tighter">
                            {plan.monthly_fee.toLocaleString("fa-IR")}
                          </span>
                          <span className="text-slate-500 text-sm font-bold">
                            تومان / ماه
                          </span>
                        </div>
                        {plan.free_sms_month > 0 && (
                          <div className="mt-4 text-emerald-800 text-[13px] font-black bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 inline-flex items-center gap-2">
                            <Zap size={14} fill="currentColor" />
                            {plan.free_sms_month.toLocaleString("fa-IR")} پیامک
                            رایگان ماهانه
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ویژگی‌های پلن */}
                  <div className="space-y-4 mb-12 grow px-2">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-3 flex items-center gap-2">
                      <Zap size={12} className="text-blue-500" />
                      امکانات فول در تمامی پلن‌ها
                    </p>
                    <FeatureItem label="پنل مدیریت هوشمند نوبت‌ها" />
                    <FeatureItem label="ارسال خودکار یادآوری نوبت" />
                    <FeatureItem label="لینک اختصاصی رزرو آنلاین" />
                    <FeatureItem label="سیستم CRM و مدیریت مشتریان" />
                    <FeatureItem label="گزارشات تحلیلی سود و زیان" />
                    <FeatureItem label="امکان جابجایی نوبت توسط کاربر" />
                    <FeatureItem label="پشتیبانی VIP و آموزش رایگان" />
                  </div>

                  <Link
                    href="/clientdashboard"
                    className={`group/btn w-full py-6 rounded-3xl font-black text-xl text-center transition-all duration-300 flex items-center justify-center gap-3
                      ${
                        isFreeTrial
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-100 hover:-translate-y-1"
                          : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-100 hover:-translate-y-1"
                      }`}
                  >
                    {isFreeTrial
                      ? "فعالسازی هدیه ۲ ماهه"
                      : "شروع اشتراک حرفه‌ای"}
                    <ArrowLeft className="group-hover/btn:-translate-x-2 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* فوتر بخش قیمت‌گذاری - برای کسب‌وکارهای بزرگ */}
        <div className="mt-24 relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900 rounded-[3.5rem] p-10 lg:p-16 overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] -mr-40 -mt-40"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="text-right">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-white">
                    نیاز به راهکار سازمانی دارید؟
                  </h3>
                </div>
                <p className="text-slate-400 text-lg lg:text-xl font-medium max-w-2xl leading-relaxed">
                  اگر کلینیک، سالن زیبایی زنجیره‌ای یا مجموعه‌ای با بیش از{" "}
                  <strong>۱۰ پرسنل</strong> دارید، ما برای شما پلن‌های شخصی‌سازی
                  شده با تخفیف ویژه در نظر گرفته‌ایم.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Link
                  href="tel:09981394832"
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-6 rounded-2xl font-black text-lg hover:shadow-2xl hover:bg-blue-50 transition-all active:scale-95"
                >
                  <Phone size={22} />
                  مشاوره رایگان فروش
                </Link>
                <Link
                  href="https://wa.me/09354502369"
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 border border-slate-700 text-white px-10 py-6 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all active:scale-95"
                >
                  <MessageSquare size={22} />
                  گفتگو در واتساپ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 group/item">
      <div className="bg-blue-50 rounded-full p-1.5 shrink-0 group-hover/item:bg-blue-600 transition-colors duration-300">
        <Check
          size={14}
          className="text-blue-600 group-hover/item:text-white"
          strokeWidth={4}
        />
      </div>
      <span className="text-slate-700 text-sm font-bold group-hover/item:text-slate-900 transition-colors">
        {label}
      </span>
    </div>
  );
}
