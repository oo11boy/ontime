"use client";

import { MessageSquareText, CalendarCheck2, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";

export default function NailSmsNotify() {
  return (
    <section id="sms" className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* المان‌های نوری پس‌زمینه برای دیزاین متفاوت */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 blur-[120px] rounded-full -mr-48"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="order-2 lg:order-1 text-right">
          <div className="inline-flex items-center gap-2 py-2 px-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black mb-8">
            <Sparkles size={14} />
            اتوماسیون پیامکی ویژه خدمات ناخن
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-[1.2]">
            هماهنگی خودکار <br />
            <span className="text-rose-500">بدون لمس گوشی</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
            بزرگترین چالش ناخن‌کارها، فراموشی نوبت توسط مشتری است. آنتایم با ارسال <strong>پیامک تایید نوبت و یادآوری هوشمند</strong>، جای خالی مشتری را در سالن شما پر می‌کند. مشتری از طریق لینک اختصاصی، تمام جزئیات رزرو خود را مدیریت می‌کند.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-700 flex items-start gap-4 hover:border-rose-500/50 transition-colors">
              <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500"><CalendarCheck2 size={24} /></div>
              <div>
                <p className="font-black text-sm text-slate-100">یادآوری تایم ترمیم</p>
                <p className="text-[11px] text-slate-500 mt-1 font-bold italic">ارسال خودکار ۲۴ ساعت قبل</p>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-700 flex items-start gap-4 hover:border-rose-500/50 transition-colors">
              <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500"><ExternalLink size={24} /></div>
              <div>
                <p className="font-black text-sm text-slate-100">لینک شخصی کلاینت</p>
                <p className="text-[11px] text-slate-500 mt-1 font-bold italic">مشاهده آدرس و مشخصات رزرو</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          {/* شبیه‌سازی حباب پیامک با تم تیره و جذاب */}
          <div className="bg-white text-slate-900 p-8 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(225,29,72,0.3)] relative z-10 -rotate-2 hover:rotate-0 transition-all duration-700 max-w-sm mx-auto border-4 border-slate-800">
            <div className="flex items-center justify-between mb-6 border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-white font-black">
                    <MessageSquareText size={20} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase">Notification</p>
                  <p className="font-black text-slate-800 text-sm">تایید رزرو ناخن</p>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-bold italic">الان</div>
            </div>
            
            <div className="space-y-4">
              <p className="text-[13px] font-bold leading-relaxed text-slate-700">
                خانم سمیرا عزیز، نوبت شما برای <span className="text-rose-600">ترمیم و لاک‌ژل</span> در تاریخ ۱۵ بهمن ساعت ۱۶:۰۰ ثبت شد.
              </p>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <p className="text-[10px] text-rose-600 font-black mb-2 flex items-center gap-1">
                  پنل مدیریت نوبت شما:
                </p>
                <p className="text-rose-700 font-black text-[12px] break-all tracking-tight">
                  ontimeapp.ir/res/nail-458k
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                <ShieldCheck size={12} className="text-emerald-500" />
                لغو یا تغییر نوبت فقط تا ۲۴ ساعت قبل امکان‌پذیر است.
              </div>
            </div>
          </div>
          
          {/* المان‌های گرافیکی انتزاعی */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-rose-500 rounded-full blur-[60px] opacity-40"></div>
          <div className="absolute -bottom-10 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
        </div>
      </div>
    </section>
  );
}