// در فایل: src/components/Landing/BusinessProfileShowcase.tsx
"use client";

import React from "react";
import {
  Share2,
  Calendar,
  MessageSquare,
  XCircle,
  CheckCircle2,
  Smartphone,
  ArrowLeft,
  Sparkles,
  Users,
  Bell,
  Database,
  Monitor,
  Instagram,
  Send,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function BusinessProfileShowcase(): React.JSX.Element {
  return (
    <section
      id="two-features"
      className="py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ========== هدر اصلی ========== */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-blue-100 text-blue-700 font-black text-xs mb-6 border border-blue-200">
            <Sparkles size={14} className="text-amber-500" />
            <span>⚡ دو قابلیت قدرتمند در یک اپلیکیشن</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-tight">
            <span className="text-blue-600">مدیریت داخلی</span> +{" "}
            <span className="text-emerald-600">صفحه اختصاصی رزرو</span>
            <br />
            هر آنچه برای نوبت‌دهی نیاز دارید
          </h2>

          <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            آنتایم هم <strong>پنل مدیریت حرفه‌ای</strong> برای ثبت نوبت و ارسال پیامک به شما می‌دهد،
            هم <strong>صفحه اختصاصی اینترنتی</strong> برای کسب‌وکارتان تا مشتریان خودشان نوبت بگیرند.
          </p>
        </div>

        {/* ========== نمایش دو قابلیت در کنار هم ========== */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          
          {/* قابلیت اول: مدیریت داخلی اپلیکیشن */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Smartphone size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-xl">مدیریت داخلی</h2>
                    <p className="text-xs text-blue-100">پنل اختصاصی کسب‌وکار</p>
                  </div>
                </div>
                <div className="bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full">
                  قابلیت اصلی
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <p className="text-slate-600 leading-relaxed border-r-4 border-blue-500 pr-4 text-sm">
                شما و تیمتان در این بخش کار می‌کنید. همه چیز در اختیار شماست.
              </p>
              
              <div className="space-y-4">
                <FeatureItem 
                  icon={<Users size={18} className="text-blue-600" />}
                  title="ثبت و مدیریت مشتریان"
                  desc="اطلاعات مشتریان را یک بار وارد کنید، همیشه در دسترس است"
                />
                <FeatureItem 
                  icon={<Calendar size={18} className="text-blue-600" />}
                  title="تقویم زیبا و حرفه‌ای"
                  desc="همه نوبت‌ها را در یک تقویم شمسی کامل ببینید"
                />
                <FeatureItem 
                  icon={<MessageSquare size={18} className="text-blue-600" />}
                  title="پیامک رزرو و یادآوری"
                  desc="ارسال خودکار پیامک تایید نوبت و یادآوری ۲۴ ساعت قبل"
                />
                <FeatureItem 
                  icon={<Send size={18} className="text-blue-600" />}
                  title="پیامک همگانی"
                  desc="به همه مشتریان خود یکباره پیامک تبلیغاتی یا اطلاعیه بفرستید"
                />
                <FeatureItem 
                  icon={<BarChart3 size={18} className="text-blue-600" />}
                  title="گزارشات تحلیلی"
                  desc="مشاهده آمار نوبت‌ها، درآمد و رفتار مشتریان"
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <span className="text-xs font-bold text-blue-700">📊 بیش از ۱,۵۰۰ کسب‌وکار از این قابلیت استفاده می‌کنند</span>
              </div>
            </div>
          </div>

          {/* قابلیت دوم: صفحه اختصاصی اینترنتی */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Monitor size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-xl">صفحه اختصاصی</h2>
                    <p className="text-xs text-emerald-100">برای انتشار در شبکه‌های اجتماعی</p>
                  </div>
                </div>
                <div className="bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full">
                  قابلیت ویژه
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <p className="text-slate-600 leading-relaxed border-r-4 border-emerald-500 pr-4 text-sm">
                یک صفحه اینترنتی اختصاصی بسازید و لینک آن را در اختیار مشتریان بگذارید.
              </p>
              
              <div className="space-y-4">
                <FeatureItem 
                  icon={<Share2 size={18} className="text-emerald-600" />}
                  title="لینک اختصاصی کسب‌وکار"
                  desc="مثال: ontime.ir/your-business-name — قابل اشتراک در اینستاگرام، واتساپ، بله و ..."
                />
                <FeatureItem 
                  icon={<Instagram size={18} className="text-emerald-600" />}
                  title="قابل قرار دادن در بیو پیج"
                  desc="مشتریان شما بدون نیاز به نصب اپ، وارد صفحه شما می‌شوند"
                />
                <FeatureItem 
                  icon={<Calendar size={18} className="text-emerald-600" />}
                  title="درخواست ثبت نوبت آنلاین"
                  desc="مشتری خودش تاریخ و ساعت دلخواه را انتخاب و درخواست نوبت می‌دهد"
                />
                <FeatureItem 
                  icon={<Clock size={18} className="text-emerald-600" />}
                  title="تغییر و لغو نوبت"
                  desc="مشتری می‌تواند نوبت خود را جابه‌جا یا لغو کند (با ذکر دلیل)"
                />
                <FeatureItem 
                  icon={<Sparkles size={18} className="text-emerald-600" />}
                  title="معرفی کامل کسب‌وکار"
                  desc="نمایش خدمات، گالری تصاویر، نظرات مشتریان و اطلاعات تماس"
                />
              </div>
              
              <div className="bg-emerald-50 p-4 rounded-xl text-center">
                <span className="text-xs font-bold text-emerald-700">🌐 +۲,۵۰۰ صفحه اختصاصی ساخته شده</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== فلow چارت: چطور این دو قابلیت در کنار هم کار می‌کنند ========== */}
        <div className="bg-slate-900 rounded-[2rem] p-8 lg:p-12 text-white mb-16">
          <h3 className="text-2xl font-black text-center mb-10">⚡ چطور این دو قابلیت در کنار هم کار می‌کنند؟</h3>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">۱</div>
              <p className="font-bold text-white">شما در <span className="text-blue-400">پنل مدیریت</span> مشتری را ثبت می‌کنید و نوبت می‌دهید</p>
              <p className="text-xs text-slate-400 mt-2">یا مشتری از صفحه اختصاصی درخواست نوبت می‌دهد</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">۲</div>
              <p className="font-bold text-white">سیستم <span className="text-emerald-400">پیامک تایید و یادآوری</span> را خودکار ارسال می‌کند</p>
              <p className="text-xs text-slate-400 mt-2">هم برای نوبت‌های ثبت شده توسط شما، هم توسط مشتری</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">۳</div>
              <p className="font-bold text-white">مشتری از <span className="text-purple-400">لینک اختصاصی</span> نوبت خود را می‌بیند و مدیریت می‌کند</p>
              <p className="text-xs text-slate-400 mt-2">تغییر تاریخ، لغو با ذکر دلیل، مشاهده جزئیات</p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-slate-400 text-sm">
            🔄 همه چیز به صورت خودکار هماهنگ است — نیازی به کار اضافی ندارید
          </div>
        </div>

        {/* ========== پیشنمایش صفحه اختصاصی ========== */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 lg:order-1">
            <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full mb-4">
              پیشنمایش زنده
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mb-4">
              صفحه اختصاصی کسب‌وکار شما<br />
              <span className="text-emerald-600">دقیقاً شبیه به این</span>
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              مشتریان شما با باز کردن این لینک، همه چیز را درباره کسب‌وکارتان می‌بینند و می‌توانند 
              درخواست نوبت بدهند.
            </p>
            <ul className="space-y-3">
              {[
                "معرفی کامل کسب‌وکار با لوگو و توضیحات",
                "لیست خدمات با قیمت و زمان تقریبی",
                "گالری تصاویر نمونه کارها",
                "فرم درخواست نوبت آنلاین",
                "بخش نظرات و امتیازات مشتریان",
                "دکمه تماس و مسیریابی"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          {/* شبیه‌ساز صفحه اختصاصی */}
          <div className="order-1 lg:order-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 size={16} />
                  <span className="text-sm font-black">ontime.ir/salon-sara</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl mx-auto mb-2 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-2xl">س</span>
                </div>
                <h4 className="font-black text-slate-800">سالن زیبایی سارا</h4>
                <p className="text-[10px] text-slate-400">⭐⭐⭐⭐⭐ 4.9 (۱۲۴ نظر)</p>
              </div>
              
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] font-bold text-slate-500 mb-2">خدمات ما</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <p className="text-xs font-bold">کراتین مو</p>
                    <p className="text-[9px] text-slate-400">۳۵۰,۰۰۰ تومان</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <p className="text-xs font-bold">کاشت ناخن</p>
                    <p className="text-[9px] text-slate-400">۲۵۰,۰۰۰ تومان</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <p className="text-xs font-bold">پاکسازی پوست</p>
                    <p className="text-[9px] text-slate-400">۴۰۰,۰۰۰ تومان</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <p className="text-xs font-bold">حنا و رنگ</p>
                    <p className="text-[9px] text-slate-400">۱۸۰,۰۰۰ تومان</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2">
                <Calendar size={16} />
                درخواست نوبت آنلاین
              </button>
            </div>
          </div>
        </div>

        {/* ========== سیستم بازخورد ========== */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-[2rem] p-8 lg:p-10 border border-rose-100">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={28} className="text-rose-600" />
                <span className="text-rose-600 font-black text-sm">📝 ثبت دلیل کنسلی توسط مشتری</span>
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-3">
                چرا نوبت‌ها کنسل می‌شوند؟
                <br />
                <span className="text-blue-600">با آنتایم متوجه می‌شوید!</span>
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                وقتی مشتری از طریق صفحه اختصاصی نوبت خود را لغو می‌کند، 
                سیستم از او دلیل می‌پرسد. این بازخوردها به شما کمک می‌کند:
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "نقاط ضعف کسب‌وکار خود را پیدا کنید",
                  "نرخ بازگشت مشتری را افزایش دهید",
                  "خدمات خود را بهبود ببخشید"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
       <div className="bg-white rounded-xl p-5 w-full max-w-xs shadow-lg">
  <p className="font-bold text-sm mb-2">❌ لغو نوبت</p>
  <p className="text-xs text-slate-400 mb-3">شنبه ۲۵ اسفند - ۱۷:۰۰</p>
  
  <label 
    htmlFor="cancel-reason" 
    className="text-xs font-bold mb-2 block text-slate-700"
  >
    دلیل لغو:
  </label>
  <select 
    id="cancel-reason"
    className="w-full p-2 border border-slate-200 rounded-lg text-xs mb-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
  >
    <option value="">لطفاً انتخاب کنید...</option>
    <option>تغییر برنامه شخصی</option>
    <option>هزینه خدمات بالا</option>
    <option>کیفیت خدمات رضایت‌بخش نبود</option>
    <option>پیدا کردن خدمات بهتر</option>
  </select>
  
  <button 
    className="w-full bg-rose-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors active:scale-95"
    aria-label="تایید لغو نوبت"
  >
    تایید لغو نوبت
  </button>
</div>
          </div>
        </div>

        {/* ========== CTA نهایی ========== */}
        <div className="mt-16 text-center">
          <Link
            href="/clientdashboard"
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl group"
          >
            شروع استفاده از آنتایم
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-slate-400 mt-4">
            💳 ۲ ماه رایگان + ۱۵۰ پیامک هدیه | بدون نیاز به کارت بانکی
          </p>
        </div>
      </div>
    </section>
  );
}

// کامپوننت آیتم ویژگی
function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-bold text-slate-800 text-sm">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}