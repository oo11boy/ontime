"use client";

import React from "react";
import {
  Gift,
  Zap,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function FreeTrialPromo(): React.JSX.Element {
  return (
    <section className="py-24 relative overflow-hidden bg-white" dir="rtl">
      {/* اسکیمای تخصصی پیشنهاد دوره رایگان نرم‌افزار (Software SaaS Schema) */}
      <Script
        id="free-trial-promo-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "پنل نوبت‌دهی آنلاین آنتایم",
            operatingSystem: "Web, Android, iOS",
            applicationCategory: "BusinessApplication",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "IRR",
              description:
                "۶۰ روز اشتراک کاملاً رایگان به همراه ۱۵۰ پیامک هدیه ماهانه بدون نیاز به ثبت کارت بانکی.",
              availability: "https://schema.org/InStock",
              url: "https://ontimeapp.ir/clientdashboard",
            },
            featureList: [
              "۲ ماه اشتراک هدیه",
              "۱۵۰ پیامک رایگان در ماه",
              "پشتیبانی ویژه راه‌اندازی",
              "بدون هزینه نصب",
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5",
              reviewCount: "1500",
            },
          }),
        }}
      />
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative group">
          {/* افکت نوری و گرادینت پس‌زمینه برای جلب توجه حداکثری */}
          <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 via-blue-600 to-emerald-500 rounded-[4rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-gradient-x"></div>

          <div className="relative bg-slate-900 rounded-[3.5rem] p-8 lg:p-20 overflow-hidden border border-slate-800 shadow-2xl">
            {/* المان‌های بصری انتزاعی */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full -ml-40 -mt-40 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full -mr-40 -mb-40 blur-3xl"></div>

            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              {/* بخش متن: سئو شده برای عبارات "رایگان" و "نوبت دهی" */}
              <div className="text-right space-y-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 shadow-inner">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-xs lg:text-sm font-black tracking-tight">
                    فرصت محدود: عضویت در باشگاه مشتریان آنتایم
                  </span>
                </div>

                <h2 className="text-4xl lg:text-7xl font-black text-white leading-[1.15]">
                  شروع هوشمندانه <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-blue-400">
                    با ۲ ماه اشتراک رایگان
                  </span>
                </h2>

                <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed max-w-xl">
                  ما به کارایی <strong>نرم‌افزار نوبت‌دهی آنتایم</strong> ایمان
                  داریم. به همین دلیل اجازه می‌دهیم{" "}
                  <span className="text-white font-bold underline decoration-emerald-500 decoration-2">
                    ۶۰ روز کامل
                  </span>{" "}
                  از تمام امکانات حرفه‌ای استفاده کنید و هر ماه{" "}
                  <span className="text-emerald-400 font-bold">
                    ۱۵۰ پیامک هدیه
                  </span>{" "}
                  برای یادآوری نوبت‌ها از ما بگیرید.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <BenefitItem text="دسترسی به تمام امکانات پنل مدیریت" />
                  <BenefitItem text="ارسال ۱۵۰ پیامک هدیه در هر ماه" />
                  <BenefitItem text="بدون نیاز به ثبت کارت بانکی" />
                  <BenefitItem text="پشتیبانی ویژه راه اندازی اولیه" />
                  <BenefitItem text="قابلیت لغو اشتراک در هر لحظه" />
                  <BenefitItem text="بدون هزینه نصب و راه اندازی" />
                </div>
              </div>

              {/* بخش کارت قیمت و CTA: تمرکز بر تضاد بصری */}
              <div className="flex justify-center lg:justify-end">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 lg:p-14 rounded-[3.5rem] w-full max-w-md text-center shadow-2xl relative transition-transform hover:scale-[1.02] duration-500">
                  {/* بج هدیه */}
                  <div className="absolute -top-6 -right-6 bg-emerald-500 text-slate-900 w-20 h-20 rounded-2xl rotate-12 shadow-2xl flex items-center justify-center animate-bounce z-20">
                    <Gift size={40} strokeWidth={2.5} />
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="text-slate-400 font-bold text-sm tracking-widest uppercase">
                        ارزش این پیشنهاد
                      </div>
                      <div className="text-3xl font-black text-slate-500 line-through decoration-red-500/50">
                        ۱,۲۰۰,۰۰۰ تومان
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-7xl lg:text-8xl font-black text-white tracking-tighter">
                          رایگان
                        </span>
                        <span className="text-emerald-400 font-bold text-lg mt-2">
                          برای ۶۰ روز اول
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-4">
                      <Link
                        href="/clientdashboard"
                        className="group relative flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-6 rounded-3xl font-black text-xl transition-all shadow-[0_20px_50px_-12px_rgba(16,185,129,0.5)] active:translate-y-1"
                      >
                        فعالسازی هدیه ۲ ماهه
                        <ArrowLeft
                          className="group-hover:-translate-x-2 transition-transform"
                          strokeWidth={3}
                        />
                      </Link>

                      <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-bold">
                        <Clock size={14} />
                        <span>زمان باقی‌مانده تا پایان این طرح محدود</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-300 group/item">
      <div className="bg-emerald-500/20 p-1 rounded-full group-hover/item:bg-emerald-500 transition-colors">
        <CheckCircle2
          className="text-emerald-500 group-hover/item:text-slate-900 shrink-0"
          size={16}
        />
      </div>
      <span className="text-[13px] lg:text-sm font-bold">{text}</span>
    </div>
  );
}
