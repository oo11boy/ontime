// components/BeautySalon/BeautySteps.tsx
import { UserPlus, Settings, CalendarCheck } from "lucide-react";

const steps = [
  { 
    title: "ثبت‌نام سریع", 
    desc: "با شماره موبایل خود وارد شوید و در کمتر از ۱ دقیقه پنل مدیریت خود را فعال کنید.", 
    icon: <UserPlus size={32} /> 
  },
  { 
    title: "تعریف خدمات و قیمت", 
    desc: "لیست خدماتی که ارائه می‌دهید را به همراه قیمت و مدت زمان هر کدام وارد کنید.", 
    icon: <Settings size={32} /> 
  },
  { 
    title: "ثبت نوبت و تمام!", 
    desc: "نوبت مشتری را ثبت کنید؛ لینک اختصاصی مدیریت نوبت فوراً برای مشتری پیامک می‌شود.", 
    icon: <CalendarCheck size={32} /> 
  }
];

export default function BeautySteps() {
  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* دکوراسیون پس‌زمینه برای عمق دادن به صفحه */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-pink-600 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-black mb-6">شروع کار با آنتایم چقدر ساده است؟</h2>
          <p className="text-slate-400 font-medium">بدون پیچیدگی، مدیریت سالن خود را از همین امروز شروع کنید</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
          {steps.map((step, i) => (
            <div key={i} className="group text-center relative z-10">
              {/* عدد مرحله */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-pink-500 text-xs font-black px-3 py-1 rounded-full border border-slate-700 mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                مرحله {i + 1}
              </div>
              
              <div className="w-24 h-24 bg-slate-900 border-2 border-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:border-pink-500/50 group-hover:shadow-pink-500/10 transition-all duration-500">
                <div className="text-pink-500 group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
              </div>
              
              <h3 className="text-2xl font-black mb-4 group-hover:text-pink-400 transition-colors">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium px-4">
                {step.desc}
              </p>
            </div>
          ))}

          {/* خط پیوند دهنده متحرک در دسکتاپ */}
          <div className="hidden md:block absolute top-1/3 left-[20%] right-[20%] h-[2px] bg-linear-to-r from-transparent via-slate-800 to-transparent -z-0"></div>
        </div>
      </div>
    </section>
  );
}