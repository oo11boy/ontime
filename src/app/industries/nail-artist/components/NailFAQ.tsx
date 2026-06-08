"use client";
import { ChevronDown, HelpCircle, MessageCircleQuestion, BellRing, Link2 } from "lucide-react";
import Script from "next/script";

const nailFaqs = [
  {
    q: "آیا نرم افزار نوبت دهی ناخن کار آنتایم برای ناخن‌کاران مستقل مناسب است؟",
    a: "بله، دقیقاً! آنتایم برای ناخن‌کارانی طراحی شده که می‌خواهند بدون درگیری با منشی یا دفترچه‌های کاغذی، نوبت‌های کاشت و ترمیم خود را مدیریت کنند. شما با گوشی خود نوبت را ثبت می‌کنید و باقی کارها (ارسال پیامک و یادآوری) به عهده سیستم است. ضمناً ۲ هفته اول رایگان است.",
    seoKeywords: "نرم افزار نوبت دهی ناخن کار برای ناخن‌کاران مستقل"
  },
  {
    q: "پیامک یادآوری نوبت ترمیم ناخن چگونه به مشتری ارسال می‌شود؟",
    a: "به محض اینکه شما نوبت کاشت یا ترمیم را در تقویم آنتایم ثبت کنید، سیستم به صورت خودکار ۲۴ ساعت قبل از موعد، پیامکی حاوی زمان دقیق، نوع خدمت (کاشت، ترمیم، ژلیش) و آدرس سالن برای مشتری ارسال می‌کند. این کار احتمال فراموشی نوبت توسط مشتری را تا ۸۰ درصد کاهش می‌دهد.",
    seoKeywords: "سیستم پیامک یادآوری نوبت ترمیم ناخن"
  },
  {
    q: "امکان مسدود کردن مشتریان بدقول در سیستم نوبت دهی کاشت ناخن وجود دارد؟",
    a: "بله، در پنل آنتایم، شما به سوابق کامل هر مشتری دسترسی دارید. اگر مشتری نوبت‌های قبلی کاشت یا ترمیم را بدون هماهنگی لغو کرده باشد، سیستم در مراجعات بعدی به شما هشدار می‌دهد (لیست سیاه) تا وقت خود را برای مشتریان غیرمتعهد هدر ندهید. این ویژگی مخصوص سالن‌های شلوغ کاشت ناخن است.",
    seoKeywords: "مدیریت مشتریان بدقول سالن کاشت ناخن"
  },
  {
    q: "چطور می‌توانم زمان‌های متفاوتی برای کاشت، ترمیم و ژلیش تعریف کنم؟",
    a: "در بخش تنظیمات خدمات نرم افزار نوبت دهی ناخن کار، شما می‌توانید برای هر خدمت (مثلاً کاشت پودر ۱۸۰ دقیقه، ترمیم ۹۰ دقیقه و ژلیش ۴۵ دقیقه) زمان اختصاصی تعریف کنید. هنگام ثبت نوبت، سیستم به طور هوشمند بازه زمانی مورد نظر را در تقویم شما رزرو می‌کند و تداخلی با نوبت‌های دیگر ایجاد نمی‌شود.",
    seoKeywords: "تنظیم زمان کاشت ناخن، ترمیم و ژلیش در سیستم نوبت دهی"
  },
  {
    q: "آیا برای استفاده از نرم افزار نوبت دهی ناخن کار نیاز به نصب اپلیکیشن دارم؟",
    a: "خیر، ناخن‌کاران با شماره موبایل خود از طریق مرورگر وارد پنل مدیریت می‌شوند. مشتریان شما نیز نیازی به نصب هیچ برنامه‌ای ندارند. تمام ارتباطات از طریق پیامک انجام می‌شود و لینک اختصاصی مدیریت نوبت در مرورگر گوشی مشتری باز می‌شود تا کار برای آن‌ها تا حد ممکن ساده باشد.",
    seoKeywords: "نرم افزار نوبت دهی ناخن کار بدون نیاز به نصب"
  }
];

export default function NailFAQ() {
  // بهینه‌سازی اسکیما برای سئو گوگل
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": nailFaqs.map((faq) => ({
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
      <Script id="nail-faq-schema" type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </Script>

      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <div className="w-16 h-16 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-600 mb-6 shadow-inner">
            <HelpCircle size={32} />
          </div>
          {/* H2 بهینه شده برای سئو */}
          <h2 className="text-3xl lg:text-5xl font-black text-center text-slate-900 leading-tight">
            پاسخ به سوالات <span className="text-rose-600">ناخن‌کاران درباره نرم افزار نوبت دهی کاشت ناخن</span>
          </h2>
          <p className="text-slate-500 text-sm mt-4 text-center max-w-2xl">
            سوالات متداول درباره <strong className="text-rose-600">سیستم نوبت دهی تخصصی کاشت، ترمیم و ژلیش ناخن</strong>
          </p>
        </div>

        <div className="space-y-4">
          {nailFaqs.map((faq, i) => (
            <details 
              key={i} 
              className="group bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 open:bg-white open:shadow-2xl open:shadow-rose-100/20 transition-all duration-500"
            >
              <summary className="font-black flex justify-between items-center cursor-pointer list-none text-slate-800 lg:text-xl">
                {faq.q}
                <div className="bg-rose-100 p-1 rounded-full group-open:rotate-180 transition-transform duration-500">
                  <ChevronDown className="text-rose-600 w-5 h-5" />
                </div>
              </summary>
              <div className="overflow-hidden transition-all duration-500">
                <p className="mt-6 text-slate-600 text-sm lg:text-base leading-relaxed font-medium border-t border-rose-50 pt-6">
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
        <div className="mt-12 text-center p-6 bg-rose-50 rounded-3xl border border-rose-100">
          <p className="text-slate-700 font-bold">
            سوال دیگری دارید؟ <span className="text-rose-600">۲ هفته رایگان</span> را امتحان کنید و با پشتیبانی آنتایم در تماس باشید.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            ★ بیش از ۸۵۰ ناخن‌کار به آنتایم اعتماد کرده‌اند ★
          </p>
        </div>
      </div>
    </section>
  );
}