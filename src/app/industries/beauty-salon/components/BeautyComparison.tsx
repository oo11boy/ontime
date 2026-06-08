// components/BeautySalon/BeautyComparison.tsx
import { Check, X, BookOpen, Smartphone, AlertCircle, Clock, TrendingUp } from "lucide-react";

const comparisonData = [
  {
    title: "یادآوری به مشتری",
    oldWay: "تماس دستی و پیگیری تک‌تک نوبت‌ها که اغلب فراموش می‌شود.",
    newWay: "ارسال خودکار پیامک یادآوری هوشمند به همراه لینک مدیریت نوبت.",
    seoKeyword: "پیامک یادآوری خودکار نوبت"
  },
  {
    title: "استعلام قیمت خدمات",
    oldWay: "پاسخگویی تکراری به سوال «قیمت چنده؟» در طول روز.",
    newWay: "نمایش منوی کامل قیمت‌ها به مشتری در لحظه ثبت نوبت.",
    seoKeyword: "نمایش آنلاین قیمت خدمات آرایشگاه"
  },
  {
    title: "تمرکز هنگام کار",
    oldWay: "قطع مداوم کار و شستن دست‌ها برای پاسخ به زنگ تلفن.",
    newWay: "رزرو کاملاً بی‌صدا؛ مشتری نوبتش را ثبت و لینک را دریافت می‌کند.",
    seoKeyword: "رزرو آنلاین بدون تماس تلفنی"
  },
  {
    title: "نوبت‌دهی در تعطیلات",
    oldWay: "از دست دادن مشتریانی که نیمه‌شب یا روز تعطیل قصد رزرو دارند.",
    newWay: "پذیرش و مدیریت نوبت‌ها به صورت ۲۴ ساعته و بدون توقف.",
    seoKeyword: "نوبت دهی ۲۴ ساعته آنلاین"
  },
  {
    title: "دسترسی به سوابق",
    oldWay: "جستجوی کلافه‌کننده لای صفحات دفتر برای پیدا کردن شماره یا ترکیب رنگ.",
    newWay: "آرشیو کامل سوابق و شماره تماس مشتریان همیشه در جیب شما.",
    seoKeyword: "مدیریت سوابق و تاریخچه مشتریان"
  }
];

export default function BeautyComparison() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          {/* H2 بهینه شده برای سئو */}
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-[1.2]">
            خداحافظی با <span className="text-pink-600">دفترچه‌های کاغذی</span>
            <br />
            <span className="text-2xl lg:text-3xl text-slate-700 mt-2 block">
              با <span className="text-pink-600">نرم افزار نوبت دهی آرایشگاه آنتایم</span>
            </span>
          </h2>
          <p className="text-slate-600 font-bold text-lg max-w-2xl mx-auto">
            مقایسه مدیریت سنتی با <strong className="text-pink-600">سیستم هوشمند نوبت دهی آنلاین</strong>؛ تفاوت در نظم، درآمد و رضایت مشتری
          </p>
          {/* کلمات کلیدی مخفی برای سئو */}
          <p className="text-slate-400 text-xs mt-4 hidden md:block">
            ★ کاهش ۸۰ درصدی کنسلی ★ افزایش رضایت مشتری ★ صرفه‌جویی ۲۰ ساعته در ماه ★
          </p>
        </div>

        <div className="space-y-6">
          {comparisonData.map((item, index) => (
            <div key={index} className="grid md:grid-cols-11 gap-4 items-center">
              {/* وضعیت قدیمی */}
              <div className="md:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-200 opacity-70 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-3 mb-3 text-red-500 font-black">
                  <X size={20} />
                  <span>روش سنتی (دفترچه)</span>
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
              <div className="md:col-span-5 bg-pink-600 p-6 rounded-[2rem] shadow-xl shadow-pink-200">
                <div className="flex items-center gap-3 mb-3 text-white font-black">
                  <Check size={20} className="bg-white/20 rounded-full p-0.5" />
                  <span>با نرم افزار نوبت دهی آرایشگاه آنتایم</span>
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

        <div className="mt-16 flex items-center justify-center gap-3 bg-white p-6 rounded-[2rem] border border-pink-100 max-w-2xl mx-auto shadow-sm">
          <div className="bg-pink-100 p-3 rounded-2xl text-pink-600">
            <Clock size={24} />
          </div>
          <p className="text-slate-700 text-sm lg:text-base font-bold">
            آرایشگران حرفه‌ای با حذف دفترچه و استفاده از <span className="text-pink-600">سیستم نوبت دهی آنلاین</span>، ماهانه <span className="text-pink-600 text-lg">۲۰ ساعت</span> در وقت خود صرفه‌جویی می‌کنند.
          </p>
        </div>

        {/* بیلبورد اعتماد اجتماعی */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-bold">
            ★ بیش از ۱,۲۰۰ سالن زیبایی فعال ★ ۵۵,۰۰۰ نوبت ثبت شده ★ ۱۸۰,۰۰۰ پیامک یادآوری موفق ★
          </p>
        </div>
      </div>
    </section>
  );
}