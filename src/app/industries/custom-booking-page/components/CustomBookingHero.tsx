// app/industries/custom-booking-page/components/CustomBookingHero.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Zap, Sparkles, Globe, Smartphone, Gift, Crown } from "lucide-react";

export default function CustomBookingHero() {
  return (
    <section className="relative mt-12 py-16 lg:py-28 overflow-hidden bg-white">
      {/* بک‌گراند با گرادینت چندرنگ */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-pink-50/20 to-white -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-right">
          {/* بنر رایگان بودن */}
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-6">
            <Gift size={16} />
            <span className="font-black text-xs sm:text-sm">🎁 کاملاً رایگان - بدون نیاز به کارت بانکی</span>
          </div>

          {/* H1 اصلی */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.3] mb-4 md:mb-6">
            صفحه اختصاصی نوبت دهی
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
              کاملاً رایگان
            </span>
          </h1>

          {/* H2 فرعی */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-4 md:mb-6">
            لینک اختصاصی + گالری نمونه کار + قیمت خدمات + نظرات مشتریان + ثبت نوبت آنلاین
            <br />
            <span className="text-emerald-600 text-base md:text-lg mt-2 block">★ همه این امکانات رایگان ★</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 mb-6 md:mb-8 leading-relaxed max-w-xl">
            بدون نیاز به برنامه‌نویسی، بدون نیاز به نصب اپلیکیشن و <strong className="text-emerald-600">کاملاً رایگان</strong>، 
            یک صفحه اختصاصی کامل برای کسب‌وکارتان بسازید. مشتریان شما با یک لینک ساده می‌توانند نوبت بگیرند، 
            نمونه کارها را ببینند و نظرات خود را ثبت کنند.
          </p>

          {/* بنر ۲ هفته رایگان + ساخت صفحه رایگان */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-blue-100 to-pink-100 text-blue-700 font-bold text-xs sm:text-sm">
              <Zap size={14} className="text-blue-500" />
              ★ ساخت صفحه اختصاصی کاملاً رایگان ★
            </div>
            <div className="inline-flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs sm:text-sm">
              <Gift size={14} className="text-emerald-500" />
              ★ ۵۰ پیامک هدیه رایگان ★
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 md:mb-10">
            <Link
              href="/clientdashboard"
              className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-blue-600 to-pink-600 text-white rounded-xl md:rounded-2xl font-black text-base sm:text-lg md:text-xl hover:from-blue-700 hover:to-pink-700 transition-all shadow-xl shadow-blue-200 text-center flex items-center justify-center gap-2"
            >
              شروع رایگان - ساخت صفحه اختصاصی
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Link>
          </div>

          {/* ویژگی‌های کلیدی با تأکید بر رایگان */}
          <div className="space-y-3 sm:space-y-4 border-r-4 border-blue-200 pr-4 sm:pr-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 text-[10px] ml-2">رایگان</span>
              لینک اختصاصی یکتا برای کسب‌وکار شما
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 text-[10px] ml-2">رایگان</span>
              صفحه کامل شامل معرفی، گالری نمونه کار، لیست خدمات با قیمت
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 text-[10px] ml-2">رایگان</span>
              سیستم ثبت نوبت، تغییر و لغو نوبت توسط مشتری
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 text-[10px] ml-2">رایگان</span>
              نظرات و امتیازدهی مشتریان برای بهبود کسب‌وکار
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600">
              <CheckCircle2 size={16} className="text-emerald-600" />
              ✓ بدون نیاز به کارت بانکی - بدون هیچ هزینه اولیه
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
          {/* Mockup با برچسب رایگان */}
          <div className="relative">
            <div className="absolute -top-3 -right-3 z-20 bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <Gift size={12} />
              کاملاً رایگان
            </div>
            <div className="relative w-[280px] sm:w-[320px] lg:w-[380px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* هدر صفحه اختصاصی */}
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 p-3 sm:p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-sm">
                      A
                    </div>
                    <div>
                      <p className="font-black text-xs sm:text-sm">آرایشگاه آنتایم</p>
                      <p className="text-[8px] sm:text-[9px] opacity-80">سالن زیبایی تخصصی</p>
                    </div>
                  </div>
                  <div className="text-[8px] sm:text-[9px] bg-white/20 px-2 py-1 rounded-full">
                    ★ ۴.۹
                  </div>
                </div>
              </div>
              {/* گالری نمونه کار */}
              <div className="relative h-32 sm:h-40 bg-slate-200">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-pink-600/30 flex items-center justify-center">
                  <span className="text-white font-black text-xs sm:text-sm bg-black/50 px-3 py-1 rounded-full">گالری نمونه کارها</span>
                </div>
              </div>
              {/* خدمات */}
              <div className="p-3 sm:p-4 space-y-2">
                <p className="font-black text-xs sm:text-sm text-slate-800">خدمات و قیمت‌ها</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] sm:text-xs">
                    <span>✂️ کاشت ناخن</span>
                    <span className="font-bold">۲۵۰,۰۰۰ تومان</span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs">
                    <span>💇‍♀️ کوتاهی مو</span>
                    <span className="font-bold">۱۲۰,۰۰۰ تومان</span>
                  </div>
                </div>
              </div>
              {/* دکمه نوبت‌گیری */}
              <div className="p-3 sm:p-4 pt-0">
                <div className="bg-gradient-to-r from-blue-600 to-pink-600 text-white text-center py-2 rounded-xl font-black text-xs sm:text-sm">
                  رزرو نوبت آنلاین - رایگان
                </div>
              </div>
            </div>
          </div>
          
          {/* المان تأیید */}
          <div className="absolute -bottom-4 -left-4 bg-white shadow-lg rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black text-emerald-600 border border-emerald-200">
            🔥 بدون هزینه - همیشه رایگان
          </div>
        </div>
      </div>
    </section>
  );
}