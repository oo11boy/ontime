"use client";

import { 
  UserPlus, 
  CalendarDays, 
  MessageSquareText, 
  UserX, 
  Clock4, 
  Users,
  Sparkles,
  CheckCircle2
} from "lucide-react";

const nailManagerFeatures = [
  {
    title: "ثبت سریع نوبت و ارسال پیامک تایید",
    desc: "به محض اینکه مشتری تماس می‌گیرد، نوبت کاشت یا ترمیم را در پنل ثبت کنید تا بلافاصله پیامک تایید رزرو برای او ارسال شود.",
    seoDesc: "ثبت آنلاین نوبت کاشت ناخن و ارسال خودکار پیامک تایید به مشتری",
    icon: <CalendarDays size={32} />
  },
  {
    title: "تعریف شیفت کاری ناخن‌کاران و پرسنل",
    desc: "ساعت حضور خود و پرسنل کمکی را تعیین کنید تا تقویم کاری‌تان همیشه دقیق و بدون تداخل برای نوبت‌های کاشت و ترمیم باشد.",
    seoDesc: "مدیریت شیفت کاری و زمان‌بندی ناخن‌کاران در سیستم نوبت دهی",
    icon: <Users size={32} />
  },
  {
    title: "پروفایل هوشمند مشتریان ناخن",
    desc: "تاریخچه کامل خدمات (ترمیم، کاشت، ژلیش، طراحی) و تعداد نوبت‌های کنسل شده هر مشتری را در لحظه مشاهده کنید.",
    seoDesc: "ذخیره تاریخچه کاشت ناخن و رنگ‌های استفاده شده برای هر مشتری",
    icon: <UserPlus size={32} />
  },
  {
    title: "مدیریت خدمات و تایم‌بندی تخصصی",
    desc: "برای هر خدمت تایم مشخص (مثلاً ۲ ساعت برای ترمیم یا ۳ ساعت برای کاشت لمینت) تعریف کنید تا سیستم هنگام ثبت نوبت، فضای خالی را نشان دهد.",
    seoDesc: "تنظیم زمان دقیق برای هر سرویس کاشت، ترمیم و ژلیش ناخن",
    icon: <Clock4 size={32} />
  },
  {
    title: "پیامک یادآوری خودکار نوبت ترمیم",
    desc: "بدون نیاز به تماس شما، سیستم چند ساعت قبل از نوبت به مشتری پیامک یادآوری می‌فرستد تا تایم کاشت یا ترمیم شما خالی نماند.",
    seoDesc: "ارسال خودکار پیامک یادآوری نوبت ترمیم و کاهش ۸۰ درصدی کنسلی",
    icon: <MessageSquareText size={32} />
  },
  {
    title: "لیست سیاه مشتریان بدقول ناخن",
    desc: "مشتریانی که نوبت کاشت یا ترمیم خود را بدون اطلاع قبلی کنسل می‌کنند بلاک کنید تا در مراجعات بعدی به شما هشدار داده شود.",
    seoDesc: "مدیریت مشتریان بدقول و کاهش لغو نوبت در سالن کاشت ناخن",
    icon: <UserX size={32} />
  }
];

export default function NailManagerFeatures() {
  return (
    <section id="features" className="py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          {/* H2 بهینه شده برای سئو - کاملاً متفاوت از صفحه آرایشگاه */}
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-slate-900 leading-[1.2]">
            امکانات <span className="text-rose-500">هوشمند</span>{" "}
            <span className="text-rose-500">نرم افزار نوبت دهی ناخن کار</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            آنتایم یک پنل مدیریتی قدرتمند برای <strong className="text-rose-600">ناخن‌کاران و متخصصان کاشت ناخن</strong> است تا تمام امور سالن را از ثبت نوبت تا مدیریت پرسنل، به تنهایی رهبری کنند.
            <br />
            <span className="text-sm text-slate-400 block mt-2">
              ★ مدیریت تخصصی نوبت کاشت، ترمیم و ژلیش ★ پیامک یادآوری خودکار ★ لینک اختصاصی برای هر مشتری ★
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nailManagerFeatures.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-[2.5rem] border border-rose-50 shadow-sm hover:shadow-2xl hover:shadow-rose-100/40 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="inline-flex p-4 rounded-2xl mb-8 bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-black mb-4 text-slate-900 group-hover:text-rose-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[15px] font-medium">
                {item.desc}
              </p>
              {/* توضیحات مخفی برای سئو */}
              <p className="text-slate-400 text-xs mt-3 hidden md:block">
                {item.seoDesc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}