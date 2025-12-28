// components/Home/IndustrySelector.tsx
import { 
  Sparkles, 
  Stethoscope, 
  Scissors, 
  CalendarCheck, 
  Dumbbell, 
  UtensilsCrossed 
} from "lucide-react";
import Link from "next/link";

const industries = [
  {
    title: "آرایشگاه و سالن زیبایی",
    desc: "مدیریت هوشمند نوبت‌ها، پیامک یادآوری و پرونده مشتریان ویژه آرایشگران حرفه‌ای.",
    icon: <Scissors className="text-pink-500" />,
    link: "/industries/beauty-salon",
    color: "hover:border-pink-500/50",
    badge: "ویژه",
    disabled: false
  },
  {
    title: "پزشکان و کلینیک‌ها",
    desc: "نوبت‌دهی آنلاین، مدیریت پرونده سلامت و کاهش کنسلی‌ها با سیستم یادآوری هوشمند.",
    icon: <Stethoscope className="text-blue-500" />,
    link: "#",
    color: "hover:border-blue-500/50",
    badge: "به‌زودی",
    disabled: true
  },
  {
    title: "باشگاه‌های ورزشی",
    desc: "رزرو کلاس‌های گروهی و مدیریت ظرفیت سالن‌های ورزشی و بدنسازی.",
    icon: <Dumbbell className="text-emerald-500" />,
    link: "#",
    color: "hover:border-emerald-500/50",
    badge: "به‌زودی",
    disabled: true
  },
  {
    title: "مشاوره و روانشناسی",
    desc: "زمان‌بندی دقیق جلسات مشاوره و مدیریت امن اطلاعات مراجعین.",
    icon: <CalendarCheck className="text-indigo-500" />,
    link: "#",
    color: "hover:border-indigo-500/50",
    badge: "به‌زودی",
    disabled: true
  },
  {
    title: "رستوران و کافه",
    desc: "رزرو آنلاین میز و مدیریت ظرفیت سالن در روزهای شلوغ و ایام خاص.",
    icon: <UtensilsCrossed className="text-orange-500" />,
    link: "#",
    color: "hover:border-orange-500/50",
    badge: "به‌زودی",
    disabled: true
  },
  {
    title: "لاین‌های تخصصی زیبایی",
    desc: "ویژه ناخن‌کاران، مژه‌کاران و خدمات تخصصی با لینک اختصاصی رزرو.",
    icon: <Sparkles className="text-purple-500" />,
    link: "#",
    color: "hover:border-purple-500/50",
    badge: "به‌زودی",
    disabled: true
  }
];

export default function IndustrySelector() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900">
            راه‌کار تخصصی برای <span className="text-blue-600">صنف شما</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            آنتایم فقط یک ابزار رزرو نیست؛ ما برای هر کسب‌وکار، پنل اختصاصی با نیازهای همان صنف را طراحی کرده‌ایم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((item, idx) => (
            <Link
              href={item.link}
              key={idx}
              className={`group relative p-8 bg-white rounded-[2.5rem] border-2 border-transparent transition-all duration-500 shadow-sm flex flex-col items-start text-right ${
                item.disabled 
                  ? "opacity-60 cursor-not-allowed" 
                  : `hover:shadow-2xl hover:-translate-y-2 ${item.color} cursor-pointer`
              }`}
            >
              {/* نشان (Badge) */}
              <div className={`absolute top-6 left-6 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${
                item.disabled ? "bg-slate-100 text-slate-400" : "bg-pink-100 text-pink-600"
              }`}>
                {item.badge}
              </div>

              {/* آیکون */}
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>

              {/* متن */}
              <h3 className="text-xl font-black mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {item.desc}
              </p>

              {/* فلش راهنما (فقط برای موارد فعال) */}
              {!item.disabled && (
                <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span>مشاهده جزئیات</span>
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center group-hover:translate-x-[-4px] transition-transform">
                    <ChevronLeft size={14} />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// برای آیکون فلش آخر:
function ChevronLeft({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}