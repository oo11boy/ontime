import { 
  Scissors, Stethoscope, Dumbbell, UtensilsCrossed, 
  CalendarCheck, Sparkles, Check, ChevronLeft,
  MessageSquare, Smartphone
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
    badge: "ویژه",
    hasLanding: true // فقط این مورد لندینگ دارد
  },
  {
    title: "کاشت و خدمات ناخن",
    seoKeyword: "نوبت دهی ناخن",
    desc: "نظم‌دهی به نوبت‌های ترمیم و کاهش کنسلی با سیستم یادآوری هوشمند ویژه ناخن‌کاران حرفه‌ای.",
    icon: <Sparkles className="text-rose-500" />, // تغییر آیکون به درخشش (نماد لاک و زیبایی)
    link: "/industries/nail-artist",
    color: "hover:border-rose-500/50",
    badge: "تخصصی",
    hasLanding: true 
  },
  {
    title: "پزشکان و کلینیک‌ها",
    seoKeyword: "مدیریت نوبت مطب",
    desc: "نظم بخشیدن به صف انتظار بیماران و ارسال خودکار اطلاعات نوبت بلافاصله پس از ثبت.",
    icon: <Stethoscope className="text-blue-500" />,
    link: "#",
    color: "",
    badge: "به‌زودی",
    hasLanding: false
  },
  {
    title: "مشاوره و روانشناسی",
    seoKeyword: "رزرو وقت مشاوره",
    desc: "جلوگیری از تداخل جلسات و مدیریت زمان‌های خالی بدون نیاز به دفترچه کاغذی.",
    icon: <CalendarCheck className="text-indigo-500" />,
    link: "#",
    color: "",
    badge: "به‌زودی",
    hasLanding: false
  },
  {
    title: "باشگاه‌های ورزشی",
    seoKeyword: "رزرو کلاس ورزشی",
    desc: "رزرو کلاس‌های گروهی و مدیریت ظرفیت سالن‌های ورزشی و بدنسازی.",
    icon: <Dumbbell className="text-emerald-500" />,
    link: "#",
    color: "",
    badge: "به‌زودی",
    hasLanding: false
  },
  {
    title: "رستوران و کافه",
    seoKeyword: "رزرو آنلاین میز",
    desc: "رزرو آنلاین میز و مدیریت ظرفیت سالن در روزهای شلوغ و ایام خاص.",
    icon: <UtensilsCrossed className="text-orange-500" />,
    link: "#",
    color: "",
    badge: "به‌زودی",
    hasLanding: false
  },
  {
    title: "لاین‌های تخصصی زیبایی",
    seoKeyword: "مدیریت نوبت ناخن",
    desc: "ویژه ناخن‌کاران، مژه‌کاران و خدمات تخصصی با لینک اختصاصی رزرو.",
    icon: <Sparkles className="text-purple-500" />,
    link: "#",
    color: "",
    badge: "به‌زودی",
    hasLanding: false
  }
];

export default function IndustrySolutions() {
  return (
    <section id="industries" className="py-24 bg-white overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ۱. هدر بخش */}
        <div className="text-right mb-16">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-[1.3]">
            مدیریت هوشمند نوبت‌ها؛ <br />
            <span className="text-blue-600">ویژه متخصصین و صاحبان کسب‌وکار</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-3xl font-medium leading-relaxed">
            سامانه نوبت دهی آنتایم یک پنل مدیریت داخلی است. مشتری <strong>بدون نیاز به نصب هیچ اپلیکیشنی</strong>، تمام جزییات را از طریق پیامک و لینک اختصاصی دریافت می‌کند.
          </p>
        </div>

        {/* ۲. بخش ویژگی‌های کلیدی */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-blue-50/50 transition-colors group">
              <MessageSquare className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-black text-slate-900 mb-2 text-lg">ارسال پیامک هوشمند</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">تایید رزرو، یادآوری نوبت و اطلاع‌رسانی لغو به صورت خودکار.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-blue-50/50 transition-colors group">
              <Smartphone className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-black text-slate-900 mb-2 text-lg">لینک اختصاصی رزرو</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">صفحه اختصاصی کسب‌وکار شما برای نمایش جزئیات نوبت به مشتری.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 italic">چرا اپلیکیشن آنتایم؟</h3>
            <ul className="grid sm:grid-cols-1 gap-4">
              {[
                "تقویم حرفه‌ای برای مدیریت زمان‌بندی متخصصین",
                "تعریف نامحدود خدمات با قیمت و زمان متفاوت",
                "پروفایل کامل مشتری با تاریخچه دقیق مراجعات",
                "سیستم خودکار گزارش‌گیری روزانه و ماهانه"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                  <div className="bg-emerald-100 p-1 rounded-full"><Check className="text-emerald-800" size={14} /></div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ۳. گرید کارت‌های اصناف */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((item, idx) => {
            const cardClasses = `group relative p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 transition-all duration-500 shadow-sm flex flex-col items-start ${
              item.hasLanding 
                ? `hover:shadow-2xl hover:-translate-y-2 ${item.color} cursor-pointer` 
                : "cursor-default"
            }`;

            const CardInner = (
              <>
                <div className={`absolute top-6 left-6 px-3 py-1 rounded-full text-[10px] font-black ${
                  item.hasLanding ? "bg-pink-100 text-pink-600" : "bg-slate-100 text-slate-400"
                }`}>
                  {item.badge}
                </div>

                <div className="mb-6 p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>

                <h3 className="text-xl font-black mb-1 text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-blue-600 font-black mb-3 opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                  {item.seoKeyword}
                </p>
                <p className="text-slate-500 text-sm leading-relaxed font-medium mb-4">
                  {item.desc}
                </p>

                {item.hasLanding && (
                  <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <span>اطلاعات بیشتر</span>
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
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