"use client";

import {
  Bell,
  Calendar,
  Smartphone,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import React from "react";

interface SMSBenefit {
  title: string;
  desc: string;
  stat: string;
}

export default function DetailedSMS(): React.JSX.Element {
  const benefits: SMSBenefit[] = [
    {
      title: "کاهش ۸۰ درصدی کنسلی‌ها",
      desc: "با ارسال لینک اختصاصی، مشتری می‌تواند در صورت بروز مشکل نوبت را تغییر دهد تا ساعت کاری شما سوخت نشود.",
      stat: "۸۰٪",
    },
    {
      title: "صرفه‌جویی در زمان تماس",
      desc: "تایید آنی رزرو و ارسال خودکار آدرس، نیاز به تماس‌های تلفنی تکراری را تا ۴۰ ساعت در ماه کاهش می‌دهد.",
      stat: "۴۰ساعت",
    },
    {
      title: "پیگیری هوشمند و خودکار",
      desc: "سیستم یادآوری نوبت با پیامک، چند ساعت قبل از موعد، احتمال فراموشی مشتری را به صفر می‌رساند.",
      stat: "۱۰۰٪",
    },
  ];

  return (
    <section
      id="sms-automation"
      className="py-24 bg-slate-950 overflow-hidden relative"
      dir="rtl"
    >
      {/* اسکیمای تخصصی اتوماسیون پیامکی و اطلاع‌رسانی */}
      <Script
        id="sms-automation-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "سامانه پیامکی نوبت‌دهی هوشمند",
            name: "اتوماسیون یادآوری نوبت آنتایم",
            description:
              "ارسال خودکار پیامک تایید رزرو، یادآوری نوبت و لینک اختصاصی تغییر زمان بدون نیاز به نصب اپلیکیشن توسط مشتری.",
            provider: {
              "@type": "Organization",
              name: "آنتایم",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "مزایای اطلاع‌رسانی آنتایم",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "کاهش ۸۰ درصدی کنسلی نوبت",
                    description:
                      "ارسال لینک هوشمند برای تغییر نوبت توسط مشتری.",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "یادآوری خودکار پیامکی",
                    description:
                      "اطلاع‌رسانی زمان نوبت چند ساعت قبل از موعد به صورت اتوماتیک.",
                  },
                },
              ],
            },
          }),
        }}
      />
      {/* الگوهای پس‌زمینه برای عمق بخشیدن به طراحی */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* بخش محتوایی: تمرکز بر سئو هدینگ‌ها */}
        <div className="text-right">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs mb-6 border border-blue-500/20">
            <MessageSquare size={14} />
            هوشمندترین سامانه یادآوری نوبت
          </div>

          {/* H2: استفاده از کلمات کلیدی قدرتمند */}
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-8 leading-tight">
            <span className="text-blue-500 text-2xl lg:text-3xl block mb-2 font-bold">
              اتوماسیون پیامکی آنتایم؛
            </span>
            مشتری شما نیاز به نصب <br /> هیچ اپلیکیشنی ندارد!
          </h2>

          <p className="text-lg text-slate-300 mb-10 leading-relaxed font-medium">
            قدرت <strong>نرم‌افزار نوبت‌دهی آنلاین آنتایم</strong> در سادگی آن
            است. شما نوبت را در پنل مدیریت ثبت می‌کنید و سیستم تمام مراحل{" "}
            <strong>اطلاع‌رسانی و یادآوری پیامکی</strong> را به صورت خودکار
            انجام می‌دهد.
          </p>

          <div className="grid gap-4">
            {benefits.map((item, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  {/* H3 برای هر مزیت جهت تقویت سئو محلی */}
                  <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-2xl font-black text-blue-500 tabular-nums">
                    {item.stat}
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* بخش بصری: شبیه‌ساز موبایل (Visual Social Proof) */}
        <div className="relative">
          <div className="absolute -inset-20 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>

          <div className="relative mx-auto w-full max-w-[380px] bg-slate-900 rounded-[3rem] border-12 border-slate-800 shadow-2xl overflow-hidden aspect-9/18">
            {/* Notch موبایل */}
            <div className="h-8 w-full bg-slate-800 flex justify-center items-end pb-1">
              <div className="w-16 h-4 bg-slate-900 rounded-full"></div>
            </div>

            <div className="p-6 space-y-6">
              {/* هدر چت پیامکی */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Image
                  src="/icons/icon-192.png"
                  alt="اپلیکیشن نوبت دهی آنتایم"
                  height={40} 
                  width={40}
                  className="w-10 h-10 object-cover bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/40"
                />
                <div>
                  <div className="text-white text-sm font-bold">OnTime SMS</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={10} />
                    پنل تایید شده نوبت‌دهی
                  </div>
                </div>
              </div>

              {/* باکس پیامک ۱: تایید رزرو نوبت */}
              <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-xl transform rotate-1">
                <div className="flex items-center gap-2 mb-2 ">
                  <CheckCircle size={14} />
                  <span className="text-[10px] font-bold">
                    تایید رزرو نوبت آنلاین
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed font-bold">
                  سلام، نوبت شما در «کلینیک دکتر احمدی» ثبت شد.
                  <br />
                  <br />
                  📅 تاریخ: ۲۵ اسفند - ساعت ۱۷:۰۰
                  <br />
                  📍 لوکیشن: [لینک نقشه گوگل]
                </p>
              </div>

              {/* باکس پیامک ۲: یادآوری و لینک هوشمند */}
              <div className="bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-tr-none shadow-xl transform -rotate-1">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Bell size={14} className="animate-bounce" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    یادآوری خودکار نوبت
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  یادآوری: نوبت شما برای فردا ساعت ۱۷:۰۰ است.
                  <br />
                  <br />
                  لینک مشاهده جزییات و تغییر زمان نوبت:
                </p>
                <div className="mt-2 text-[10px] text-blue-400 bg-black/20 p-2 rounded border border-white/5 font-mono text-center">
                  ontime.ir/r/a7x92
                </div>
              </div>

              {/* راهنمای بصری مشتری */}
              <div className="bg-white/5 border border-dashed border-white/20 p-5 rounded-2xl text-center">
                <Smartphone className="mx-auto mb-2 text-blue-500" size={24} />
                <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                  مشتری با کلیک بر روی لینک، مستقیماً وارد{" "}
                  <span className="text-white">صفحه اختصاصی رزرو</span> می‌شود
                  (بدون نیاز به نصب یا ثبت‌نام).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
