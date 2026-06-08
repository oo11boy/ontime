// app/industries/gym/components/GymFinalCTA.tsx
"use client";

import { Gift, Phone, Sparkles, Zap, ArrowLeft, Users, CheckCircle2, CalendarCheck, MessageSquare, Dumbbell, Trophy } from "lucide-react";
import React from "react";
import Link from "next/link";
import { freetime } from "@/lib/freetime";

export default function GymFinalCTA() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* باکس اصلی با طراحی Dark Mode و تم اختصاصی باشگاه */}
        <div className="bg-slate-950 rounded-3xl md:rounded-[3.5rem] lg:rounded-[5rem] p-6 md:p-8 lg:p-16 xl:p-24 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(16,185,129,0.2)] border border-slate-800">
          
          {/* افکت‌های نوری متناسب با تم باشگاه */}
          <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 lg:w-[500px] h-64 sm:h-80 md:h-96 lg:h-[500px] bg-emerald-600/20 rounded-full blur-[100px] sm:blur-[130px] -mr-32 sm:-mr-48 lg:-mr-64 -mt-32 sm:-mt-48 lg:-mt-64 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 md:w-80 lg:w-[400px] h-48 sm:h-64 md:h-80 lg:h-[400px] bg-teal-500/10 rounded-full blur-[80px] sm:blur-[100px] -ml-32 sm:-ml-48 lg:-ml-64 -mb-32 sm:-mb-48 lg:-mb-64 pointer-events-none"></div>

          <div className="relative z-10">
            {/* نشان هدیه ورودی ویژه باشگاه */}
            <div className="inline-flex items-center gap-2 md:gap-3 bg-emerald-500/10 text-emerald-400 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl mb-6 md:mb-8 lg:mb-10 border border-emerald-500/20 shadow-inner">
              <Gift size={16} className="md:w-5 md:h-5 animate-bounce" />
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider md:tracking-widest">
                ★ {freetime.plan} هفته رایگان ★ هدیه ویژه برای باشگاه‌های ورزشی
              </span>
            </div>

            {/* H2 بهینه شده برای سئو */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-black mb-6 md:mb-8 lg:mb-12 leading-[1.1] tracking-tight">
              آماده‌اید مدیریت نوبت{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400">
                کلاس‌های ورزشی
              </span>{" "}
              خود را حرفه‌ای کنید؟
            </h2>

            {/* توضیحات سئو زیر H2 */}
            <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-8 md:mb-10 lg:mb-12 px-4">
              با <strong className="text-emerald-400">نرم افزار نوبت دهی باشگاه آنتایم</strong>، مدیریت نوبت کلاس‌های بدنسازی، یوگا و کراس فیت را هوشمندانه شروع کنید. 
              پیامک یادآوری خودکار و لینک اختصاصی برای هر عضو.
            </p>

            {/* کارت‌های مزیت اختصاصی باشگاه */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-12 md:mb-16 lg:mb-20 max-w-5xl mx-auto">
              <BenefitCard
                icon={<Gift className="text-emerald-400" size={28} />}
                title={`${freetime.plan} هفته پنل رایگان`}
                desc="تمام امکانات مدیریت نوبت کلاس‌های ورزشی بدون هزینه"
                seoDesc="۲ هفته استفاده رایگان از نرم افزار نوبت دهی باشگاه با تمام امکانات"
              />
              <BenefitCard
                icon={<MessageSquare className="text-emerald-400" size={28} />}
                title={`${freetime.sms} پیامک یادآوری تمرین`}
                desc="ارسال خودکار پیامک یادآوری جلسات تمرینی برای اعضای باشگاه"
                seoDesc="سیستم پیامک یادآوری خودکار جلسات تمرینی و کاهش ۸۰ درصدی کنسلی"
              />
              <BenefitCard
                icon={<Sparkles className="text-emerald-400" size={28} />}
                title="راه اندازی فوری بدون نصب"
                desc="دسترسی فوری با موبایل در هر زمان و مکان، بدون نیاز به نصب اپلیکیشن"
                seoDesc="فعال سازی سریع سیستم نوبت دهی باشگاه ورزشی در کمتر از ۲ دقیقه"
              />
            </div>

            {/* دکمه‌های فراخوان قدرتمند */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
              <Link
                href="/clientdashboard"
                className="group relative w-full sm:w-auto px-8 md:px-10 lg:px-12 py-5 md:py-6 lg:py-7 bg-emerald-600 text-white rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl lg:text-2xl hover:bg-emerald-500 transition-all transform hover:scale-[1.03] active:scale-95 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 md:gap-4"
              >
                شروع {freetime.plan} هفته رایگان
                <ArrowLeft
                  className="group-hover:-translate-x-1 md:group-hover:-translate-x-2 transition-transform"
                  strokeWidth={3}
                  size={18}
                />
              </Link>

              <Link
                href="tel:09981394832"
                className="w-full sm:w-auto px-6 md:px-8 lg:px-10 py-5 md:py-6 lg:py-7 bg-white/5 text-white rounded-2xl md:rounded-[2.5rem] font-black text-base md:text-lg lg:text-xl border-2 border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 md:gap-4 backdrop-blur-md group"
              >
                <div className="bg-white/10 p-1.5 md:p-2 rounded-xl group-hover:bg-emerald-600 transition-colors">
                  <Phone size={18} className="md:w-5 md:h-5" fill="currentColor" />
                </div>
                <span className="tabular-nums text-sm sm:text-base md:text-lg">۰۹۹۸۱۳۹۴۸۳۲</span>
              </Link>
            </div>

            {/* Social Proof اختصاصی باشگاه */}
            <div className="mt-12 md:mt-16 lg:mt-20 flex flex-col items-center gap-4 md:gap-6">
              <div className="flex -space-x-3 md:-space-x-4 space-x-reverse items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center shadow-2xl overflow-hidden"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 opacity-80" />
                  </div>
                ))}
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-4 border-slate-900 bg-emerald-500 flex items-center justify-center text-[8px] sm:text-[9px] md:text-[10px] font-black text-white shadow-2xl z-10">
                  +۳۲۰
                </div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm md:text-base lg:text-lg font-medium max-w-2xl mx-auto leading-relaxed px-4 text-center">
                بیش از <span className="text-emerald-400 font-black">۳۲۰ باشگاه ورزشی حرفه‌ای</span> در سراسر ایران، مدیریت نوبت‌های 
                <strong className="text-white"> کلاس‌های بدنسازی و ورزشی</strong> خود را به <strong className="text-emerald-400">نرم افزار آنتایم</strong> سپرده‌اند.
              </p>
              {/* کلمات کلیدی مخفی برای سئو */}
              <p className="text-slate-600 text-[8px] sm:text-[9px] md:text-xs hidden md:block">
                ★ سیستم نوبت دهی تخصصی باشگاه بدنسازی ★ مدیریت رزرو کلاس ورزشی ★ پیامک یادآوری خودکار اعضا ★
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitCard({
  icon,
  title,
  desc,
  seoDesc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  seoDesc?: string;
}) {
  return (
    <div className="bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl backdrop-blur-md border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-500 group/card transform hover:-translate-y-2 text-right">
      <div className="bg-slate-800 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-5 lg:mb-6 group-hover/card:scale-110 transition-transform duration-500 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base md:text-lg lg:text-xl font-black mb-2 md:mb-3 text-white group-hover/card:text-emerald-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 text-xs sm:text-sm font-bold leading-relaxed">
        {desc}
      </p>
      {seoDesc && (
        <p className="text-slate-500 text-[8px] sm:text-[9px] md:text-[10px] mt-2 md:mt-3 hidden md:block">
          {seoDesc}
        </p>
      )}
    </div>
  );
}