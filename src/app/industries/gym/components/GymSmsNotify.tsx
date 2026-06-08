// app/industries/gym/components/GymSmsNotify.tsx
"use client";

import { freetime } from "@/lib/freetime";
import { MessageSquareText, CalendarCheck2, ExternalLink, ShieldCheck, Sparkles, BellRing, Link2, Dumbbell } from "lucide-react";

export default function GymSmsNotify() {
  return (
    <section id="sms" className="py-16 md:py-20 lg:py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* المان‌های نوری پس‌زمینه */}
      <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-emerald-600/20 blur-[100px] sm:blur-[120px] rounded-full -mr-32 sm:-mr-48"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
        <div className="order-2 lg:order-1 text-right">
          <div className="inline-flex items-center gap-2 py-1.5 sm:py-2 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-black mb-6 sm:mb-8">
            <BellRing size={12} className="sm:w-3.5 sm:h-3.5" />
            سیستم پیامک یادآوری جلسات تمرینی باشگاه
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-5 md:mb-8 leading-[1.2]">
            <span className="text-emerald-500">پیامک یادآوری خودکار</span>
            <br />
            جلسات تمرینی اعضا
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base md:text-lg mb-6 md:mb-10 leading-relaxed font-medium">
            بزرگترین چالش باشگاه‌های ورزشی، <strong className="text-white">فراموشی نوبت کلاس توسط اعضا</strong> است. آنتایم با ارسال <strong className="text-emerald-400">پیامک تایید نوبت و یادآوری هوشمند جلسه تمرینی</strong>، جای خالی اعضا را در کلاس‌های شما پر می‌کند. عضو از طریق لینک اختصاصی، تمام جزئیات نوبت خود را مدیریت می‌کند.
          </p>
          
          <p className="text-slate-500 text-[10px] sm:text-xs mb-5 md:mb-6 hidden md:block">
            ★ کاهش ۸۰ درصدی کنسلی کلاس‌های ورزشی ★ افزایش رضایت اعضا ★ مدیریت آنلاین نوبت بدون دخالت مربی ★
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2rem] border border-slate-700 flex items-start gap-3 md:gap-4 hover:border-emerald-500/50 transition-colors">
              <div className="p-2 md:p-3 bg-emerald-500/20 rounded-xl md:rounded-2xl text-emerald-500">
                <CalendarCheck2 size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="font-black text-xs sm:text-sm text-slate-100">یادآوری خودکار جلسه تمرینی</p>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] text-slate-500 mt-1 font-bold">ارسال پیامک ۲۴ ساعت قبل از کلاس</p>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2rem] border border-slate-700 flex items-start gap-3 md:gap-4 hover:border-emerald-500/50 transition-colors">
              <div className="p-2 md:p-3 bg-emerald-500/20 rounded-xl md:rounded-2xl text-emerald-500">
                <Link2 size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="font-black text-xs sm:text-sm text-slate-100">لینک اختصاصی مدیریت نوبت</p>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] text-slate-500 mt-1 font-bold">مشاهده جزئیات کلاس توسط عضو</p>
              </div>
            </div>
          </div>

          {/* مزیت اضافی برای سئو */}
          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20 text-center">
            <p className="text-xs sm:text-sm font-bold">
              ✨ <span className="text-emerald-400">{freetime.plan} هفته رایگان</span> شامل ۵۰ پیامک یادآوری تمرین ✨
            </p>
          </div>
        </div>

        <div className="relative order-1 lg:order-2 mt-8 lg:mt-0">
          {/* شبیه‌سازی حباب پیامک */}
          <div className="bg-white text-slate-900 p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(16,185,129,0.3)] relative z-10 -rotate-2 hover:rotate-0 transition-all duration-700 max-w-sm mx-auto border-4 border-slate-800">
            <div className="flex items-center justify-between mb-4 md:mb-6 border-b pb-3 md:pb-4 border-slate-100">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black">
                  <MessageSquareText size={16} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">پیامک آنتایم</p>
                  <p className="font-black text-slate-800 text-xs sm:text-sm">تایید نوبت کلاس ورزشی</p>
                </div>
              </div>
              <div className="text-[8px] md:text-[10px] text-slate-400 font-bold italic">الان</div>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <p className="text-xs sm:text-sm font-bold leading-relaxed text-slate-700">
                آقای رضا کریمی عزیز، نوبت شما برای <span className="text-emerald-600">کلاس بدنسازی حرفه‌ای</span> در تاریخ ۱۵ بهمن ساعت ۱۸:۰۰ ثبت شد.
              </p>
              <div className="bg-emerald-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-emerald-100">
                <p className="text-[9px] md:text-[10px] text-emerald-600 font-black mb-1.5 md:mb-2 flex items-center gap-1">
                  لینک مدیریت نوبت کلاس شما:
                </p>
                <p className="text-emerald-700 font-black text-[10px] sm:text-xs break-all tracking-tight">
                  ontimeapp.ir/c/gym-458k
                </p>
              </div>
              <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-slate-400 font-bold">
                <ShieldCheck size={10} className="md:w-3 md:h-3 text-emerald-500" />
                لغو یا تغییر نوبت کلاس فقط تا ۲۴ ساعت قبل امکان‌پذیر است.
              </div>
            </div>
          </div>
          
          {/* المان‌های گرافیکی انتزاعی */}
          <div className="absolute -top-8 md:-top-10 -left-8 md:-left-10 w-20 h-20 md:w-24 md:h-24 bg-emerald-500 rounded-full blur-[50px] md:blur-[60px] opacity-40"></div>
          <div className="absolute -bottom-8 md:-bottom-10 right-0 w-24 h-24 md:w-32 md:h-32 bg-teal-500 rounded-full blur-[60px] md:blur-[80px] opacity-20"></div>
        </div>
      </div>
    </section>
  );
}