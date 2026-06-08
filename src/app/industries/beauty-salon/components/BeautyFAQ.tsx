// components/BeautySalon/BeautyFAQ.tsx
"use client";
import { ChevronDown, HelpCircle, MessageSquare, CalendarCheck, Users, Link2, ShieldCheck } from "lucide-react";
import Script from "next/script";

const faqs = [
  {
    q: "آیا نرم افزار نوبت دهی آرایشگاه آنتایم برای آرایشگران تنها مناسبه؟",
    a: "بله، آنتایم دقیقاً برای آرایشگران مستقلی طراحی شده که می‌خواهند بدون درگیری با تلفن و منشی، تمام تمرکزشان را روی هنرشان بگذارند. مدیریت خدمات و نوبت‌ها در این اپلیکیشن بسیار ساده است و راه‌اندازی آن کمتر از ۵ دقیقه زمان می‌برد. ضمناً ۲ هفته اول رایگان است.",
    seoKeywords: "نرم افزار نوبت دهی آرایشگاه برای آرایشگر تنها"
  },
  {
    q: "پیامک یادآوری نوبت چگونه به مشتری ارسال می‌شود؟",
    a: "بلافاصله پس از ثبت نوبت توسط شما یا مشتری از طریق لینک اختصاصی، یک پیامک تایید شامل نوع خدمت و زمان دقیق ارسال می‌شود. همچنین سیستم به صورت هوشمند و خودکار، چند ساعت قبل از نوبت، پیامک یادآوری را به همراه لوکیشن سالن برای مشتری ارسال می‌کند و باعث کاهش ۸۰ درصدی کنسلی می‌شود.",
    seoKeywords: "سیستم پیامک یادآوری نوبت آرایشگاه"
  },
  {
    q: "امکان مسدود کردن مشتریان بدقول و کنسل کار در سیستم نوبت دهی وجود دارد؟",
    a: "بله، اپلیکیشن آنتایم قابلیت 'لیست سیاه' دارد. اگر مشتری قبلاً نوبت‌های خود را بدون هماهنگی لغو کرده باشد، در هنگام رزرو جدید، سیستم سوابق او را به شما هشدار می‌دهد تا وقت و سرمایه شما هدر نرود. این ویژگی مخصوص سالن‌های شلوغ و پرمراجعه است.",
    seoKeywords: "مدیریت مشتریان بدقول سالن زیبایی"
  },
  {
    q: "مشتری چطور می‌تواند بدون تماس تلفنی نوبت خود را جابجا یا لغو کند؟",
    a: "بلافاصله بعد از ثبت نوبت، یک لینک اختصاصی برای مشتری پیامک می‌شود. مشتری با کلیک روی آن لینک، وارد صفحه شخصی نوبت خود شده و می‌تواند جزئیات را ببیند و طبق قوانینی که شما تعیین می‌کنید (مثلاً حداکثر ۲۴ ساعت قبل)، نوبت را تغییر دهد یا لغو کند. این کار باعث کاهش تماس‌های تکراری شما می‌شود.",
    seoKeywords: "تغییر و لغو آنلاین نوبت بدون تماس تلفنی"
  },
  {
    q: "آیا برای استفاده از نرم افزار نوبت دهی نیاز به نصب اپلیکیشن دارم؟",
    a: "خیر، آرایشگر با شماره موبایل خود از طریق مرورگر وارد پنل مدیریت (داشبورد) می‌شود تا به تمام نوبت‌ها، خدمات و لیست مشتریان دسترسی داشته باشد. لینک اختصاصی فقط برای مشتری و جهت کاهش تماس‌های تلفنی ارسال می‌شود و مشتری هم نیازی به نصب اپلیکیشن ندارد.",
    seoKeywords: "نرم افزار نوبت دهی بدون نیاز به نصب"
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
          {/* H2 بهینه شده برای سئو */}
          <h2 className="text-3xl lg:text-5xl font-black text-center text-slate-900">
            پاسخ به سوالات <span className="text-pink-600">آرایشگران درباره نرم افزار نوبت دهی آنتایم</span>
          </h2>
          <p className="text-slate-500 text-sm mt-4 text-center max-w-2xl">
            سوالات متداول درباره <strong className="text-pink-600">سیستم نوبت دهی آنلاین آرایشگاه و سالن زیبایی</strong>
          </p>
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
                {/* کلمات کلیدی مخفی برای سئو */}
                <p className="text-slate-400 text-[10px] mt-2 hidden md:block">
                  ★ {faq.seoKeywords} ★
                </p>
              </div>
            </details>
          ))}
        </div>

        {/* سوال اضافی برای کسانی که هنوز قانع نشده‌اند */}
        <div className="mt-10 text-center p-6 bg-pink-50 rounded-3xl border border-pink-100">
          <p className="text-slate-700 font-bold">
            سوال دیگری دارید؟ <span className="text-pink-600">۲ هفته رایگان</span> را امتحان کنید و با پشتیبانی آنتایم در تماس باشید.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            ★ بیش از ۱,۲۰۰ سالن زیبایی به آنتایم اعتماد کرده‌اند ★
          </p>
        </div>
      </div>
    </section>
  );
}