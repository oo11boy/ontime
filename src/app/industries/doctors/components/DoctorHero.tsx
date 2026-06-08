// app/industries/doctors/components/DoctorHero.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, CalendarDays, Zap, Stethoscope } from "lucide-react";

export default function DoctorHero() {
  return (
    <section className="relative mt-12 py-16 lg:py-28 overflow-hidden bg-white">
      {/* بک‌گراند با تم آبی ملایم متناسب با پزشکان */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-white -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-right">
          {/* H1 اصلی برای سئو */}
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.3] mb-6">
            نرم افزار نوبت دهی پزشکان و مطب
          </h1>

          {/* H2 فرعی */}
          <h2 className="text-xl lg:text-2xl font-bold text-blue-600 mb-6">
            مدیریت هوشمند نوبت ویزیت بیماران ویژه مطب‌های پزشکی
          </h2>

          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
            با <strong className="text-blue-600">نرم افزار نوبت دهی پزشکان آنتایم</strong>، 
            نوبت‌های ویزیت بیماران را هوشمندانه مدیریت کنید. 
            سیستم خودکار یادآوری، کنسلی‌ها را تا ۸۰ درصد کاهش می‌دهد و 
            زمان دقیق ویزیت را به بیماران شما پیامک می‌کند.
          </p>

          {/* بنر ۲ هفته رایگان */}
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm mb-6">
            <Zap size={14} className="text-blue-500" />
            ★ ۲ هفته رایگان + ۵۰ پیامک یادآوری ویزیت ★
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link
              href="/clientdashboard"
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 text-center flex items-center justify-center gap-2"
            >
              شروع رایگان ۲ هفته‌ای
              <ArrowLeft size={20} />
            </Link>
          </div>

          {/* ویژگی‌های متمایز برای پزشکان */}
          <div className="space-y-4 border-r-4 border-blue-200 pr-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-blue-500" />
              تقویم تخصصی مطب با تفکیک نوبت‌های پزشکان مختلف
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-blue-500" />
              پیامک یادآوری خودکار نوبت ویزیت (۲۴ ساعت قبل از موعد)
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-blue-500" />
              پرونده الکترونیک بیماران با ثبت سوابق ویزیت و نسخه‌ها
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
              <CheckCircle2 size={18} className="text-blue-600" />
              ✓ ۲ هفته استفاده رایگان - بدون نیاز به کارت بانکی
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          {/* Mockup موبایل */}
          <div className="relative w-[300px] lg:w-[350px] aspect-[10/19] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)] overflow-hidden">
            <Image
               src="/images/screens/newmain.jpg"
              fill
              alt="نمایش پنل مدیریت نرم افزار نوبت دهی پزشکان آنتایم - مدیریت نوبت ویزیت بیماران"
        
              priority
            />
          </div>
          
          {/* نمایش زنده تعداد رزرو برای جلب اعتماد */}
          <div className="absolute top-10 -right-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-blue-100 hidden md:flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <CalendarDays size={20} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">نوبت ویزیت ثبت شده امروز</div>
              <div className="text-lg font-black text-slate-900 tabular-nums">+۱,۲۰۰ نوبت</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}