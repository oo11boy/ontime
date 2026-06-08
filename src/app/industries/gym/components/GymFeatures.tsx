// app/industries/gym/components/GymFeatures.tsx
"use client";

import { 
  CalendarDays, 
  Users, 
  UserPlus, 
  Clock, 
  MessageSquareText, 
  UserX,
  Trophy,
  Dumbbell
} from "lucide-react";

const gymFeatures = [
  {
    title: "مدیریت نوبت کلاس‌های ورزشی",
    desc: "نوبت کلاس‌های بدنسازی، یوگا، کراس فیت و سایر رشته‌ها را در تقویم هوشمند ثبت کنید. امکان تفکیک نوبت بین چند مربی.",
    seoDesc: "مدیریت نوبت کلاس‌های بدنسازی و ورزشی با سیستم آنتایم",
    icon: <CalendarDays size={32} />
  },
  {
    title: "تعریف شیفت کاری مربیان",
    desc: "ساعت حضور مربیان مختلف را تعیین کنید تا تقویم باشگاه همیشه دقیق و بدون تداخل باشد.",
    seoDesc: "مدیریت شیفت کاری مربیان ورزشی در سیستم نوبت دهی باشگاه",
    icon: <Users size={32} />
  },
  {
    title: "پرونده الکترونیک اعضا",
    desc: "تاریخچه کامل حضور در کلاس‌ها، برنامه غذایی، ثبت رکوردها و سوابق تمرینی هر عضو را مشاهده کنید.",
    seoDesc: "ذخیره سوابق تمرین و برنامه غذایی اعضا در پرونده الکترونیک",
    icon: <UserPlus size={32} />
  },
  {
    title: "مدیریت تخصصی زمان‌بندی",
    desc: "برای هر کلاس زمان مشخص (مثلاً ۶۰ دقیقه بدنسازی، ۹۰ دقیقه یوگا) تعریف کنید تا سیستم تداخل ایجاد نکند.",
    seoDesc: "تنظیم زمان دقیق برای هر کلاس ورزشی در نرم افزار نوبت دهی باشگاه",
    icon: <Clock size={32} />
  },
  {
    title: "پیامک یادآوری خودکار تمرین",
    desc: "بدون نیاز به تماس، سیستم چند ساعت قبل از کلاس به عضو پیامک یادآوری می‌فرستد.",
    seoDesc: "ارسال خودکار پیامک یادآوری جلسات تمرینی و کاهش ۸۰ درصدی کنسلی",
    icon: <MessageSquareText size={32} />
  },
  {
    title: "لیست سیاه اعضای بدقول",
    desc: "اعضایی که بدون اطلاع قبلی در کلاس حاضر نمی‌شوند را مسدود کنید تا در مراجعات بعدی هشدار داده شود.",
    seoDesc: "مدیریت اعضای بدقول و کاهش لغو نوبت در باشگاه ورزشی",
    icon: <UserX size={32} />
  }
];

export default function GymFeatures() {
  return (
    <section id="features" className="py-16 md:py-20 lg:py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-4 md:mb-6 text-slate-900 leading-[1.2]">
            امکانات <span className="text-emerald-600">هوشمند</span>{" "}
            <span className="text-emerald-600">نرم افزار نوبت دهی باشگاه</span>
          </h2>
          <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            آنتایم تمام ابزارهای لازم برای <strong className="text-emerald-600">نظم‌دهی به نوبت کلاس‌های ورزشی و مدیریت باشگاه</strong> شما را در یک پنل کاربری ساده فراهم کرده است.
            <br />
            <span className="text-xs sm:text-sm text-slate-400 block mt-2">
              ★ مدیریت تخصصی نوبت کلاس‌های بدنسازی ★ پیامک یادآوری خودکار ★ لینک اختصاصی برای هر عضو ★
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {gymFeatures.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] border border-emerald-50 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl mb-5 md:mb-8 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4 text-slate-900 group-hover:text-emerald-600 transition-colors">
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