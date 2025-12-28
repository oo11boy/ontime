// components/BeautySalon/BeautyComparison.tsx
import { Check, X, BookOpen, Smartphone, AlertCircle } from "lucide-react";

const comparisonData = [
  {
    title: "یادآوری به مشتری",
    oldWay: "تماس دستی و پیگیری تک‌تک نوبت‌ها که اغلب فراموش می‌شود.",
    newWay: "ارسال خودکار پیامک یادآوری هوشمند به همراه لینک مدیریت نوبت."
  },
  {
    title: "استعلام قیمت خدمات",
    oldWay: "پاسخگویی تکراری به سوال «قیمت چنده؟» در طول روز.",
    newWay: "نمایش منوی کامل قیمت‌ها به مشتری در لحظه ثبت نوبت."
  },
  {
    title: "تمرکز هنگام کار",
    oldWay: "قطع مداوم کار و شستن دست‌ها برای پاسخ به زنگ تلفن.",
    newWay: "رزرو کاملاً بی‌صدا؛ مشتری نوبتش را ثبت و لینک را دریافت می‌کند."
  },
  {
    title: "نوبت‌دهی در تعطیلات",
    oldWay: "از دست دادن مشتریانی که نیمه‌شب یا روز تعطیل قصد رزرو دارند.",
    newWay: "پذیرش و مدیریت نوبت‌ها به صورت ۲۴ ساعته و بدون توقف."
  },
  {
    title: "دسترسی به سوابق",
    oldWay: "جستجوی کلافه‌کننده لای صفحات دفتر برای پیدا کردن شماره یا ترکیب رنگ.",
    newWay: "آرشیو کامل سوابق و شماره تماس مشتریان همیشه در جیب شما."
  }
];

export default function BeautyComparison() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-[1.2]">
            خداحافظی با <span className="text-pink-600">دفترچه‌های کاغذی</span>
          </h2>
          <p className="text-slate-600 font-bold text-lg">
            تفاوت مدیریت سنتی با قدرت اپلیکیشن آنتایم
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
                  <span>با اپلیکیشن نوبت دهی آرایشگاه آنتایم</span>
                </div>
                <p className="text-white/90 text-sm font-bold leading-relaxed">{item.newWay}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-center gap-3 bg-white p-6 rounded-[2rem] border border-pink-100 max-w-2xl mx-auto shadow-sm">
          <div className="bg-pink-100 p-3 rounded-2xl text-pink-600">
            <AlertCircle size={24} />
          </div>
          <p className="text-slate-700 text-sm lg:text-base font-bold">
            آرایشگران حرفه‌ای با حذف دفترچه، ماهانه <span className="text-pink-600 text-lg">۲۰ ساعت</span> در وقت خود صرفه‌جویی می‌کنند.
          </p>
        </div>
      </div>
    </section>
  );
}