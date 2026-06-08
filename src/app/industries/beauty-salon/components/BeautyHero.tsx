// components/BeautySalon/BeautyHero.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Smartphone, Zap } from "lucide-react";

export default function BeautyHero() {
  return (
    <section className="relative py-16 lg:py-28 mt-10 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-linear-to-b from-pink-50/30 to-white -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-right">
          {/* H1 اصلی - تغییر کرد */}
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.3] mb-6">
            نرم افزار نوبت دهی آرایشگاه و سالن زیبایی
          </h1>

          {/* H2 فرعی - برای توضیح بیشتر */}
          <h2 className="text-xl lg:text-2xl font-bold text-pink-600 mb-6">
            مدیریت هوشمند نوبت و مشتریان ویژه آرایشگران حرفه‌ای
          </h2>

          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
            تمام نوبت‌ها، خدمات و قیمت‌های سالن شما در یک{" "}
            <strong>پنل مدیریت هوشمند</strong>. با نرم‌افزار آنتایم، لیست
            مشتریان را در جیب خود داشته باشید و اجازه دهید سیستم، نوبت‌ها را
            هماهنگ کند.
          </p>

          {/* بلیط امتیاز ویژه (جایگزین h1 قبلی) */}
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-pink-100 text-pink-700 font-bold text-sm mb-6">
            <Zap size={14} className="text-pink-500" />
            ★ ۲ هفته رایگان + ۵۰ پیامک هدیه ★
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link
              href="/clientdashboard"
              className="px-10 py-5 bg-pink-600 text-white rounded-2xl font-black text-xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 text-center"
            >
              شروع رایگان ۲ هفته‌ای
            </Link>
          </div>

          <div className="space-y-4 border-r-2 border-pink-100 pr-6">
            <div className="text-sm font-bold text-slate-700">
              ✓ تعریف نامحدود خدمات و قیمت‌ها
            </div>
            <div className="text-sm font-bold text-slate-700">
              ✓ مشاهده تقویم کاری روزانه و هفتگی
            </div>
            <div className="text-sm font-bold text-slate-700">
              ✓ ارسال پیامک یادآوری بدون دخالت شما
            </div>
            <div className="text-sm font-bold text-pink-600">
              ✓ ۲ هفته استفاده رایگان - بدون نیاز به کارت بانکی
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-[300px] lg:w-[350px] aspect-[10/19] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
            <Image
              src="/images/screens/newmain.jpg"
              fill
              alt="نمایش پنل مدیریت نرم افزار نوبت دهی آرایشگاه آنتایم"
        
            />
          </div>
        </div>
      </div>
    </section>
  );
}