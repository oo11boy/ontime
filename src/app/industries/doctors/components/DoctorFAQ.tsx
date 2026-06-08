// app/industries/doctors/components/DoctorFAQ.tsx
"use client";
import { ChevronDown, HelpCircle, MessageCircleQuestion, BellRing, Link2 } from "lucide-react";
import Script from "next/script";

const doctorFaqs = [
  {
    q: "آیا نرم افزار نوبت دهی پزشکان آنتایم برای مطب‌های چند پزشک مناسب است؟",
    a: "بله، کاملاً! آنتایم امکان تعریف چندین پزشک با تخصص‌های مختلف را دارد. شما می‌توانید برای هر پزشک شیفت کاری جداگانه، زمان ویزیت اختصاصی و حتی لیست خدمات متفاوت تعریف کنید. تمام نوبت‌ها در یک تقویم یکپارچه نمایش داده می‌شوند. ضمناً ۲ هفته اول رایگان است.",
    seoKeywords: "نرم افزار نوبت دهی مطب چند پزشک"
  },
  {
    q: "پیامک یادآوری نوبت ویزیت چگونه به بیمار ارسال می‌شود؟",
    a: "به محض اینکه شما نوبت ویزیت را در تقویم آنتایم ثبت کنید، سیستم به صورت خودکار ۲۴ ساعت قبل از موعد، پیامکی حاوی زمان دقیق ویزیت، نام پزشک و آدرس مطب برای بیمار ارسال می‌کند. همچنین یک لینک اختصاصی برای مدیریت نوبت (تغییر یا لغو) در پیامک قرار می‌گیرد. این کار احتمال فراموشی نوبت توسط بیمار را تا ۸۰ درصد کاهش می‌دهد.",
    seoKeywords: "سیستم پیامک یادآوری نوبت ویزیت بیماران"
  },
  {
    q: "امکان مسدود کردن بیماران بدقول در سیستم نوبت دهی مطب وجود دارد؟",
    a: "بله، در پنل آنتایم، شما به سوابق کامل هر بیمار دسترسی دارید. اگر بیماری نوبت‌های قبلی ویزیت را بدون هماهنگی لغو کرده باشد یا غیبت داشته باشد، سیستم در مراجعات بعدی به شما هشدار می‌دهد (لیست سیاه). می‌توانید این بیماران را از رزرو نوبت آنلاین محدود کنید تا وقت مطب برای بیماران متعهد حفظ شود.",
    seoKeywords: "مدیریت بیماران بدقول مطب پزشکی"
  },
  {
    q: "چطور می‌توانم زمان‌های متفاوتی برای ویزیت پزشکان مختلف تعریف کنم؟",
    a: "در بخش تنظیمات خدمات نرم افزار نوبت دهی پزشکان، شما می‌توانید برای هر پزشک زمان ویزیت اختصاصی تعریف کنید (مثلاً متخصص قلب ۲۰ دقیقه، متخصص پوست ۱۵ دقیقه، پزشک عمومی ۱۰ دقیقه). هنگام ثبت نوبت، سیستم به طور هوشمند بازه زمانی مورد نظر را در تقویم مطب رزرو می‌کند و تداخلی با نوبت‌های دیگر پزشکان ایجاد نمی‌شود.",
    seoKeywords: "تنظیم زمان ویزیت پزشکان در سیستم نوبت دهی مطب"
  },
  {
    q: "آیا برای استفاده از نرم افزار نوبت دهی مطب نیاز به نصب اپلیکیشن دارم؟",
    a: "خیر، پزشکان و منشی‌های مطب با شماره موبایل خود از طریق مرورگر وارد پنل مدیریت می‌شوند. بیماران شما نیز نیازی به نصب هیچ برنامه‌ای ندارند. تمام ارتباطات از طریق پیامک انجام می‌شود و لینک اختصاصی مدیریت نوبت در مرورگر گوشی بیمار باز می‌شود تا کار برای آن‌ها تا حد ممکن ساده باشد.",
    seoKeywords: "نرم افزار نوبت دهی مطب بدون نیاز به نصب"
  }
];

export default function DoctorFAQ() {
  // بهینه‌سازی اسکیما برای سئو گوگل
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": doctorFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <section id="faq" className="py-24 bg-white" dir="rtl">
      <Script id="doctor-faq-schema" type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </Script>

      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-6 shadow-inner">
            <HelpCircle size={32} />
          </div>
          {/* H2 بهینه شده برای سئو */}
          <h2 className="text-3xl lg:text-5xl font-black text-center text-slate-900 leading-tight">
            پاسخ به سوالات <span className="text-blue-600">پزشکان درباره نرم افزار نوبت دهی مطب</span>
          </h2>
          <p className="text-slate-500 text-sm mt-4 text-center max-w-2xl">
            سوالات متداول درباره <strong className="text-blue-600">سیستم نوبت دهی تخصصی مطب پزشکان و مدیریت نوبت ویزیت</strong>
          </p>
        </div>

        <div className="space-y-4">
          {doctorFaqs.map((faq, i) => (
            <details 
              key={i} 
              className="group bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 open:bg-white open:shadow-2xl open:shadow-blue-100/20 transition-all duration-500"
            >
              <summary className="font-black flex justify-between items-center cursor-pointer list-none text-slate-800 lg:text-xl">
                {faq.q}
                <div className="bg-blue-100 p-1 rounded-full group-open:rotate-180 transition-transform duration-500">
                  <ChevronDown className="text-blue-600 w-5 h-5" />
                </div>
              </summary>
              <div className="overflow-hidden transition-all duration-500">
                <p className="mt-6 text-slate-600 text-sm lg:text-base leading-relaxed font-medium border-t border-blue-50 pt-6">
                  {faq.a}
                </p>
                {/* کلمات کلیدی مخفی برای سئو */}
                <p className="text-slate-400 text-[10px] mt-3 hidden md:block">
                  ★ {faq.seoKeywords} ★
                </p>
              </div>
            </details>
          ))}
        </div>

        {/* سوال اضافی برای کسانی که هنوز قانع نشده‌اند */}
        <div className="mt-12 text-center p-6 bg-blue-50 rounded-3xl border border-blue-100">
          <p className="text-slate-700 font-bold">
            سوال دیگری دارید؟ <span className="text-blue-600">۲ هفته رایگان</span> را امتحان کنید و با پشتیبانی آنتایم در تماس باشید.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            ★ بیش از ۴۵۰ مطب و کلینیک به آنتایم اعتماد کرده‌اند ★
          </p>
        </div>
      </div>
    </section>
  );
}