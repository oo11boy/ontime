"use client";

import { Check, X, AlertCircle, Scissors, Smartphone, Clock, CalendarCheck, MessageSquare } from "lucide-react";

const nailComparisonData = [
  {
    title: "یادآوری نوبت ترمیم",
    oldWay: "فراموشی نوبت توسط مشتری و خالی ماندن تایم ۲ ساعته شما که ضرر مالی مستقیم است.",
    newWay: "ارسال خودکار پیامک یادآوری هوشمند ۲۴ ساعت قبل از نوبت ترمیم به مشتری.",
    seoKeyword: "پیامک یادآوری خودکار نوبت ترمیم ناخن"
  },
  {
    title: "هماهنگی حین کار کاشت ناخن",
    oldWay: "مجبورید کار را متوقف کنید، دستکش را در بیاورید و با دست خاکی جواب تلفن بدهید.",
    newWay: "ثبت سریع نوبت در تقویم دیجیتال بین مراحل سوهان‌کشی، بدون اتلاف وقت.",
    seoKeyword: "ثبت نوبت آنلاین کاشت ناخن بدون قطع کار"
  },
  {
    title: "اطلاع‌رسانی قیمت کاشت و ژلیش",
    oldWay: "صرف وقت زیاد برای توضیح قیمت کاشت، ژلیش و لمینت به هر مشتری در دایرکت یا تماس.",
    newWay: "مشاهده منوی خدمات و قیمت‌های کاشت و ترمیم توسط مشتری بلافاصله پس از ثبت نوبت.",
    seoKeyword: "نمایش آنلاین قیمت کاشت ناخن و ژلیش"
  },
  {
    title: "هماهنگی نوبت بعدی کاشت",
    oldWay: "نوشتن نوبت روی کارت‌های کاغذی که کلاینت معمولاً آن‌ها را گم می‌کند.",
    newWay: "ثبت آنی نوبت در پنل و ارسال همزمان پیامک تایید با تاریخ و ساعت دقیق برای مشتری.",
    seoKeyword: "ثبت نوبت کاشت ناخن با پیامک تایید فوری"
  },
  {
    title: "دسترسی به سوابق کاشت و رنگ مشتری",
    oldWay: "گشتن لابلای دفترچه‌های قدیمی برای پیدا کردن شماره رنگ لاک‌ژلی که مشتری قبلاً زده بود.",
    newWay: "آرشیو دیجیتال سوابق کلاینت؛ تمام یادداشت‌ها و کدهای رنگ همیشه در موبایل شما.",
    seoKeyword: "مدیریت سوابق کاشت ناخن و کدهای رنگ مشتری"
  }
];

export default function NailComparison() {
  return (
    <section className="py-24 bg-slate-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          {/* H2 بهینه شده برای سئو - کاملاً متفاوت از صفحه آرایشگاه */}
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-[1.2]">
            خداحافظی با <span className="text-rose-600">دفترچه‌های کاغذی</span>
            <br />
            <span className="text-2xl lg:text-3xl text-slate-700 mt-2 block">
              با <span className="text-rose-600">نرم افزار نوبت دهی ناخن کار آنتایم</span>
            </span>
          </h2>
          <p className="text-slate-600 font-bold text-lg max-w-2xl mx-auto">
            مقایسه مدیریت سنتی با <strong className="text-rose-600">سیستم هوشمند نوبت دهی تخصصی کاشت و ترمیم ناخن</strong>؛ تفاوت در نظم، درآمد و رضایت مشتری
          </p>
          {/* کلمات کلیدی مخفی برای سئو */}
          <p className="text-slate-400 text-xs mt-4 hidden md:block">
            ★ کاهش ۸۰ درصدی کنسلی نوبت ترمیم ★ افزایش رضایت مشتریان کاشت ناخن ★ صرفه‌جویی ۱۵ ساعته در ماه ★
          </p>
        </div>

        <div className="space-y-6">
          {nailComparisonData.map((item, index) => (
            <div key={index} className="grid md:grid-cols-11 gap-4 items-center">
              {/* وضعیت قدیمی */}
              <div className="md:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-200 opacity-70 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-3 mb-3 text-red-500 font-black">
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
                  <span>با نرم افزار نوبت دهی ناخن کار آنتایم</span>
                </div>
                <p className="text-white/90 text-sm font-bold leading-relaxed">{item.newWay}</p>
                {/* کلمه کلیدی مخفی برای هر آیتم */}
                <p className="text-white/40 text-[10px] mt-2 hidden md:block">
                  {item.seoKeyword}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 bg-white p-6 rounded-[2.5rem] border border-rose-100 max-w-2xl mx-auto shadow-sm">
          <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
            <Clock size={24} />
          </div>
          <p className="text-slate-700 text-sm lg:text-base font-bold leading-relaxed">
            ناخن‌کاران حرفه‌ای با حذف هماهنگی‌های تلفنی و استفاده از <span className="text-rose-600">سیستم نوبت دهی آنلاین کاشت ناخن</span>، ماهانه <span className="text-rose-600 text-lg">بیش از ۱۵ ساعت</span> وقت آزاد برای پذیرش مشتری جدید پیدا می‌کنند.
          </p>
        </div>

        {/* بیلبورد اعتماد اجتماعی - تخصصی ناخن */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-bold">
            ★ بیش از ۸۵۰ ناخن‌کار فعال ★ ۴۲,۰۰۰ نوبت کاشت و ترمیم ★ ۱۲۵,۰۰۰ پیامک یادآوری موفق ★
          </p>
        </div>
      </div>
    </section>
  );
}