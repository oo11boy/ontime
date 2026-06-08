// app/industries/custom-booking-page/components/CustomBookingFeatures.tsx
"use client";

import { 
  Globe, 
  Image, 
  DollarSign, 
  Users, 
  CalendarCheck, 
  MessageSquare,
  Star,
  Edit3,
  Trash2,
  Smartphone,
  Link2,
  Instagram,
  Phone
} from "lucide-react";

const features = [
  {
    title: "لینک اختصاصی یکتا",
    desc: "هر کسب‌وکار یک لینک منحصر‌به‌فرد دریافت می‌کند. مشتریان با کلیک روی لینک، مستقیماً وارد صفحه اختصاصی شما می‌شوند.",
    seoDesc: "لینک اختصاصی نوبت دهی برای هر کسب و کار",
    icon: <Link2 size={28} />
  },
  {
    title: "معرفی کامل کسب و کار",
    desc: "نام بیزنس، آدرس، شماره تماس، ساعت کاری و توضیحات کامل درباره خدمات شما در صفحه نمایش داده می‌شود.",
    seoDesc: "معرفی تخصصی کسب و کار در صفحه اختصاصی",
    icon: <Globe size={28} />
  },
  {
    title: "گالری نمونه کارها",
    desc: "تصاویر نمونه کارهای خود را آپلود کنید تا مشتریان قبل از رزرو، کیفیت کار شما را ببینند.",
    seoDesc: "نمایش نمونه کارها در گالری اختصاصی",
    icon: <Image size={28} />
  },
  {
    title: "لیست خدمات با قیمت",
    desc: "خدمات خود را به همراه قیمت و زمان دقیق هر سرویس تعریف کنید. مشتریان هزینه را قبل از رزرو می‌بینند.",
    seoDesc: "نمایش قیمت و زمان خدمات به مشتری",
    icon: <DollarSign size={28} />
  },
  {
    title: "شبکه‌های اجتماعی",
    desc: "لینک اینستاگرام، تلگرام و سایر شبکه‌های اجتماعی خود را در صفحه قرار دهید تا مشتریان شما را دنبال کنند.",
    seoDesc: "اتصال شبکه‌های اجتماعی به صفحه اختصاصی",
    icon: <Instagram size={28} />
  },
  {
    title: "نظرات و امتیازدهی",
    desc: "مشتریان بعد از دریافت خدمات، می‌توانند نظر و امتیاز خود را ثبت کنند. این به بهبود کسب‌وکار شما کمک می‌کند.",
    seoDesc: "مدیریت نظرات و امتیازات مشتریان",
    icon: <Star size={28} />
  },
  {
    title: "ثبت نوبت آنلاین",
    desc: "مشتریان بدون تماس تلفنی، در هر ساعت از شبانه‌روز می‌توانند نوبت خود را ثبت کنند.",
    seoDesc: "رزرو آنلاین نوبت بدون تماس تلفنی",
    icon: <CalendarCheck size={28} />
  },
  {
    title: "تغییر و لغو نوبت",
    desc: "مشتریان می‌توانند با ذکر دلیل، نوبت خود را تغییر دهند یا لغو کنند. این اطلاعات به بهبود خدمات شما کمک می‌کند.",
    seoDesc: "مدیریت تغییر و لغو نوبت توسط مشتری",
    icon: <Edit3 size={28} />
  },
  {
    title: "پیامک یادآوری",
    desc: "سیستم به صورت خودکار به مشتریان یادآوری می‌کند تا نوبت خود را فراموش نکنند.",
    seoDesc: "ارسال خودکار پیامک یادآوری نوبت",
    icon: <MessageSquare size={28} />
  },
  {
    title: "بدون نیاز به نصب",
    desc: "مشتریان شما نیازی به نصب هیچ اپلیکیشنی ندارند. همه چیز در مرورگر گوشی آنها باز می‌شود.",
    seoDesc: "دریافت نوبت بدون نیاز به نصب اپلیکیشن",
    icon: <Smartphone size={28} />
  }
];

export default function CustomBookingFeatures() {
  return (
    <section id="features" className="py-16 md:py-20 lg:py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-slate-900 leading-[1.2]">
            صفحه اختصاصی شما چه امکاناتی دارد؟
          </h2>
          <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            تمام ابزارهای لازم برای یک صفحه حرفه‌ای نوبت‌دهی در اختیار شماست
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {features.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl mb-5 md:mb-8 bg-gradient-to-r from-blue-50 to-pink-50 text-blue-600 group-hover:from-blue-600 group-hover:to-pink-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[13px] sm:text-[14px] md:text-[15px] font-medium">
                {item.desc}
              </p>
              <p className="text-slate-400 text-[10px] sm:text-xs mt-3 hidden md:block">
                {item.seoDesc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}