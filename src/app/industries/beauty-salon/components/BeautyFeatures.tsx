// components/BeautySalon/BeautyFeatures.tsx
"use client";

import { Scissors, LayoutGrid, Smartphone, ShieldCheck, Clock, BadgeDollarSign, CalendarCheck, MessageSquare } from "lucide-react";

const features = [
  {
    title: "تعریف هوشمند خدمات",
    desc: "لیست خدمات خود را با جزئیات کامل تعریف کنید تا مشتری دقیقاً بداند چه خدمتی را رزرو می‌کند.",
    seoDesc: "امکان تعریف نامحدود خدمات، قیمت و مدت زمان در نرم افزار نوبت دهی آرایشگاه",
    icon: <LayoutGrid size={32} />
  },
  {
    title: "پرونده مشتری",
    desc: "ذخیره تاریخچه مراجعات، ترکیب رنگ‌های استفاده شده و یادداشت‌های اختصاصی برای هر مشتری.",
    seoDesc: "مدیریت جامع سوابق و تاریخچه مراجعات مشتریان سالن زیبایی",
    icon: <ShieldCheck size={32} />
  },
  {
    title: "لینک اختصاصی برای هر مشتری",
    desc: "پس از ثبت نوبت، لینک مدیریت نوبت برای مشتری پیامک می‌شود تا نیازی به تماس تلفنی نباشد.",
    seoDesc: "دریافت و مدیریت نوبت با لینک اختصاصی بدون نیاز به اپلیکیشن",
    icon: <Smartphone size={32} />
  },
  {
    title: "تنظیم زمان هر خدمت",
    desc: "برای هر خدمت زمان مشخص (مثلاً ۹۰ دقیقه) تعیین کنید تا تقویم شما با دقت میلی‌متری پر شود.",
    seoDesc: "تقویم شمسی هوشمند با قابلیت تنظیم زمان دقیق برای هر سرویس",
    icon: <Clock size={32} />
  },
  {
    title: "لیست سیاه مشتریان",
    desc: "شناسایی هوشمند مشتریان بدقول برای جلوگیری از خالی ماندن وقت‌ها و ضرر مالی شما.",
    seoDesc: "کاهش کنسلی و جلوگیری از ضرر مالی با شناسایی مشتریان بدقول",
    icon: <Scissors size={32} />
  },
  {
    title: "کنسلی و تغییر نوبت هوشمند",
    desc: "مشتری می‌تواند طبق قوانین شما، نوبتش را یک‌بار جابجا یا لغو کند؛ تقویم شما هم فوراً آزاد می‌شود.",
    seoDesc: "مدیریت هوشمند تغییر و لغو نوبت توسط مشتری بدون تماس تلفنی",
    icon: <CalendarCheck size={32} />
  }
];

export default function BeautyFeatures() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          {/* H2 بهبود یافته برای سئو */}
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-slate-900 leading-[1.2]">
            امکانات <span className="text-pink-600">هوشمند</span>{" "}
            <span className="text-pink-600">نرم افزار نوبت دهی آرایشگاه</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            آنتایم تمام ابزارهای لازم برای <strong className="text-pink-600">نظم‌دهی به نوبت‌ها و خدمات</strong> شما را در یک پنل کاربری ساده فراهم کرده است.
            <br />
            <span className="text-sm text-slate-400 block mt-2">
              ★ مدیریت هوشمند نوبت، پیامک یادآوری خودکار و لینک اختصاصی برای هر مشتری ★
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-pink-100/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="inline-flex p-4 rounded-2xl mb-8 bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-black mb-4 text-slate-900 group-hover:text-pink-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">
                {item.desc}
              </p>
              {/* توضیحات سئو مخفی */}
              <p className="text-slate-400 text-xs mt-3 hidden md:block">
                {item.seoDesc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}