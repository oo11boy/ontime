"use client";

import React, { useEffect, useState } from "react";
import { CalendarCheck, MessageSquare, TrendingUp, Trophy } from "lucide-react";
import Script from "next/script";

// تعریف اینترفیس برای تایپ‌سیف بودن داده‌ها
interface StatsData {
  users: number;
  bookings: number;
  sms: number;
  retention: number;
}

export default function StatsSection(): React.JSX.Element {
  const [counts, setCounts] = useState<StatsData>({
    users: 0,
    bookings: 0,
    sms: 0,
    retention: 0,
  });

  // انیمیشن افزایش اعداد برای جذب مخاطب (UX)
  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        users: prev.users < 1500 ? prev.users + 20 : 1500,
        bookings: prev.bookings < 45000 ? prev.bookings + 500 : 45000,
        sms: prev.sms < 125000 ? prev.sms + 1500 : 125000,
        retention: prev.retention < 95 ? prev.retention + 1 : 95,
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="py-24 bg-slate-50/50 border-y border-slate-100"
      aria-labelledby="stats-heading"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* هدر بخش برای موتورهای جستجو - استفاده از H2 برای رعایت سلسله‌مراتب */}
        <div className="text-center mb-16">
          <h2
            id="stats-heading"
            className="text-2xl lg:text-3xl font-black text-slate-800 mb-4"
          >
            چرا آنتایم انتخاب اول{" "}
            <span className="text-blue-600">کسب‌وکارهای هوشمند</span> است؟
          </h2>
          <p className="text-slate-500 font-medium">
            آمار موفقیت سیستم نوبت‌دهی ما در سال ۲۰۲۵
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <StatItem
            label="کسب‌وکار فعال"
            value={counts.users}
            suffix="+"
            icon={<Trophy className="text-amber-500" size={28} />}
            description="نرم‌افزار مدیریت آرایشگاه و مطب"
          />
          <StatItem
            label="نوبت دهی آنلاین"
            value={counts.bookings}
            suffix="+"
            icon={<CalendarCheck className="text-emerald-500" size={28} />}
            description="رزرو آنلاین نوبت بدون کنسلی"
          />
          <StatItem
            label="پیامک اطلاع‌رسانی"
            value={counts.sms}
            suffix="+"
            icon={<MessageSquare className="text-sky-500" size={28} />}
            description="یادآوری خودکار نوبت با پیامک"
          />
          <StatItem
            label="رضایت متخصصین"
            value={counts.retention}
            suffix="%"
            icon={<TrendingUp className="text-violet-500" size={28} />}
            description="بهترین سامانه رزرو وقت ایران"
          />
        </div>
      </div>
    </section>
  );
}

// کامپوننت داخلی StatItem برای مدیریت تگ‌های H3
function StatItem({ label, value, suffix, icon, description }: any) {
  return (
    <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      {/* اسکیمای اثبات اجتماعی و اعتبار برند (Social Proof Schema) */}
      <Script
        id="stats-section-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "آنتایم",
            interactionStatistic: [
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/SubscribeAction",
                userInteractionCount: 1500,
              },
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/TradeAction",
                userInteractionCount: 45000,
              },
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "1500",
              bestRating: "5",
              worstRating: "1",
            },
          }),
        }}
      />
      {/* دایره دکوراتیو پشت آیکون */}
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

      <div className="relative z-10">
        <div className="mb-4 bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all">
          {icon}
        </div>

        {/* استفاده از H3 برای کلمات کلیدی هر بخش */}
        <h3 className="text-slate-500 text-sm font-bold mb-2">{label}</h3>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl font-black text-slate-900 tabular-nums">
            {value.toLocaleString("fa-IR")}
          </span>
          <span className="text-blue-600 font-black text-xl">{suffix}</span>
        </div>

        <p className="text-[11px] font-bold text-slate-600 group-hover:text-blue-500 transition-colors">
          {description}
        </p>
      </div>
    </div>
  );
}
