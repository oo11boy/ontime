// app/industries/gym/components/GymFAQ.tsx
"use client";
import { ChevronDown, HelpCircle, MessageCircleQuestion, BellRing, Link2, Dumbbell } from "lucide-react";
import Script from "next/script";

const gymFaqs = [
  {
    q: "آیا نرم افزار نوبت دهی باشگاه آنتایم برای باشگاه‌های چند رشته ورزشی مناسب است؟",
    a: "بله، کاملاً! آنتایم امکان تعریف چندین رشته ورزشی (بدنسازی، یوگا، کراس فیت، ایروبیک و ...) با مربیان مختلف را دارد. شما می‌توانید برای هر کلاس زمان جداگانه و مربی اختصاصی تعریف کنید. تمام نوبت‌ها در یک تقویم یکپارچه نمایش داده می‌شوند. ضمناً ۲ هفته اول رایگان است.",
    seoKeywords: "نرم افزار نوبت دهی باشگاه چند رشته ورزشی"
  },
  {
    q: "پیامک یادآوری جلسه تمرینی چگونه به عضو ارسال می‌شود؟",
    a: "به محض اینکه شما نوبت کلاس را در تقویم آنتایم ثبت کنید، سیستم به صورت خودکار ۲۴ ساعت قبل از موعد، پیامکی حاوی زمان دقیق کلاس، نام مربی و آدرس باشگاه برای عضو ارسال می‌کند. همچنین یک لینک اختصاصی برای مدیریت نوبت (تغییر یا لغو) در پیامک قرار می‌گیرد. این کار احتمال فراموشی نوبت توسط عضو را تا ۸۰ درصد کاهش می‌دهد.",
    seoKeywords: "سیستم پیامک یادآوری جلسات تمرینی باشگاه"
  },
  {
    q: "امکان مسدود کردن اعضای بدقول در سیستم نوبت دهی باشگاه وجود دارد؟",
    a: "بله، در پنل آنتایم، شما به سوابق کامل هر عضو دسترسی دارید. اگر عضوی نوبت‌های قبلی کلاس را بدون هماهنگی لغو کرده باشد یا غیبت داشته باشد، سیستم در مراجعات بعدی به شما هشدار می‌دهد (لیست سیاه). می‌توانید این اعضا را از رزرو نوبت آنلاین محدود کنید تا وقت باشگاه برای اعضای متعهد حفظ شود.",
    seoKeywords: "مدیریت اعضای بدقول باشگاه ورزشی"
  },
  {
    q: "چطور می‌توانم زمان‌های متفاوتی برای کلاس‌های مختلف تعریف کنم؟",
    a: "در بخش تنظیمات خدمات نرم افزار نوبت دهی باشگاه، شما می‌توانید برای هر کلاس زمان اختصاصی تعریف کنید (مثلاً بدنسازی ۶۰ دقیقه، یوگا ۹۰ دقیقه، کراس فیت ۴۵ دقیقه). هنگام ثبت نوبت، سیستم به طور هوشمند بازه زمانی مورد نظر را در تقویم باشگاه رزرو می‌کند و تداخلی با نوبت‌های دیگر کلاس‌ها ایجاد نمی‌شود.",
    seoKeywords: "تنظیم زمان کلاس‌های ورزشی در سیستم نوبت دهی باشگاه"
  },
  {
    q: "آیا برای استفاده از نرم افزار نوبت دهی باشگاه نیاز به نصب اپلیکیشن دارم؟",
    a: "خیر، مدیران باشگاه و مربیان با شماره موبایل خود از طریق مرورگر وارد پنل مدیریت می‌شوند. اعضای باشگاه شما نیز نیازی به نصب هیچ برنامه‌ای ندارند. تمام ارتباطات از طریق پیامک انجام می‌شود و لینک اختصاصی مدیریت نوبت در مرورگر گوشی عضو باز می‌شود تا کار برای آن‌ها تا حد ممکن ساده باشد.",
    seoKeywords: "نرم افزار نوبت دهی باشگاه بدون نیاز به نصب"
  }
];

export default function GymFAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": gymFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <section id="faq" className="py-16 md:py-20 lg:py-24 bg-white" dir="rtl">
      <Script id="gym-faq-schema" type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </Script>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-emerald-600 mb-4 md:mb-6 shadow-inner">
            <HelpCircle size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center text-slate-900 leading-tight">
            پاسخ به سوالات <span className="text-emerald-600">مدیران باشگاه درباره نرم افزار نوبت دهی ورزشی</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-3 md:mt-4 text-center max-w-2xl">
            سوالات متداول درباره <strong className="text-emerald-600">سیستم نوبت دهی تخصصی باشگاه بدنسازی و مدیریت کلاس‌های ورزشی</strong>
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {gymFaqs.map((faq, i) => (
            <details 
              key={i} 
              className="group bg-slate-50 rounded-2xl md:rounded-[2.5rem] p-5 md:p-6 lg:p-8 border border-slate-100 open:bg-white open:shadow-2xl open:shadow-emerald-100/20 transition-all duration-500"
            >
              <summary className="font-black flex justify-between items-center cursor-pointer list-none text-slate-800 text-sm sm:text-base md:text-lg lg:text-xl">
                {faq.q}
                <div className="bg-emerald-100 p-1 rounded-full group-open:rotate-180 transition-transform duration-500 shrink-0 mr-2">
                  <ChevronDown className="text-emerald-600 w-4 h-4 md:w-5 md:h-5" />
                </div>
              </summary>
              <div className="overflow-hidden transition-all duration-500">
                <p className="mt-4 md:mt-6 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-medium border-t border-emerald-50 pt-4 md:pt-6">
                  {faq.a}
                </p>
                <p className="text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] mt-2 md:mt-3 hidden md:block">
                  ★ {faq.seoKeywords} ★
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-8 md:mt-12 text-center p-4 md:p-6 bg-emerald-50 rounded-2xl md:rounded-3xl border border-emerald-100">
          <p className="text-slate-700 font-bold text-sm sm:text-base">
            سوال دیگری دارید؟ <span className="text-emerald-600">۲ هفته رایگان</span> را امتحان کنید و با پشتیبانی آنتایم در تماس باشید.
          </p>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 mt-2">
            ★ بیش از ۳۲۰ باشگاه ورزشی به آنتایم اعتماد کرده‌اند ★
          </p>
        </div>
      </div>
    </section>
  );
}