// components/BeautySalon/BeautyHero.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Smartphone, Zap } from "lucide-react";

export default function BeautyHero() {
  return (
    <section className="relative py-16 lg:py-28 mt-10 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-linear-to-b from-pink-50/30 to-white -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-right">
          <h1 className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs mb-8">
            <Zap size={14} className="text-yellow-400" />
            تخصصی‌ترین اپلیکیشن مدیریت نوبت و مشتری ویژه آرایشگران
          </h1>

          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.3] mb-8">
            نظمِ حرفه‌ای با <br />
            <span className="text-pink-600 ">
              اپلیکیشن نوبت‌دهی آرایشگاه
            </span>{" "}
            آنتایم
          </h2>

          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl font-medium">
            تمام نوبت‌ها، خدمات و قیمت‌های سالن شما در یک{" "}
            <strong>پنل مدیریت هوشمند</strong>. با نرم‌افزار آنتایم، لیست
            مشتریان را در جیب خود داشته باشید و اجازه دهید سیستم، نوبت‌ها را
            هماهنگ کند.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="/clientdashboard"
              className="px-10 py-5 bg-pink-600 text-white rounded-2xl font-black text-xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 text-center"
            >
              شروع کار با اپلیکیشن
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
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          {/* تصویر گوشی که محیط اپلیکیشن (پنل مدیریت) را نشان می‌دهد */}
          <div className="relative w-[300px] lg:w-[350px] aspect-[10/19] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
            <Image
              src="/images/screens/newmain.jpg"
              fill
              alt="اپلیکیشن مدیریت آرایشگاه آنتایم"
              className=""
            />
          </div>
    
        </div>
      </div>
    </section>
  );
}
