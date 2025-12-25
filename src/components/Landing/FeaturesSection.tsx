"use client";

import React from "react";
import { 
  MessageSquare, Calendar, Users2, Smartphone, 
  Clock, History, AlertCircle, CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

export default function FeaturesGrid(): React.JSX.Element {
  return (
    <section id="features" className="py-24 bg-white" aria-labelledby="core-features-title">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ۱. هدر بخش: استفاده از H2 با کلمات کلیدی استراتژیک */}
        <div className="text-center mb-20">
          <h2 id="core-features-title" className="text-4xl lg:text-6xl font-black mb-6 text-slate-900 leading-tight">
            امکانات تخصصی <br />
            <span className="text-blue-600">پنل مدیریت نوبت دهی آنلاین</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
            اپلیکیشن نوبت دهی آنتایم جایگزین هوشمند دفتر نوبت‌دهی سنتی است. با سیستم <strong>یادآوری پیامکی</strong> و مدیریت متمرکز، 
            بهره‌وری کسب‌وکار خود را دو برابر کنید.
          </p>
        </div>

        {/* ۲. شبکه کارت‌ها: هر کارت یک راهکار برای یک مشکل خاص (Pain Point) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <FeatureCard 
            icon={<MessageSquare size={32} />}
            title="ارسال پیامک یادآوری نوبت"
            description="ارسال خودکار پیامک تایید بلافاصله پس از ثبت رزرو و پیامک یادآوری هوشمند جهت جلوگیری از فراموشی مشتری و خالی ماندن تایم کسب‌وکار."
            color="blue"
            badge="خودکار"
          />

          <FeatureCard 
            icon={<Smartphone size={32} />}
            title="پنل مشتری تحت وب (PWA)"
            description="مشتری شما بدون نیاز به نصب اپلیکیشن، لینک اختصاصی نوبت را دریافت کرده و می‌تواند جزییات خدمات و زمان حضور را مشاهده کند."
            color="purple"
            badge="بدون نصب"
          />

          <FeatureCard 
            icon={<Calendar size={32} />}
            title="تقویم آنلاین نوبت دهی"
            description="مدیریت بصری زمان‌های خالی با تقویم شمسی. تعریف خدمات متنوع و جلوگیری هوشمند از تداخل نوبت‌ها در ساعت‌های اوج کاری."
            color="emerald"
          />

          <FeatureCard 
            icon={<History size={32} />}
            title="بانک اطلاعاتی مشتریان"
            description="ذخیره خودکار شماره موبایل و تشکیل پروفایل اختصاصی شامل تاریخچه مراجعات، خدمات دریافتی و یادداشت‌های پرسنل برای هر مشتری."
            color="orange"
          />

          <FeatureCard 
            icon={<AlertCircle size={32} />}
            title="مدیریت کنسلی و لیست سیاه"
            description="شناسایی مشتریان بدقول با نمایش خودکار تعداد کنسلی‌ها در پروفایل؛ مدیریت بهینه زمان برای جلوگیری از ضرر مالی."
            color="red"
            badge="هوشمند"
          />

          <FeatureCard 
            icon={<Zap size={32} />}
            title="مدیریت پرسنل و لاین‌ها"
            description="امکان تعریف چندین پرسنل یا لاین خدماتی با دسترسی‌های مجزا. مدیریت همزمان چندین تقویم کاری در یک اپلیکیشن واحد."
            color="cyan"
          />

        </div>

        {/* ۳. بخش پایین کارت‌ها: سیگنال‌های اعتماد (Trust Signals) برای گوگل */}
        <div className="mt-16 bg-slate-50 rounded-[3rem] p-10 flex flex-wrap justify-center gap-10 border border-slate-100">
           <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={24} />
              <span className="font-bold text-slate-700 text-sm">بدون نیاز به ثبت‌نام مشتری</span>
           </div>
           <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-600" size={24} />
              <span className="font-bold text-slate-700 text-sm">حفاظت از حریم خصوصی و داده‌ها</span>
           </div>
           <div className="flex items-center gap-3">
              <Clock className="text-amber-600" size={24} />
              <span className="font-bold text-slate-700 text-sm">آپ‌تایم ۹۹.۹٪ و پشتیبان‌گیری ابری</span>
           </div>
        </div>
      </div>
    </section>
  );
}

/**
 * کامپوننت کارت ویژگی با ساختار H3 برای سئو
 */
function FeatureCard({ icon, title, description, badge, color }: FeatureCardProps) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    red: "text-red-600 bg-red-50 border-red-100",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
  };

  return (
    <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
      {badge && (
        <span className="absolute top-5 left-5 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-lg shadow-blue-200">
          {badge}
        </span>
      )}
      <div className={`inline-flex p-4 rounded-2xl mb-8 transition-all duration-500 group-hover:scale-110 ${colorMap[color]}`}>
        {icon}
      </div>
      
      {/* عنوان کارت با تگ H3: بسیار مهم برای درک موضوعی گوگل */}
      <h3 className="text-xl font-black mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      
      <p className="text-slate-600 leading-relaxed text-sm font-medium">
        {description}
      </p>
    </div>
  );
}