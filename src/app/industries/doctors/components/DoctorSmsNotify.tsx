
// app/industries/doctors/components/DoctorSmsNotify.tsx
"use client";

import { MessageSquareText, CalendarCheck2, ExternalLink, ShieldCheck, Sparkles, BellRing, Link2 } from "lucide-react";

export default function DoctorSmsNotify() {
  return (
    <section id="sms" className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* المان‌های نوری پس‌زمینه */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -mr-48"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="order-2 lg:order-1 text-right">
          <div className="inline-flex items-center gap-2 py-2 px-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black mb-8">
            <BellRing size={14} />
            سیستم پیامک یادآوری نوبت ویزیت بیماران
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-[1.2]">
            <span className="text-blue-500">پیامک یادآوری خودکار</span>
            <br />
            نوبت ویزیت بیماران
          </h2>
          
          <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
            بزرگترین چالش مطب‌های پزشکی، <strong className="text-white">فراموشی نوبت ویزیت توسط بیماران</strong> است. آنتایم با ارسال <strong className="text-blue-400">پیامک تایید نوبت و یادآوری هوشمند ویزیت</strong>، جای خالی بیماران را در مطب شما پر می‌کند. بیمار از طریق لینک اختصاصی، تمام جزئیات نوبت خود را مدیریت می‌کند.
          </p>
          
          <p className="text-slate-500 text-xs mb-6 hidden md:block">
            ★ کاهش ۸۰ درصدی کنسلی نوبت ویزیت ★ افزایش رضایت بیماران ★ مدیریت آنلاین نوبت بدون دخالت منشی ★
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-700 flex items-start gap-4 hover:border-blue-500/50 transition-colors">
              <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500"><CalendarCheck2 size={24} /></div>
              <div>
                <p className="font-black text-sm text-slate-100">یادآوری خودکار نوبت ویزیت</p>
                <p className="text-[11px] text-slate-500 mt-1 font-bold">ارسال پیامک ۲۴ ساعت قبل از ویزیت</p>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-700 flex items-start gap-4 hover:border-blue-500/50 transition-colors">
              <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500"><Link2 size={24} /></div>
              <div>
                <p className="font-black text-sm text-slate-100">لینک اختصاصی مدیریت نوبت</p>
                <p className="text-[11px] text-slate-500 mt-1 font-bold">مشاهده جزئیات ویزیت توسط بیمار</p>
              </div>
            </div>
          </div>

          {/* مزیت اضافی برای سئو */}
          <div className="mt-8 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center">
            <p className="text-sm font-bold">
              ✨ <span className="text-blue-400">۲ هفته رایگان</span> شامل ۵۰ پیامک یادآوری ویزیت ✨
            </p>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          {/* شبیه‌سازی حباب پیامک */}
          <div className="bg-white text-slate-900 p-8 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(37,99,235,0.3)] relative z-10 -rotate-2 hover:rotate-0 transition-all duration-700 max-w-sm mx-auto border-4 border-slate-800">
            <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black">
                  <MessageSquareText size={20} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase">پیامک آنتایم</p>
                  <p className="font-black text-slate-800 text-sm">تایید نوبت ویزیت</p>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-bold italic">الان</div>
            </div>
            
            <div className="space-y-4">
              <p className="text-[13px] font-bold leading-relaxed text-slate-700">
                آقای رضا محمدی عزیز، نوبت ویزیت شما برای <span className="text-blue-600">مطب دکتر کریمی</span> در تاریخ ۱۵ بهمن ساعت ۱۰:۰۰ ثبت شد.
              </p>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-black mb-2 flex items-center gap-1">
                  لینک مدیریت نوبت ویزیت شما:
                </p>
                <p className="text-blue-700 font-black text-[12px] break-all tracking-tight">
                  ontimeapp.ir/c/doctor-458k
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                <ShieldCheck size={12} className="text-emerald-500" />
                لغو یا تغییر نوبت ویزیت فقط تا ۲۴ ساعت قبل امکان‌پذیر است.
              </div>
            </div>
          </div>
          
          {/* المان‌های گرافیکی انتزاعی */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-500 rounded-full blur-[60px] opacity-40"></div>
          <div className="absolute -bottom-10 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
        </div>
      </div>
    </section>
  );
}