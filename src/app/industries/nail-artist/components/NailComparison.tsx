"use client";

import { Check, X, AlertCircle, Scissors, Smartphone, Clock } from "lucide-react";

const nailComparisonData = [
  {
    title: "یادآوری نوبت ترمیم",
    oldWay: "فراموشی نوبت توسط مشتری و خالی ماندن تایم ۲ ساعته شما که ضرر مالی مستقیم است.",
    newWay: "ارسال خودکار پیامک یادآوری هوشمند ۲۴ ساعت قبل از نوبت ترمیم به مشتری."
  },
  {
    title: "هماهنگی حین کار",
    oldWay: "مجبورید کار را متوقف کنید، دستکش را در بیاورید و با دست خاکی جواب تلفن بدهید.",
    newWay: "ثبت سریع نوبت در تقویم دیجیتال بین مراحل سوهان‌کشی، بدون اتلاف وقت."
  },
  {
    title: "اطلاع‌رسانی قیمت‌ها",
    oldWay: "صرف وقت زیاد برای توضیح قیمت کاشت، ژلیش و لمینت به هر مشتری در دایرکت یا تماس.",
    newWay: "مشاهده منوی خدمات و قیمت‌های شما توسط مشتری بلافاصله پس از ثبت نوبت."
  },
  {
    title: "هماهنگی نوبت بعدی",
    oldWay: "نوشتن نوبت روی کارت‌های کاغذی که کلاینت معمولاً آن‌ها را گم می‌کند.",
    newWay: "ثبت آنی نوبت در پنل و ارسال همزمان پیامک تایید با تاریخ و ساعت دقیق برای مشتری."
  },
  {
    title: "دسترسی به سوابق",
    oldWay: "گشتن لابلای دفترچه‌های قدیمی برای پیدا کردن شماره رنگ لاک‌ژلی که مشتری قبلاً زده بود.",
    newWay: "آرشیو دیجیتال سوابق کلاینت؛ تمام یادداشت‌ها و کدهای رنگ همیشه در موبایل شما."
  }
];

export default function NailComparison() {
  return (
    <section className="py-24 bg-slate-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-[1.2]">
            میز ناخن خود را <span className="text-rose-600">دیجیتال</span> کنید
          </h2>
          <p className="text-slate-600 font-bold text-lg">
            تفاوت مدیریت سنتی با دفترچه و نظمِ مدرن با آنتایم
          </p>
        </div>

        <div className="space-y-6">
          {nailComparisonData.map((item, index) => (
            <div key={index} className="grid md:grid-cols-11 gap-4 items-center">
              {/* وضعیت قدیمی */}
              <div className="md:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-200 opacity-70 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-3 mb-3 text-slate-400 font-black">
                  <X size={20} />
                  <span>روش سنتی (دفترچه کاغذی)</span>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.oldWay}</p>
              </div>

              {/* جداکننده میانی */}
              <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-2">
                <div className="h-px md:w-px md:h-8 bg-slate-300 flex-1"></div>
                <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md tracking-tighter uppercase">VS</div>
                <div className="h-px md:w-px md:h-8 bg-slate-300 flex-1"></div>
              </div>

              {/* وضعیت جدید آنتایم */}
              <div className="md:col-span-5 bg-rose-600 p-6 rounded-[2rem] shadow-xl shadow-rose-200">
                <div className="flex items-center gap-3 mb-3 text-white font-black">
                  <Check size={20} className="bg-white/20 rounded-full p-0.5" />
                  <span>مدیریت هوشمند با آنتایم</span>
                </div>
                <p className="text-white/90 text-sm font-bold leading-relaxed">{item.newWay}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 bg-white p-6 rounded-[2.5rem] border border-rose-100 max-w-2xl mx-auto shadow-sm">
          <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
            <Clock size={24} />
          </div>
          <p className="text-slate-700 text-sm lg:text-base font-bold leading-relaxed">
            ناخن‌کاران حرفه‌ای با حذف هماهنگی‌های تلفنی، ماهانه <span className="text-rose-600 text-lg">بیش از ۱۵ ساعت</span> وقت آزاد برای پذیرش مشتری جدید پیدا می‌کنند.
          </p>
        </div>
      </div>
    </section>
  );
}