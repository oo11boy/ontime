// app/industries/consulting/components/ConsultingHero.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, CalendarDays, Zap, Brain } from "lucide-react";

export default function ConsultingHero() {
  return (
    <section className="relative mt-12 py-16 lg:py-28 overflow-hidden bg-white">
      {/* بک‌گراند با تم بنفش ملایم */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 to-white -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-right">
          {/* H1 اصلی برای سئو */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.3] mb-4 md:mb-6">
            نرم افزار نوبت دهی روانشناس و مشاور
          </h1>

          {/* H2 فرعی */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600 mb-4 md:mb-6">
            مدیریت هوشمند نوبت جلسات مشاوره و روانشناسی
          </h2>

          <p className="text-base sm:text-lg text-slate-600 mb-6 md:mb-8 leading-relaxed max-w-xl">
            با <strong className="text-indigo-600">نرم افزار نوبت دهی روانشناس آنتایم</strong>، 
            نوبت‌دهی جلسات مشاوره را هوشمندانه مدیریت کنید. 
            سیستم خودکار یادآوری، کنسلی‌ها را تا ۸۰ درصد کاهش می‌دهد و 
            زمان دقیق جلسات را به مراجعان پیامک می‌کند.
          </p>

          {/* بنر ۲ هفته رایگان */}
          <div className="inline-flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm mb-5 md:mb-6">
            <Zap size={14} className="text-indigo-500" />
            ★ ۲ هفته رایگان + ۵۰ پیامک یادآوری جلسات ★
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 md:mb-10">
            <Link
              href="/clientdashboard"
              className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-base sm:text-lg md:text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-center flex items-center justify-center gap-2"
            >
              شروع رایگان ۲ هفته‌ای
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Link>
          </div>

          {/* ویژگی‌های متمایز مراکز مشاوره */}
          <div className="space-y-3 sm:space-y-4 border-r-4 border-indigo-200 pr-4 sm:pr-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <CheckCircle2 size={16} className="sm:w-4 sm:h-4 text-indigo-500" />
              تقویم تخصصی با تفکیک جلسات حضوری و آنلاین (مشاوره تلفنی/ویدئویی)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <CheckCircle2 size={16} className="sm:w-4 sm:h-4 text-indigo-500" />
              پیامک یادآوری خودکار جلسات مشاوره (۲۴ ساعت قبل از موعد)
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <CheckCircle2 size={16} className="sm:w-4 sm:h-4 text-indigo-500" />
              پرونده الکترونیک مراجعان با ثبت سوابق جلسات و یادداشت‌های درمانی
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600">
              <CheckCircle2 size={16} className="sm:w-4 sm:h-4 text-indigo-600" />
              ✓ ۲ هفته استفاده رایگان - بدون نیاز به کارت بانکی
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="relative w-[260px] sm:w-[300px] lg:w-[350px] aspect-[10/19] bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] border-[6px] sm:border-[8px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(79,70,229,0.2)] overflow-hidden">
            <Image
              src="/images/screens/newmain.jpg"
              fill
              alt="نمایش پنل مدیریت نرم افزار نوبت دهی روانشناس و مشاور آنتایم - مدیریت جلسات مشاوره"
            
              priority
            />
          </div>
          
          {/* نمایش زنده تعداد رزرو */}
          <div className="absolute top-5 sm:top-10 -right-4 sm:-right-6 bg-white/90 backdrop-blur p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-indigo-100 hidden md:flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Brain size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold whitespace-nowrap">جلسات مشاوره امروز</div>
              <div className="text-base sm:text-lg font-black text-slate-900 tabular-nums">+۱,۸۰۰ جلسه</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}