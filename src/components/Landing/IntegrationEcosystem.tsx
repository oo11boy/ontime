"use client";

import { Smartphone, ShieldCheck, Zap, UserCheck, MessageSquare, History, ArrowLeft } from 'lucide-react'
import Link from 'next/link';
import Script from 'next/script';
import React from 'react'

export default function AppCoreValues(): React.JSX.Element {
  const coreFeatures = [
    {
      title: "بدون نیاز به نصب برای مشتری",
      icon: <Smartphone className="text-blue-600" />,
      desc: "مشتری شما هیچ اپلیکیشنی نصب نمی‌کند؛ تمام تعاملات و مشاهده نوبت‌ها از طریق پیامک و لینک اختصاصی وب انجام می‌شود.",
    },
    {
      title: "کنترل هوشمند کنسلی‌ها",
      icon: <Zap className="text-amber-500" />,
      desc: "قابلیت تنظیم محدودیت برای مشتری؛ امکان تغییر نوبت فقط تا یک‌بار جهت حفظ نظم و جلوگیری از خالی ماندن تایم شما.",
    },
    {
      title: "پروفایل حرفه‌ای مشتری",
      icon: <UserCheck className="text-green-600" />,
      desc: "در یک نگاه آمار دقیق مراجعات، خوش‌قولی و تاریخچه کنسلی هر مشتری را ببینید تا هوشمندانه وقت رزرو کنید.",
    },
    {
      title: "اتوماسیون پیامک اطلاع‌رسانی",
      icon: <MessageSquare className="text-indigo-600" />,
      desc: "ارسال خودکار پیامک تایید رزرو، یادآوری نوبت و اطلاع‌رسانی لغو بدون نیاز به دخالت دست و به صورت آنی.",
    },
    {
      title: "آرشیو دقیق خدمات ارائه شده",
      icon: <History className="text-slate-700" />,
      desc: "دسترسی کامل به لیست خدماتی که هر مشتری تاکنون دریافت کرده، برای ارائه سرویس‌های شخصی‌سازی شده و بهتر.",
    },
    {
      title: "پشتیبان‌گیری ابری و ایمن",
      icon: <ShieldCheck className="text-cyan-600" />,
      desc: "تمام داده‌های مشتریان و نوبت‌های شما در سرورهای ابری آنتایم با بالاترین سطح امنیت ذخیره و محافظت می‌شوند.",
    }
  ];

  return (
    <section id="values" className="py-24 bg-white" dir="rtl">


<Script
  id="app-core-values-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "نرم‌افزار مدیریت نوبت‌دهی و رزرو آنلاین",
      "provider": {
        "@type": "Organization",
        "name": "آنتایم"
      },
      "areaServed": "IR",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "مزایای هوشمند آنتایم",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "عدم نیاز به نصب اپلیکیشن",
              "description": "استفاده از تکنولوژی PWA برای دسترسی سریع مشتریان بدون اشغال فضا."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "کنترل هوشمند کنسلی",
              "description": "کاهش نرخ لغو نوبت با سیستم جابجایی هوشمند."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "پشتیبان‌گیری ابری امن",
              "description": "ذخیره ایمن اطلاعات مشتریان در سرورهای ابری اختصاصی."
            }
          }
        ]
      }
    })
  }}
/>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* هدر بخش - استفاده از H2 برای سئو محتوا */}
        <div className="text-right mb-16">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-tight">
            تمرکز بر <span className="text-blue-600">سادگی کاربر و بازدهی کسب‌وکار</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
            <strong>اپلیکیشن نوبت‌دهی آنتایم</strong> شلوغی‌های اضافه را حذف کرده تا شما و پرسنل‌تان فقط روی ارائه بهترین خدمات به مشتریان تمرکز کنید.
          </p>
        </div>

        {/* شبکه ارزش‌ها - استفاده از H3 برای تیتر هر ارزش */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {coreFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-100/20 transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                <span className="group-hover:text-white transition-colors">
                  {React.cloneElement(feature.icon as React.ReactElement)}
                </span>
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-bold group-hover:text-slate-600 transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* کارت دعوت به اقدام (CTA) هوشمند و جذاب */}
        <div className="mt-20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600 transition-transform duration-700 group-hover:scale-105"></div>
          {/* دایره‌های دکوراتیو پس‌زمینه کارت */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative z-10 p-10 lg:p-16 text-center lg:text-right flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h3 className="text-2xl lg:text-4xl font-black text-white mb-4">
                آماده‌اید به نوبت‌های خود نظم بدهید؟
              </h3>
              <p className="text-blue-100 font-bold text-lg">
                همین حالا با <strong>ثبت نام در سامانه نوبت دهی آنتایم</strong>، ۳ ماه اشتراک رایگان هدیه بگیرید و مدیریت نوبت‌ها را خودکار کنید.
              </p>
            </div>
            
            <Link 
              href="/clientdashboard" 
              className="group/btn relative px-12 py-5 bg-white text-blue-600 rounded-4xl font-black text-xl hover:shadow-2xl hover:shadow-black/20 transition-all flex items-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">شروع رایگان با آنتایم</span>
              <ArrowLeft className="relative z-10 group-hover/btn:-translate-x-2 transition-transform" size={24} />
              <div className="absolute inset-0 bg-blue-50 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}