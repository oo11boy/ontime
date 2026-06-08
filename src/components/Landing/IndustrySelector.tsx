import { 
  Scissors, Stethoscope, Dumbbell, UtensilsCrossed, 
  CalendarCheck, Sparkles, Check, ChevronLeft,
  MessageSquare, Smartphone, Brain
} from "lucide-react";
import Link from "next/link";

const industries = [
  {
    title: "آرایشگاه و سالن زیبایی",
    seoKeyword: "نوبت دهی آرایشگاه",
    desc: "مدیریت لاین‌های مختلف و کاهش کنسلی نوبت‌های خدمات زیبایی با پیامک یادآوری.",
    icon: <Scissors className="text-pink-500" />,
    link: "/industries/beauty-salon",
    color: "hover:border-pink-500/50",
    badge: "فعال",
    hasLanding: true
  },
  {
    title: "کاشت و خدمات ناخن",
    seoKeyword: "نوبت دهی ناخن",
    desc: "نظم‌دهی به نوبت‌های ترمیم و کاهش کنسلی با سیستم یادآوری هوشمند ویژه ناخن‌کاران حرفه‌ای.",
    icon: <Sparkles className="text-rose-500" />,
    link: "/industries/nail-artist",
    color: "hover:border-rose-500/50",
    badge: "فعال",
    hasLanding: true 
  },
  {
    title: "پزشکان و کلینیک‌ها",
    seoKeyword: "نرم افزار نوبت دهی پزشکان",
    desc: "نظم بخشیدن به صف انتظار بیماران و ارسال خودکار اطلاعات نوبت بلافاصله پس از ثبت با پیامک یادآوری.",
    icon: <Stethoscope className="text-blue-500" />,
    link: "/industries/doctors",
    color: "hover:border-blue-500/50",
    badge: "فعال",
    hasLanding: true
  },
  {
    title: "باشگاه‌های ورزشی",
    seoKeyword: "نرم افزار نوبت دهی باشگاه",
    desc: "رزرو کلاس‌های گروهی بدنسازی، یوگا و کراس فیت با مدیریت ظرفیت سالن‌های ورزشی.",
    icon: <Dumbbell className="text-emerald-500" />,
    link: "/industries/gym",
    color: "hover:border-emerald-500/50",
    badge: "فعال",
    hasLanding: true
  },
  {
    title: "مشاوره و روانشناسی",
    seoKeyword: "نرم افزار نوبت دهی روانشناس",
    desc: "مدیریت هوشمند جلسات مشاوره و روانشناسی. جلوگیری از تداخل جلسات و پیامک یادآوری خودکار.",
    icon: <Brain className="text-indigo-500" />,
    link: "/industries/consulting",
    color: "hover:border-indigo-500/50",
    badge: "فعال",
    hasLanding: true
  },
  {
    title: "رستوران و کافه",
    seoKeyword: "رزرو آنلاین میز",
    desc: "رزرو آنلاین میز و مدیریت ظرفیت سالن در روزهای شلوغ و ایام خاص برای رستوران‌ها و کافه‌ها.",
    icon: <UtensilsCrossed className="text-orange-500" />,
    link: "#",
    color: "",
    badge: "به‌زودی",
    hasLanding: false
  },
  {
    title: "لاین‌های تخصصی زیبایی",
    seoKeyword: "مدیریت نوبت ناخن",
    desc: "ویژه ناخن‌کاران، مژه‌کاران و خدمات تخصصی زیبایی با لینک اختصاصی رزرو و پیامک یادآوری.",
    icon: <Sparkles className="text-purple-500" />,
    link: "#",
    color: "",
    badge: "به‌زودی",
    hasLanding: false
  }
];

export default function IndustrySolutions() {
  return (
    <section id="industries" className="py-16 md:py-20 lg:py-24 bg-white overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* ۱. هدر بخش */}
        <div className="text-right mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-slate-900 leading-[1.3]">
            مدیریت هوشمند نوبت‌ها؛ <br />
            <span className="text-blue-600">ویژه متخصصین و صاحبان کسب‌وکار</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-3xl font-medium leading-relaxed">
            سامانه نوبت دهی آنتایم یک پنل مدیریت داخلی است. مشتری <strong>بدون نیاز به نصب هیچ اپلیکیشنی</strong>، تمام جزییات را از طریق پیامک و لینک اختصاصی دریافت می‌کند.
          </p>
        </div>

        {/* ۲. بخش ویژگی‌های کلیدی */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20 items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="p-5 md:p-6 lg:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 hover:bg-blue-50/50 transition-colors group">
              <MessageSquare className="text-blue-600 mb-3 md:mb-4 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="font-black text-slate-900 mb-1 md:mb-2 text-base md:text-lg">ارسال پیامک هوشمند</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-bold">تایید رزرو، یادآوری نوبت و اطلاع‌رسانی لغو به صورت خودکار.</p>
            </div>
            <div className="p-5 md:p-6 lg:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 hover:bg-blue-50/50 transition-colors group">
              <Smartphone className="text-blue-600 mb-3 md:mb-4 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="font-black text-slate-900 mb-1 md:mb-2 text-base md:text-lg">لینک اختصاصی رزرو</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-bold">صفحه اختصاصی کسب‌وکار شما برای نمایش جزئیات نوبت به مشتری.</p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 italic">چرا اپلیکیشن آنتایم؟</h3>
            <ul className="grid grid-cols-1 gap-3 md:gap-4">
              {[
                "تقویم حرفه‌ای برای مدیریت زمان‌بندی متخصصین",
                "تعریف نامحدود خدمات با قیمت و زمان متفاوت",
                "پروفایل کامل مشتری با تاریخچه دقیق مراجعات",
                "سیستم خودکار گزارش‌گیری روزانه و ماهانه",
                "پیامک یادآوری خودکار و کاهش ۸۰ درصدی کنسلی"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-2 md:gap-3 font-bold text-slate-700 text-xs sm:text-sm">
                  <div className="bg-emerald-100 p-0.5 md:p-1 rounded-full">
                    <Check className="text-emerald-800" size={12} />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ۳. گرید کارت‌های اصناف */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {industries.map((item, idx) => {
            const cardClasses = `group relative p-5 md:p-6 lg:p-8 bg-white rounded-2xl md:rounded-[2.5rem] border-2 border-slate-50 transition-all duration-500 shadow-sm flex flex-col items-start ${
              item.hasLanding 
                ? `hover:shadow-2xl hover:-translate-y-2 ${item.color} cursor-pointer` 
                : "cursor-default opacity-70"
            }`;

            const CardInner = (
              <>
                <div className={`absolute top-3 md:top-6 left-3 md:left-6 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black ${
                  item.hasLanding ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}>
                  {item.badge}
                </div>

                <div className="mb-4 md:mb-6 p-2 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>

                <h3 className="text-base md:text-lg lg:text-xl font-black mb-1 text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[9px] md:text-[10px] lg:text-[11px] text-blue-600 font-black mb-2 md:mb-3 opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                  {item.seoKeyword}
                </p>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium mb-3 md:mb-4">
                  {item.desc}
                </p>

                {item.hasLanding && (
                  <div className="mt-auto flex items-center gap-1 md:gap-2 text-blue-600 font-bold text-[10px] sm:text-xs">
                    <span>اطلاعات بیشتر</span>
                    <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                )}
              </>
            );

            return item.hasLanding ? (
              <Link href={item.link} key={idx} className={cardClasses}>
                {CardInner}
              </Link>
            ) : (
              <div key={idx} className={cardClasses}>
                {CardInner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}