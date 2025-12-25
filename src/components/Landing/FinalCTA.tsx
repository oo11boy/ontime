"use client";

import { Gift, Phone, Sparkles, Zap, ArrowLeft, Users } from "lucide-react";
import React from "react";
import Link from "next/link";
import Script from "next/script";

export default function FinalCTA(): React.JSX.Element {
  return (
    <section className="py-24 bg-slate-50/50" dir="rtl">
      {/* اسکیمای پیشنهاد ویژه و فراخوان نهایی (Special Offer Schema) */}
      <Script
        id="final-cta-offer-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "پنل نوبت‌دهی هوشمند آنتایم",
            image: "https://ontimeapp.ir/icons/icon-192.png",
            description:
              "سیستم مدیریت نوبت‌دهی آنلاین با قابلیت ارسال پیامک یادآوری و مدیریت پرسنل.",
            brand: {
              "@type": "Brand",
              name: "آنتایم",
            },
            offers: {
              "@type": "Offer",
              url: "https://ontimeapp.ir/clientdashboard",
              priceCurrency: "IRR",
              price: "0",
              availability: "https://schema.org/InStock",
              description:
                "۲ ماه اشتراک رایگان به همراه ۱۵۰ پیامک هدیه ماهانه برای شروع.",
              seller: {
                "@type": "Organization",
                name: "آنتایم",
              },
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "1500",
            },
          }),
        }}
      />
      <div className="max-w-7xl mx-auto px-6">
        {/* باکس اصلی با طراحی Dark Mode جذاب برای کنتراست نهایی */}
        <div className="bg-slate-900 rounded-[3.5rem] lg:rounded-[5rem] p-10 lg:p-28 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] border border-slate-800">
          {/* افکت‌های نوری پس‌زمینه (Blur) */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] -mr-80 -mt-80 pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none"></div>

          <div className="relative z-10">
            {/* نشان هدیه ورودی */}
            <div className="inline-flex items-center gap-3 bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-2xl mb-10 border border-emerald-500/20 shadow-inner">
              <Gift size={22} className="animate-bounce" />
              <span className="font-black text-xs lg:text-sm uppercase tracking-widest">
                هدیه ویژه برای شروع هوشمندانه شما
              </span>
            </div>

            <h2 className="text-4xl lg:text-8xl font-black mb-12 leading-[1.1] tracking-tight">
              آماده‌اید بیزینس خود را <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-blue-400 to-emerald-400 animate-gradient-x">
                منظم و حرفه‌ای
              </span>{" "}
              کنید؟
            </h2>

            {/* کارت‌های مزیت با هاور افکت سه‌بعدی */}
            <div className="grid md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
              <BenefitCard
                icon={<Gift className="text-emerald-400" size={32} />}
                title="۲ ماه اشتراک هدیه"
                desc="دسترسی نامحدود به تمام امکانات بدون هزینه"
              />
              <BenefitCard
                icon={<Zap className="text-blue-400" size={32} />}
                title="۱۵۰ پیامک رایگان"
                desc="هر ماه، هدیه آنتایم برای نوبت‌دهی شما"
              />
              <BenefitCard
                icon={<Sparkles className="text-amber-400" size={32} />}
                title="راه اندازی فوری"
                desc="بدون نیاز به نصب، از همین لحظه شروع کنید"
              />
            </div>

            {/* دکمه‌های فراخوان قدرتمند */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/clientdashboard"
                className="group relative w-full sm:w-auto px-12 py-7 bg-emerald-500 text-slate-950 rounded-[2.5rem] font-black text-2xl hover:bg-emerald-400 transition-all transform hover:scale-[1.03] active:scale-95 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] flex items-center justify-center gap-4"
              >
                ۲ ماه رایگان شروع کنید
                <ArrowLeft
                  className="group-hover:-translate-x-2 transition-transform"
                  strokeWidth={3}
                />
              </Link>

              <Link
                href="tel:09981394832"
                className="w-full sm:w-auto px-10 py-7 bg-white/5 text-white rounded-[2.5rem] font-black text-xl border-2 border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-4 backdrop-blur-md group"
              >
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <Phone size={24} fill="currentColor" className="text-white" />
                </div>
                <span className="tabular-nums">۰۹۹۸۱۳۹۴۸۳۲</span>
              </Link>
            </div>

            {/* بخش اعتماد سازی نهایی (Social Proof) */}
            <div className="mt-20 flex flex-col items-center gap-6">
              <div className="flex -space-x-4 space-x-reverse items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center shadow-2xl relative"
                  >
                    <Users size={20} className="text-slate-500" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-emerald-500 flex items-center justify-center text-[10px] font-black text-slate-950 shadow-2xl z-10">
                  +۱.۵k
                </div>
              </div>
              <p className="text-slate-600 text-base lg:text-lg font-bold leading-relaxed max-w-lg">
                به جمع <span className="text-white">۱,۵۰۰ مجموعه موفق</span> که
                با آنتایم هزینه‌های خود را کاهش داده‌اند بپیوندید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white/5 p-10 rounded-[3rem] backdrop-blur-md border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-500 group/card transform hover:-translate-y-2">
      <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/card:scale-110 transition-transform duration-500 shadow-inner">
        {icon}
      </div>
      <h4 className="text-xl font-black mb-3 text-white group-hover/card:text-emerald-400 transition-colors">
        {title}
      </h4>
      <p className="text-slate-600 text-sm font-bold leading-relaxed opacity-80 group-hover/card:opacity-100">
        {desc}
      </p>
    </div>
  );
}
