// components/BeautySalon/BeautyFAQ.tsx
"use client";
import { ChevronDown, HelpCircle } from "lucide-react";
import Script from "next/script";

const faqs = [
  {
    q: "من به تنهایی کار می‌کنم، آیا این سیستم برای من پیچیده نیست؟",
    a: "اتفاقاً آنتایم دقیقاً برای آرایشگران مستقلی طراحی شده که می‌خواهند بدون درگیری با تلفن و منشی، تمام تمرکزشان را روی هنرشان بگذارند. مدیریت خدمات و نوبت‌ها در این اپلیکیشن بسیار ساده است و راه‌اندازی آن کمتر از ۵ دقیقه زمان می‌برد."
  },
  {
    q: "مشتری چگونه از نوبت رزرو شده مطلع می‌شود؟",
    a: "بلافاصله پس از ثبت نوبت توسط شما یا مشتری، یک پیامک تایید شامل نوع خدمت و زمان دقیق ارسال می‌شود. همچنین سیستم به صورت هوشمند و خودکار، چند ساعت قبل از نوبت، پیامک یادآوری را به همراه لوکیشن برای مشتری ارسال می‌کند."
  },
  {
    q: "آیا امکان مدیریت مشتریان بدقول وجود دارد؟",
    a: "بله، اپلیکیشن آنتایم قابلیت 'لیست سیاه' دارد. اگر مشتری قبلاً نوبت‌های خود را بدون هماهنگی لغو کرده باشد، در هنگام رزرو جدید، سیستم سوابق او را به شما هشدار می‌دهد تا وقت شما هدر نشود."
  },
  {
    q: "مشتری چطور می‌تواند نوبت خود را جابجا یا لغو کند؟",
    a: "بلافاصله بعد از ثبت نوبت، یک لینک اختصاصی برای مشتری پیامک می‌شود. مشتری با کلیک روی آن لینک، وارد صفحه شخصی نوبت خود شده و می‌تواند جزییات را ببیند و طبق قوانینی که شما تعیین می‌کنید، نوبت را تغییر دهد."
  },
  {
    q: "آیا آرایشگر هم باید لینک داشته باشد؟",
    a: "خیر، آرایشگر با شماره موبایل خود وارد پنل مدیریت (داشبورد) می‌شود تا به تمام نوبت‌ها و لیست خدمات دسترسی داشته باشد. لینک اختصاصی فقط برای مشتری و جهت کاهش تماس‌های تلفنی ارسال می‌شود."
  }
];

export default function BeautyFAQ() {
  // ساختار JSON-LD برای نمایش سوالات در نتایج گوگل (SEO FAQ Schema)
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
    <section id="faq" className="py-24 bg-white">
      {/* اضافه کردن اسکیما به هدر صفحه بدون نمایش به کاربر */}
      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </Script>

      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-4">
            <HelpCircle size={28} />
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-center text-slate-900">
            پاسخ به سوالات <span className="text-pink-600">آرایشگران</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details 
              key={i} 
              className="group bg-slate-50 rounded-[2rem] p-6 border border-slate-100 open:bg-white open:shadow-2xl open:shadow-pink-100/30 transition-all duration-300"
            >
              <summary className="font-black flex justify-between items-center cursor-pointer list-none text-slate-800 lg:text-lg">
                {faq.q}
                <ChevronDown className="group-open:rotate-180 transition-transform text-pink-600 w-5 h-5" />
              </summary>
              <div className="overflow-hidden transition-all duration-300">
                <p className="mt-4 text-slate-600 text-sm lg:text-base leading-relaxed font-medium border-t border-slate-200 pt-4">
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