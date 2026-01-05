"use client";

import { 
  UserPlus, 
  CalendarDays, 
  MessageSquareText, 
  UserX, 
  Clock4, 
  Users 
} from "lucide-react";

const nailManagerFeatures = [
  {
    title: "ثبت سریع نوبت و ارسال پیامک",
    desc: "به محض اینکه مشتری تماس می‌گیرد، نوبت را در پنل ثبت کنید تا بلافاصله پیامک تایید رزرو برای او ارسال شود.",
    icon: <CalendarDays size={32} />
  },
  {
    title: "تعریف شیفت کاری و پرسنل",
    desc: "ساعت حضور خود و پرسنل کمکی را تعیین کنید تا تقویم کاری‌تان همیشه دقیق و بدون تداخل باشد.",
    icon: <Users size={32} />
  },
  {
    title: "پروفایل هوشمند مشتریان",
    desc: "تاریخچه کامل خدمات (ترمیم، کاشت، طراحی) و تعداد نوبت‌های کنسل شده هر مشتری را در لحظه مشاهده کنید.",
    icon: <UserPlus size={32} />
  },
  {
    title: "مدیریت خدمات و تایم‌بندی",
    desc: "برای هر خدمت تایم مشخص (مثلاً ۲ ساعت برای ترمیم) تعریف کنید تا سیستم هنگام ثبت نوبت، فضای خالی را به شما نشان دهد.",
    icon: <Clock4 size={32} />
  },
  {
    title: "سیستم خودکار یادآوری",
    desc: "بدون نیاز به تماس شما، سیستم چند ساعت قبل از نوبت به مشتری پیامک یادآوری می‌فرستد تا تایم شما خالی نماند.",
    icon: <MessageSquareText size={32} />
  },
  {
    title: "لیست سیاه و مدیریت بدقول‌ها",
    desc: "مشتریانی که نوبت خود را بدون اطلاع قبلی کنسل می‌کنند بلاک کنید تا در مراجعات بعدی به شما هشدار داده شود.",
    icon: <UserX size={32} />
  }
];

export default function NailManagerFeatures() {
  return (
    <section id="features" className="py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-slate-900 leading-[1.2]">
            دفتر نوبت‌دهی را <span className="text-rose-500">بازنشسته</span> کنید
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            آنتایم یک پنل مدیریتی قدرتمند برای ناخن‌کاران است تا تمام امور سالن را از **ثبت نوبت تا مدیریت پرسنل**، به تنهایی رهبری کنند.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nailManagerFeatures.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-[2.5rem] border border-rose-50 shadow-sm hover:shadow-2xl hover:shadow-rose-100/40 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="inline-flex p-4 rounded-2xl mb-8 bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-black mb-4 text-slate-900 group-hover:text-rose-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[15px] font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}