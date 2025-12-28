// components/BeautySalon/BeautySMS.tsx
import { MapPin, BellRing, Link2, MousePointerClick } from "lucide-react";

export default function BeautySMS() {
  return (
    <section id="sms" className="py-24 bg-pink-600 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-6">
            <BellRing size={14} />
            سیستم هوشمند مدیریتِ مشتری
          </div>
          <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight italic">
            کاهش تماس‌های <br />تکراری با لینکِ اختصاصی
          </h2>
          <p className="text-pink-100 text-lg mb-10 leading-relaxed font-medium">
            بعد از ثبت نوبت، یک لینک اختصاصی برای مشتری پیامک می‌شود. او می‌تواند بدون تماس با شما، نوبت خود را مشاهده کند، لوکیشن سالن را ببیند یا در صورت نیاز، <strong>یک بار نوبت خود را تغییر دهد یا لغو کند.</strong>
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/10 p-5 rounded-3xl border border-white/20 flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl"><Link2 size={24} /></div>
              <div>
                <p className="font-bold text-sm">پیامک حاوی لینک مدیریت</p>
                <p className="text-[10px] text-pink-200 mt-1 font-medium">مشاهده جزئیات توسط مشتری</p>
              </div>
            </div>
            <div className="bg-white/10 p-5 rounded-3xl border border-white/20 flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl"><MousePointerClick size={24} /></div>
              <div>
                <p className="font-bold text-sm">کنسلی و تغییر نوبت آنلاین</p>
                <p className="text-[10px] text-pink-200 mt-1 font-medium">بدون نیاز به تماس با آرایشگر</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          {/* حباب پیامک شبیه‌سازی شده */}
          <div className="bg-white text-slate-900 p-8 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative z-10 rotate-3 group hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto">
            <div className="flex items-center gap-4 mb-6 border-b pb-4 border-slate-100">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-black text-xl">A</div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">Message (OnTime)</p>
                <p className="font-black text-slate-800">تایید نوبت رزرو شده</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                خانم سارا رضایی عزیز، نوبت شما برای <span className="text-pink-600">رنگ مو</span> در سالن "آنتایم" تایید شد.
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[11px] text-slate-500 font-bold mb-2 flex items-center gap-1">
                  <Link2 size={12} className="text-pink-600" />
                  لینک مدیریت و مشاهده جزییات:
                </p>
                <p className="text-blue-600 font-black text-xs break-all underline">
                  ontimeapp.ir/c/xY7z9L
                </p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                * از طریق لینک بالا می‌توانید تا ۲۴ ساعت قبل، نوبت خود را تغییر دهید.
              </p>
            </div>
          </div>
          
          {/* المان‌های دکوری */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-yellow-400 rounded-full blur-[80px] opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full blur-[100px] opacity-20"></div>
        </div>
      </div>
    </section>
  );
}