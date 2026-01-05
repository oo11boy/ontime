"use client";
import { ChevronDown, HelpCircle, MessageCircleQuestion } from "lucide-react";
import Script from "next/script";

const nailFaqs = [
  {
    q: "من به عنوان ناخن‌کار مستقل فعالیت می‌کنم، این پنل برای من کاربرد دارد؟",
    a: "بله، دقیقاً! آنتایم برای ناخن‌کارانی طراحی شده که می‌خواهند بدون درگیری با منشی یا دفترچه‌های کاغذی، نوبت‌های کاشت و ترمیم خود را مدیریت کنند. شما با گوشی خود نوبت را ثبت می‌کنید و باقی کارها (ارسال پیامک و یادآوری) به عهده سیستم است."
  },
  {
    q: "سیستم یادآوری نوبت ترمیم ناخن چگونه کار می‌کند؟",
    a: "به محض اینکه شما نوبت را در تقویم آنتایم ثبت کنید، سیستم به صورت خودکار ۲۴ ساعت قبل از موعد، پیامکی حاوی زمان دقیق و آدرس سالن برای مشتری ارسال می‌کند. این کار احتمال فراموشی نوبت توسط مشتری را تقریباً به صفر می‌رساند."
  },
  {
    q: "اگر کلاینت بدقول باشد یا نوبت را کنسل کند، سیستم چه کمکی می‌کند؟",
    a: "در پنل آنتایم، شما به سوابق هر مشتری دسترسی دارید. اگر مشتری نوبت‌های قبلی را بدون هماهنگی لغو کرده باشد، سیستم در مراجعات بعدی به شما هشدار می‌دهد (لیست سیاه) تا وقت خود را برای مشتریان غیرمتعهد هدر ندهید."
  },
  {
    q: "چطور می‌توانم زمان‌های متفاوتی برای کاشت و ژلیش تعریف کنم؟",
    a: "در بخش تنظیمات خدمات، شما می‌توانید برای هر لاین (مثلاً کاشت پودر ۱۸۰ دقیقه و ژلیش ۴۵ دقیقه) زمان اختصاصی تعریف کنید. هنگام ثبت نوبت، اپلیکیشن به طور هوشمند بازه زمانی مورد نظر را در تقویم شما رزرو می‌کند."
  },
  {
    q: "آیا مشتری هم باید اپلیکیشن آنتایم را نصب داشته باشد؟",
    a: "خیر، کلاینت‌های شما نیازی به نصب هیچ برنامه‌ای ندارند. تمام ارتباطات از طریق پیامک انجام می‌شود و لینک مدیریت نوبت نیز در مرورگر گوشی مشتری باز می‌شود تا کار برای آن‌ها تا حد ممکن ساده باشد."
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
            <MessageCircleQuestion size={32} />
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-center text-slate-900 leading-tight">
            سوالات متداول <br />
            <span className="text-rose-600 text-2xl lg:text-4xl">ویژه متخصصین ناخن</span>
          </h2>
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
                <p className="mt-6 text-slate-600 text-sm lg:text-base leading-relaxed font-medium border-t border-rose-50 pt-6 italic">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}