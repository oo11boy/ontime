// app/industries/doctors/components/DoctorFeatures.tsx
"use client";

import { 
  CalendarDays, 
  Users, 
  UserPlus, 
  Clock, 
  MessageSquareText, 
  UserX,
  FileText,
  Stethoscope
} from "lucide-react";

const doctorFeatures = [
  {
    title: "مدیریت نوبت ویزیت پزشکان",
    desc: "نوبت ویزیت بیماران را در تقویم هوشمند ثبت کنید. امکان تفکیک نوبت بین چند پزشک در یک مطب.",
    seoDesc: "مدیریت نوبت ویزیت چند پزشک در یک مطب با سیستم آنتایم",
    icon: <CalendarDays size={32} />
  },
  {
    title: "تعریف شیفت کاری پزشکان و پرسنل",
    desc: "ساعت حضور پزشکان و پرسنل پذیرش را تعیین کنید تا تقویم مطب همیشه دقیق و بدون تداخل باشد.",
    seoDesc: "مدیریت شیفت کاری پزشکان و پرسنل مطب در سیستم نوبت دهی",
    icon: <Users size={32} />
  },
  {
    title: "پرونده الکترونیک بیماران",
    desc: "تاریخچه کامل ویزیت‌ها، نسخه‌ها و سوابق درمانی هر بیمار را در لحظه مشاهده کنید.",
    seoDesc: "ذخیره سوابق ویزیت و نسخه‌های بیماران در پرونده الکترونیک",
    icon: <FileText size={32} />
  },
  {
    title: "مدیریت تخصصی وقت‌دهی",
    desc: "برای هر پزشک زمان مشخص ویزیت (مثلاً ۱۵ دقیقه) تعریف کنید تا سیستم هنگام ثبت نوبت، فضای خالی را نشان دهد.",
    seoDesc: "تنظیم زمان دقیق ویزیت برای هر پزشک در نرم افزار نوبت دهی مطب",
    icon: <Clock size={32} />
  },
  {
    title: "پیامک یادآوری خودکار نوبت ویزیت",
    desc: "بدون نیاز به تماس منشی، سیستم چند ساعت قبل از ویزیت به بیمار پیامک یادآوری می‌فرستد.",
    seoDesc: "ارسال خودکار پیامک یادآوری نوبت ویزیت و کاهش ۸۰ درصدی کنسلی",
    icon: <MessageSquareText size={32} />
  },
  {
    title: "لیست سیاه بیماران بدقول",
    desc: "بیمارانی که نوبت ویزیت خود را بدون اطلاع قبلی کنسل می‌کنند بلاک کنید تا در مراجعات بعدی هشدار داده شود.",
    seoDesc: "مدیریت بیماران بدقول و کاهش لغو نوبت در مطب پزشکی",
    icon: <UserX size={32} />
  }
];

export default function DoctorFeatures() {
  return (
    <section id="features" className="py-24 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-black mb-6 text-slate-900 leading-[1.2]">
            امکانات <span className="text-blue-600">هوشمند</span>{" "}
            <span className="text-blue-600">نرم افزار نوبت دهی پزشکان</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            آنتایم تمام ابزارهای لازم برای <strong className="text-blue-600">نظم‌دهی به نوبت‌های ویزیت و مدیریت مطب</strong> شما را در یک پنل کاربری ساده فراهم کرده است.
            <br />
            <span className="text-sm text-slate-400 block mt-2">
              ★ مدیریت تخصصی نوبت ویزیت ★ پیامک یادآوری خودکار ★ لینک اختصاصی برای هر بیمار ★
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctorFeatures.map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="inline-flex p-4 rounded-2xl mb-8 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-xl font-black mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[15px] font-medium">
                {item.desc}
              </p>
              <p className="text-slate-400 text-xs mt-3 hidden md:block">
                {item.seoDesc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}