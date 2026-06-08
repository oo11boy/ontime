// app/industries/consulting/components/ConsultingFeatures.tsx
"use client";

import { 
  CalendarDays, 
  Users, 
  UserPlus, 
  Clock, 
  MessageSquareText, 
  UserX,
  Brain,
  Video
} from "lucide-react";

const consultingFeatures = [
  {
    title: "مدیریت نوبت جلسات مشاوره",
    desc: "نوبت جلسات حضوری و آنلاین (تلفنی/ویدئویی) را در تقویم هوشمند ثبت کنید. امکان تفکیک بین چند مشاور و روانشناس.",
    seoDesc: "مدیریت نوبت جلسات مشاوره حضوری و آنلاین با سیستم آنتایم",
    icon: <CalendarDays size={32} />
  },
  {
    title: "تعریف شیفت کاری مشاوران",
    desc: "ساعت حضور مشاوران و روانشناسان مختلف را تعیین کنید تا تقویم مرکز مشاوره همیشه دقیق و بدون تداخل باشد.",
    seoDesc: "مدیریت شیفت کاری روانشناسان و مشاوران در سیستم نوبت دهی مراکز مشاوره",
    icon: <Users size={32} />
  },
  {
    title: "پرونده الکترونیک مراجعان",
    desc: "تاریخچه کامل جلسات مشاوره، یادداشت‌های درمانی، تشخیص‌ها و سوابق مراجعه هر مراجع را مشاهده کنید.",
    seoDesc: "ذخیره سوابق جلسات مشاوره و یادداشت‌های درمانی در پرونده الکترونیک",
    icon: <UserPlus size={32} />
  },
  {
    title: "مدیریت تخصصی زمان جلسات",
    desc: "برای هر نوع جلسه زمان مشخص (مثلاً مشاوره فردی ۶۰ دقیقه، زوج درمانی ۹۰ دقیقه) تعریف کنید تا سیستم تداخل ایجاد نکند.",
    seoDesc: "تنظیم زمان دقیق برای جلسات مشاوره فردی، گروهی و زوج درمانی",
    icon: <Clock size={32} />
  },
  {
    title: "پیامک یادآوری خودکار جلسات",
    desc: "بدون نیاز به تماس، سیستم چند ساعت قبل از جلسه مشاوره به مراجع پیامک یادآوری می‌فرستد تا کنسلی کاهش یابد.",
    seoDesc: "ارسال خودکار پیامک یادآوری جلسات مشاوره و کاهش ۸۰ درصدی کنسلی",
    icon: <MessageSquareText size={32} />
  },
  {
    title: "لیست سیاه مراجعان بدقول",
    desc: "مراجعانی که بدون اطلاع قبلی در جلسه مشاوره حاضر نمی‌شوند را مسدود کنید تا در مراجعات بعدی هشدار داده شود.",
    seoDesc: "مدیریت مراجعان بدقول و کاهش لغو جلسات در مراکز مشاوره",
    icon: <UserX size={32} />
  }
];

export default function ConsultingFeatures() {
  return (
    <section id="features" className="py-16 md:py-20 lg:py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-4 md:mb-6 text-slate-900 leading-[1.2]">
            امکانات <span className="text-indigo-600">هوشمند</span>{" "}
            <span className="text-indigo-600">نرم افزار نوبت دهی روانشناس و مشاور</span>
          </h2>
          <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            آنتایم تمام ابزارهای لازم برای <strong className="text-indigo-600">نظم‌دهی به جلسات مشاوره و مدیریت مرکز روانشناسی</strong> شما را در یک پنل کاربری ساده فراهم کرده است.
            <br />
            <span className="text-xs sm:text-sm text-slate-400 block mt-2">
              ★ مدیریت تخصصی جلسات مشاوره حضوری و آنلاین ★ پیامک یادآوری خودکار ★ لینک اختصاصی برای هر مراجع ★
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {consultingFeatures.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] border border-indigo-50 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl mb-5 md:mb-8 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4 text-slate-900 group-hover:text-indigo-600 transition-colors">
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