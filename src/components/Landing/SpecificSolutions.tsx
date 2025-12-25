import {
  Scissors,
  Stethoscope,
  Scale,
  Sparkles,
  Car,
  Clock,
  Check,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import Script from "next/script";
import React from "react";

interface Industry {
  icon: React.ReactNode;
  title: string;
  seoKeyword: string;
  description: string;
}

export default function RealIndustrySolutions(): React.JSX.Element {
  const industries: Industry[] = [
    {
      icon: <Scissors size={24} />,
      title: "آرایشگاه و سالن زیبایی",
      seoKeyword: "نوبت دهی آرایشگاه",
      description:
        "مدیریت لاین‌های مختلف و کاهش کنسلی نوبت‌های خدمات زیبایی با پیامک یادآوری.",
    },
    {
      icon: <Stethoscope size={24} />,
      title: "پزشکان و کلینیک‌ها",
      seoKeyword: "مدیریت نوبت مطب",
      description:
        "نظم بخشیدن به صف انتظار بیماران و ارسال خودکار اطلاعات نوبت بلافاصله پس از ثبت.",
    },
    {
      icon: <Scale size={24} />,
      title: "وکلا و دفاتر مشاوره",
      seoKeyword: "رزرو وقت مشاوره",
      description:
        "جلوگیری از تداخل جلسات و مدیریت زمان‌های خالی بدون نیاز به دفترچه کاغذی.",
    },
    {
      icon: <Car size={24} />,
      title: "کارواش و خدمات خودرو",
      seoKeyword: "نوبت دهی کارواش",
      description:
        "ثبت پلاک و نوع سرویس خودرو و اطلاع‌رسانی زمان حضور به مالک خودرو.",
    },
    {
      icon: <Sparkles size={24} />,
      title: "مراکز لیزر و ماساژ",
      seoKeyword: "مدیریت نوبت لیزر",
      description:
        "پیگیری مراجعات قبلی مشتری و یادآوری جلسات بعدی برای حفظ نظم مرکز.",
    },
  ];

  return (
    <section id="industries" className="py-24 bg-white" dir="rtl">
      {/* اسکیمای دسته‌بندی اصناف و راهکارهای نوبت‌دهی (Industry Solutions Schema) */}
      <Script
        id="industry-solutions-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "راهکارهای تخصصی نوبت‌دهی آنتایم برای اصناف",
            description:
              "سامانه مدیریت نوبت و رزرو آنلاین ویژه آرایشگاه‌ها، پزشکان، وکلا و مراکز خدماتی.",
            itemListElement: industries.map((industry, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Service",
                name: industry.title,
                description: industry.description,
                serviceType: industry.seoKeyword,
              },
            })),
          }),
        }}
      />
      <div className="max-w-7xl mx-auto px-6">
        {/* هدر بخش: استفاده از H2 برای سئو و تاکید بر USP (مزیت رقابتی) */}
        <div className="text-right mb-16">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-[1.3]">
            مدیریت هوشمند نوبت‌ها؛ <br />
            <span className="text-blue-600">
              ویژه متخصصین و صاحبان کسب‌وکار
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl font-medium leading-relaxed">
            سامانه نوبت دهی آنتایم یک پنل مدیریت داخلی است. تمام نوبت‌ها توسط
            شما ثبت می‌شود و مشتری{" "}
            <strong>بدون نیاز به نصب هیچ اپلیکیشنی</strong>، تمام جزییات را از
            طریق پیامک و لینک اختصاصی دریافت می‌کند.
          </p>
        </div>

        {/* بخش امکانات فنی و ابزاری */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 rounded-4xl border border-slate-100 hover:bg-blue-50/50 transition-colors">
                <MessageSquare className="text-blue-600 mb-4" />
                <h3 className="font-black text-slate-900 mb-2 text-lg">
                  ارسال پیامک نوبت دهی
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  تایید رزرو، یادآوری نوبت و اطلاع‌رسانی لغو به صورت کاملاً
                  خودکار و هوشمند.
                </p>
              </div>
              <div className="p-8 bg-slate-50 rounded-4xl border border-slate-100 hover:bg-blue-50/50 transition-colors">
                <Smartphone className="text-blue-600 mb-4" />
                <h3 className="font-black text-slate-900 mb-2 text-lg">
                  لینک رزرو نوبت آنلاین
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  صفحه نمایش جزییات نوبت با قابلیت تغییر زمان توسط مشتری جهت
                  کاهش ۷۰ درصدی کنسلی‌ها.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <h3 className="text-2xl font-black text-slate-900">
              چرا اپلیکیشن نوبت دهی آنتایم برای کسب‌وکار شما؟
            </h3>
            <ul className="space-y-4">
              {[
                "تقویم حرفه‌ای برای مدیریت زمان‌بندی متخصصین",
                "تعریف نامحدود خدمات با قیمت و زمان متفاوت",
                "پروفایل کامل مشتری با تاریخچه دقیق مراجعات",
                "سیستم خودکار گزارش‌گیری روزانه و ماهانه",
                "بانک شماره موبایل مشتریان جهت بازاریابی مجدد",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 font-bold text-slate-700"
                >
                  <div className="bg-emerald-100 p-1 rounded-full">
                    <Check className="text-emerald-800" size={16} />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* لیست اصناف - هر آیتم یک سیگنال سئو برای گوگل است */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 border-t border-slate-100 pt-16">
          {industries.map((item, index) => (
            <div
              key={index}
              className="p-6 text-center group hover:bg-slate-50 rounded-3xl transition-all duration-300"
            >
              <div className="flex justify-center mb-4 text-slate-600 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                {item.icon}
              </div>
              {/* استفاده از h3 برای عنوان صنف + کلمه کلیدی سئو */}
              <h3 className="font-black text-slate-900 mb-1">{item.title}</h3>
              <p className="text-[11px] text-blue-600 font-black mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.seoKeyword}
              </p>
              <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
