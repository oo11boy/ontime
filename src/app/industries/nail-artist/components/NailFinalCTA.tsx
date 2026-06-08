"use client";

import { Gift, Phone, Sparkles, Zap, ArrowLeft, Users, CheckCircle2, CalendarCheck, MessageSquare } from "lucide-react";
import React from "react";
import Link from "next/link";
import { freetime } from "@/lib/freetime";

export default function NailFinalCTA() {
  return (
    <section className="py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        {/* باکس اصلی با طراحی Dark Mode و تم اختصاصی لاین زیبایی */}
        <div className="bg-slate-950 rounded-[3.5rem] lg:rounded-[5rem] p-10 lg:p-24 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(225,29,72,0.2)] border border-slate-800">
          
          {/* افکت‌های نوری (Glow) متناسب با تم ناخن */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[130px] -mr-64 -mt-64 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

          <div className="relative z-10">
            {/* نشان هدیه ورودی ویژه ناخن‌کاران */}
            <div className="inline-flex items-center gap-3 bg-rose-500/10 text-rose-400 px-6 py-3 rounded-2xl mb-10 border border-rose-500/20 shadow-inner">
              <Gift size={20} className="animate-bounce" />
              <span className="font-black text-xs lg:text-sm uppercase tracking-widest">
                ★ ۲ هفته رایگان ★ هدیه ویژه برای ناخن‌کاران حرفه‌ای
              </span>
            </div>

            {/* H2 بهینه شده برای سئو */}
            <h2 className="text-4xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              آماده‌اید مدیریت نوبت{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400">
                کاشت و ترمیم ناخن
              </span>{" "}
              خود را حرفه‌ای کنید؟
            </h2>

            {/* توضیحات سئو زیر H2 */}
            <p className="text-slate-400 text-base max-w-2xl mx-auto mb-12">
              با <strong className="text-rose-400">نرم افزار نوبت دهی ناخن کار آنتایم</strong>، مدیریت نوبت کاشت، ترمیم و ژلیش را هوشمندانه شروع کنید. 
              پیامک یادآوری خودکار و لینک اختصاصی برای هر مشتری.
            </p>

            {/* کارت‌های مزیت اختصاصی ناخن‌کارها */}
            <div className="grid md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
              <BenefitCard
                icon={<Gift className="text-rose-400" size={32} />}
                title={`${freetime.plan} هفته پنل رایگان`}
                desc="تمام امکانات مدیریت نوبت کاشت و ترمیم بدون هزینه"
                seoDesc="۲ هفته استفاده رایگان از نرم افزار نوبت دهی ناخن کار با تمام امکانات"
              />
              <BenefitCard
                icon={<MessageSquare className="text-emerald-400" size={32} />}
                title={`${freetime.sms} پیامک یادآوری ترمیم`}
                desc="ارسال خودکار پیامک یادآوری نوبت ترمیم برای مشتریان شما"
                seoDesc="سیستم پیامک یادآوری خودکار نوبت ترمیم و کاشت ناخن"
              />
              <BenefitCard
                icon={<Sparkles className="text-amber-400" size={32} />}
                title="راه اندازی فوری بدون نصب"
                desc="دسترسی فوری با موبایل در هر زمان و مکان، بدون نیاز به نصب اپلیکیشن"
                seoDesc="فعال سازی سریع سیستم نوبت دهی کاشت ناخن در کمتر از ۲ دقیقه"
              />
            </div>

            {/* دکمه‌های فراخوان قدرتمند */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/clientdashboard"
                className="group relative w-full sm:w-auto px-12 py-7 bg-rose-600 text-white rounded-[2.5rem] font-black text-2xl hover:bg-rose-500 transition-all transform hover:scale-[1.03] active:scale-95 shadow-[0_20px_40px_-10px_rgba(225,29,72,0.4)] flex items-center justify-center gap-4"
              >
                شروع {freetime.plan} هفته رایگان
                <ArrowLeft
                  className="group-hover:-translate-x-2 transition-transform"
                  strokeWidth={3}
                />
              </Link>

              <Link
                href="tel:09981394832"
                className="w-full sm:w-auto px-10 py-7 bg-white/5 text-white rounded-[2.5rem] font-black text-xl border-2 border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-4 backdrop-blur-md group"
              >
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-rose-600 transition-colors">
                  <Phone size={24} fill="currentColor" className="text-white" />
                </div>
                <span className="tabular-nums">۰۹۹۸۱۳۹۴۸۳۲</span>
              </Link>
            </div>

            {/* Social Proof اختصاصی صنف ناخن */}
            <div className="mt-20 flex flex-col items-center gap-6">
              <div className="flex -space-x-4 space-x-reverse items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center shadow-2xl overflow-hidden"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-rose-400 to-rose-600 opacity-80" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-rose-500 flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-10">
                  +۸۵۰
                </div>
              </div>
              <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                بیش از <span className="text-rose-400 font-black">۸۵۰ ناخن‌کار حرفه‌ای</span> در سراسر ایران، مدیریت نوبت‌های 
                <strong className="text-white"> کاشت و ترمیم ناخن</strong> خود را به <strong className="text-rose-400">نرم افزار آنتایم</strong> سپرده‌اند.
              </p>
              {/* کلمات کلیدی مخفی برای سئو */}
              <p className="text-slate-600 text-xs hidden md:block">
                ★ سیستم نوبت دهی تخصصی کاشت ناخن ★ مدیریت نوبت ترمیم ★ پیامک یادآوری خودکار ★
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
    <div className="bg-white/5 p-10 rounded-[3rem] backdrop-blur-md border border-white/5 hover:border-rose-500/30 hover:bg-white/10 transition-all duration-500 group/card transform hover:-translate-y-2 text-right">
      <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover/card:scale-110 transition-transform duration-500 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3 text-white group-hover/card:text-rose-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 text-sm font-bold leading-relaxed">
        {desc}
      </p>
      {seoDesc && (
        <p className="text-slate-500 text-[10px] mt-3 hidden md:block">
          {seoDesc}
        </p>
      )}
    </div>
  );
}