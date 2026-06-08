// app/industries/custom-booking-page/components/CustomBookingCTA.tsx
"use client";

import { Gift, Phone, Sparkles, Zap, ArrowLeft, Users, CheckCircle2, CalendarCheck, MessageSquare, Globe, Smartphone } from "lucide-react";
import React from "react";
import Link from "next/link";
import { freetime } from "@/lib/freetime";

export default function CustomBookingCTA() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* باکس اصلی */}
        <div className="bg-slate-950 rounded-3xl md:rounded-[3.5rem] lg:rounded-[5rem] p-6 md:p-8 lg:p-16 xl:p-20 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-800">
          
          {/* افکت‌های نوری */}
          <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 lg:w-[500px] h-64 sm:h-80 md:h-96 lg:h-[500px] bg-blue-600/20 rounded-full blur-[100px] sm:blur-[130px] -mr-32 sm:-mr-48 lg:-mr-64 -mt-32 sm:-mt-48 lg:-mt-64 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 md:w-80 lg:w-[400px] h-48 sm:h-64 md:h-80 lg:h-[400px] bg-pink-600/10 rounded-full blur-[80px] sm:blur-[100px] -ml-32 sm:-ml-48 lg:-ml-64 -mb-32 sm:-mb-48 lg:-mb-64 pointer-events-none"></div>

          <div className="relative z-10">
            {/* نشان ویژه */}
            <div className="inline-flex items-center gap-2 md:gap-3 bg-emerald-500/10 text-emerald-400 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl mb-6 md:mb-8 lg:mb-10 border border-emerald-500/20 shadow-inner">
              <Gift size={16} className="md:w-5 md:h-5" />
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider">
                بدون نیاز به کارت بانکی - شروع فوری
              </span>
            </div>

            {/* H2 */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 md:mb-8 lg:mb-10 leading-[1.1] tracking-tight">
              همین الان صفحه اختصاصی
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                کسب و کار خود را بسازید
              </span>
            </h2>

            {/* ویژگی‌های کلیدی */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-10 lg:mb-12">
              <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                <Globe size={14} />
                لینک اختصاصی
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                <Smartphone size={14} />
                بدون نصب اپلیکیشن
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                <MessageSquare size={14} />
                پیامک یادآوری
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm">
                <Users size={14} />
                نظرات مشتریان
              </div>
            </div>

            {/* دکمه‌ها */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link
                href="/clientdashboard"
                className="group relative w-full sm:w-auto px-8 md:px-10 lg:px-12 py-5 md:py-6 bg-gradient-to-r from-blue-600 to-pink-600 text-white rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl lg:text-2xl hover:from-blue-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3 md:gap-4"
              >
                شروع رایگان - ساخت صفحه اختصاصی
                <ArrowLeft
                  className="group-hover:-translate-x-1 md:group-hover:-translate-x-2 transition-transform"
                  strokeWidth={3}
                  size={18}
                />
              </Link>

              <Link
                href="tel:09981394832"
                className="w-full sm:w-auto px-6 md:px-8 lg:px-10 py-5 md:py-6 bg-white/5 text-white rounded-2xl md:rounded-[2.5rem] font-black text-base md:text-lg lg:text-xl border-2 border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 md:gap-4 backdrop-blur-md group"
              >
                <div className="bg-white/10 p-1.5 md:p-2 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <Phone size={18} className="md:w-5 md:h-5" />
                </div>
                <span className="tabular-nums text-sm sm:text-base md:text-lg">۰۹۹۸۱۳۹۴۸۳۲</span>
              </Link>
            </div>

            {/* آمار اعتماد */}
            <div className="mt-12 md:mt-16 flex flex-col items-center gap-4">
              <div className="flex -space-x-3 md:-space-x-4 space-x-reverse items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center shadow-2xl overflow-hidden"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-pink-500 opacity-80" />
                  </div>
                ))}
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-4 border-slate-900 bg-emerald-500 flex items-center justify-center text-[8px] sm:text-[9px] md:text-[10px] font-black text-white shadow-2xl z-10">
                  +۱.۵k
                </div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed px-4 text-center">
                بیش از <span className="text-blue-400 font-black">۱,۵۰۰ کسب‌وکار</span> با آنتایم صفحه اختصاصی خود را ساخته‌اند و روزانه نوبت‌های خود را مدیریت می‌کنند.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}