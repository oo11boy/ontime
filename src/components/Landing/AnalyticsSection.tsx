"use client";

import { BarChart3, Users, CalendarCheck, MessageCircle, TrendingDown, ArrowLeft } from 'lucide-react'
import Script from 'next/script';
import React from 'react'

export default function AnalyticsSection(): React.JSX.Element {

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "پنل تحلیل و آنالیز هوشمند آنتایم",
    "description": "امکانات پیشرفته مدیریتی شامل لیست سیاه مشتریان، آنالیز نرخ کنسلی و گزارش‌های مالی.",
    "provider": {
      "@type": "Organization",
      "name": "آنتایم"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "ابزارهای هوش تجاری آنتایم",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "شناسایی مشتریان بدقول (Blacklist)",
            "description": "مانیتورینگ خودکار مشتریانی که نوبت‌های خود را لغو می‌کنند."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "آنالیز نوبت‌های موفق",
            "description": "گزارش‌گیری دقیق از عملکرد ماهانه پرسنل و خدمات."
          }
        }
      ]
    }
  };

  return (
    <section id="analytics" className="py-24 bg-slate-50/50 border-b w-full border-slate-100" dir="rtl">
    <Script
        id="analytics-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* بخش متنی - سئو شده برای کلمات مدیریتی */}
          <div className="text-right">
            <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mb-6 border border-blue-200">
              <BarChart3 size={14} />
              هوش تجاری در نوبت دهی
            </div>

            <h2 className="text-3xl lg:text-5xl font-black mb-8 text-slate-900 leading-tight">
              مدیریت هوشمند کسب‌وکار <br />
              <span className="text-blue-600">بر اساس گزارش‌های دقیق</span>
            </h2>
            
            <p className="text-lg text-slate-600 mb-10 font-medium leading-relaxed">
              با <strong>پنل مدیریتی آنتایم</strong>، فراتر از یک تقویم ساده بروید. مشتریان وفادار خود را بشناسید، نرخ کنسلی را مانیتور کنید و برای افزایش درآمد صنف خود تصمیمات مبتنی بر داده بگیرید.
            </p>

            <div className="space-y-4">
              {[
                {
                  title: "شناسایی مشتریان بدقول (Blacklist)",
                  desc: "مشاهده دقیق تعداد نوبت‌های کنسل شده توسط هر فرد برای مدیریت بهتر زمان متخصصین.",
                  icon: <TrendingDown className="text-red-500" size={20} />
                },
                {
                  title: "آنالیز نوبت‌های موفق و درآمدی",
                  desc: "گزارش‌گیری ماهانه از مراجعات انجام شده به تفکیک پرسنل و نوع خدمات ارائه شده.",
                  icon: <CalendarCheck className="text-emerald-500" size={20} />
                },
                {
                  title: "مانیتورینگ وضعیت پیامک‌ها",
                  desc: "اطمینان ۱۰۰ درصدی از تحویل پیامک‌های یادآوری نوبت به گوشی مشتریان در زمان مقرر.",
                  icon: <MessageCircle className="text-blue-500" size={20} />
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="shrink-0 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 mb-1 text-base">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* پیش‌نمایش داشبورد (Visual Insight) */}
          <div className="relative">
            {/* افکت درخشش پس‌زمینه */}
            <div className="absolute  bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative bg-white rounded-[3rem] p-8 border border-slate-200 shadow-2xl shadow-blue-100/50">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <BarChart3 size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">وضعیت عملکرد ماهانه</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  بروزرسانی زنده
                </div>
              </div>

              {/* کارت‌های آماری سریع داخل داشبورد */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 bg-linear-to-br from-slate-50 to-white rounded-4xl border border-slate-100 shadow-sm">
                  <div className="text-blue-600 text-3xl font-black mb-1">۱۲۴</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">رزروهای این ماه</div>
                </div>
                <div className="p-5 bg-linear-to-br from-slate-50 to-white rounded-4xl border border-slate-100 shadow-sm">
                  <div className="text-emerald-600 text-3xl font-black mb-1">۸۹٪</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">نرخ بازگشت مشتری</div>
                </div>
              </div>

              {/* بخش لیست مشتریان برای درک بصری مدیریت پروفایل */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-sm font-black text-slate-800">تحلیل رفتار مشتریان</span>
                  <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 cursor-pointer">
                    مشاهده همه <ArrowLeft size={12} />
                  </span>
                </div>
                
                {[
                  { name: "علی محمدی", status: "وفادار", cancel: "۰", color: "bg-emerald-100 text-emerald-700", icon: "ع" },
                  { name: "رضا رضایی", status: "کنسلی بالا", cancel: "۳", color: "bg-red-100 text-red-700", icon: "ر" },
                  { name: "سارا احمدی", status: "مشتری جدید", color: "bg-blue-100 text-blue-700", icon: "س" },
                ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[12px] font-black text-slate-600 shadow-sm">
                        {user.icon}
                      </div>
                      <span className="text-xs font-black text-slate-700">{user.name}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                       <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black shadow-sm ${user.color}`}>
                         {user.status}
                       </span>
                       {user.cancel && (
                         <span className="text-[10px] text-slate-400 font-bold italic">
                           {user.cancel} نوبت لغو شده
                         </span>
                       )}
                    </div>
                  </div>
                ))}
              </div>

              {/* فوتر نمایشی پنل */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center text-xs text-slate-400 font-bold gap-2 items-center italic">
                <Users size={14} />
                گزارش‌گیری هوشمند از بانک اطلاعاتی مشتریان
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}