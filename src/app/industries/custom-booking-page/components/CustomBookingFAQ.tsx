// app/industries/custom-booking-page/components/CustomBookingFAQ.tsx
"use client";
import { ChevronDown, HelpCircle, Globe, Smartphone, MessageSquare, Calendar } from "lucide-react";
import Script from "next/script";

const faqs = [
  {
    q: "آیا ساخت صفحه اختصاصی نیاز به دانش فنی دارد؟",
    a: "خیر،完全没有! آنتایم به گونه‌ای طراحی شده که بدون هیچ دانش فنی و برنامه‌نویسی، در کمتر از ۵ دقیقه می‌توانید صفحه اختصاصی خود را بسازید. فقط کافی است اطلاعات کسب‌وکارتان را وارد کنید و سیستم به صورت خودکار صفحه را می‌سازد.",
    seoKeywords: "ساخت صفحه اختصاصی بدون دانش فنی"
  },
  {
    q: "مشتریان چگونه نوبت می‌گیرند؟",
    a: "شما یک لینک اختصاصی دریافت می‌کنید. مشتریان با کلیک روی این لینک وارد صفحه شما می‌شوند، خدمات و قیمت‌ها را می‌بینند و درخواست نوبت خود را ثبت می‌کنند. بلافاصله پیامک تایید برای آنها ارسال می‌شود و شما در پنل مدیریت نوبت را مشاهده می‌کنید.",
    seoKeywords: "فرآیند نوبت گیری آنلاین از صفحه اختصاصی"
  },
  {
    q: "مشتریان می‌توانند نوبت خود را تغییر دهند یا لغو کنند؟",
    a: "بله، مشتریان با کلیک روی لینکی که در پیامک دریافت می‌کنند، می‌توانند نوبت خود را مشاهده کرده و در صورت نیاز، نوبت را تغییر دهند یا لغو کنند. در هنگام لغو، دلیل آن را ثبت می‌کنند که این اطلاعات به بهبود خدمات شما کمک می‌کند.",
    seoKeywords: "تغییر و لغو نوبت توسط مشتری"
  },
  {
    q: "آیا مشتریان می‌توانند نظر بدهند؟",
    a: "بله، بعد از انجام خدمات، مشتریان می‌توانند نظر و امتیاز خود را ثبت کنند. این نظرات در صفحه اختصاصی شما نمایش داده می‌شود و به جذب مشتریان جدید کمک می‌کند.",
    seoKeywords: "نظردهی مشتریان در صفحه اختصاصی"
  },
  {
    q: "آیا می‌توانم نمونه کارهایم را در صفحه نمایش دهم؟",
    a: "بله، شما می‌توانید تصاویر نمونه کارهای خود را در گالری صفحه آپلود کنید. مشتریان قبل از رزرو می‌توانند کیفیت کار شما را ببینند و با اطمینان بیشتری نوبت بگیرند.",
    seoKeywords: "نمایش نمونه کار در صفحه نوبت دهی"
  },
  {
    q: "آیا صفحه اختصاصی در موبایل درست نمایش داده می‌شود؟",
    a: "بله، صفحه اختصاصی آنتایم کاملاً واکنش‌گرا (Responsive) طراحی شده و در تمام دستگاه‌ها (موبایل، تبلت، لپ‌تاپ و دسکتاپ) به درستی نمایش داده می‌شود. مشتریان شما بدون نیاز به نصب هیچ اپلیکیشنی از طریق موبایل نوبت می‌گیرند.",
    seoKeywords: "صفحه اختصاصی نوبت دهی ریسپانسیو"
  }
];

export default function CustomBookingFAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
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
      <Script id="custom-booking-faq-schema" type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </Script>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-blue-600 mb-4 md:mb-6 shadow-inner">
            <HelpCircle size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center text-slate-900 leading-tight">
            سوالات متداول درباره{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
              صفحه اختصاصی آنتایم
            </span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-3 md:mt-4 text-center max-w-2xl">
            پاسخ به سوالات رایج کسب‌وکارها درباره ساخت صفحه اختصاصی نوبت‌دهی
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, i) => (
            <details 
              key={i} 
              className="group bg-slate-50 rounded-2xl md:rounded-[2.5rem] p-5 md:p-6 lg:p-8 border border-slate-100 open:bg-white open:shadow-2xl open:shadow-blue-100/20 transition-all duration-500"
            >
              <summary className="font-black flex justify-between items-center cursor-pointer list-none text-slate-800 text-sm sm:text-base md:text-lg lg:text-xl">
                {faq.q}
                <div className="bg-gradient-to-r from-blue-100 to-pink-100 p-1 rounded-full group-open:rotate-180 transition-transform duration-500 shrink-0 mr-2">
                  <ChevronDown className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />
                </div>
              </summary>
              <div className="overflow-hidden transition-all duration-500">
                <p className="mt-4 md:mt-6 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-medium border-t border-slate-100 pt-4 md:pt-6">
                  {faq.a}
                </p>
                <p className="text-slate-400 text-[8px] sm:text-[9px] md:text-[10px] mt-2 md:mt-3 hidden md:block">
                  ★ {faq.seoKeywords} ★
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}