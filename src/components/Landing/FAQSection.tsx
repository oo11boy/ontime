"use client";

import { ChevronDown, MessageCircle, ShieldCheck, Zap, HelpCircle, PhoneCall } from 'lucide-react';
import React, { useState } from 'react';

export default function FAQSection(): React.JSX.Element {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "آیا مشتری من هم باید اپلیکیشن آنتایم را نصب کند؟",
      answer: "خیر، یکی از بزرگترین مزایای آنتایم همین است! مشتری شما هیچ نیازی به نصب برنامه ندارد. تمام تعاملات شامل مشاهده نوبت، یادآوری و لینک تغییر زمان از طریق پیامک و وب‌اپلیکیشن (PWA) انجام می‌شود که روی تمام گوشی‌ها به سرعت باز می‌شود.",
      icon: <Zap className="text-amber-500" size={20} />
    },
    {
      question: "هزینه پیامک‌های یادآوری چگونه محاسبه می‌شود؟",
      answer: "ما با معتبرترین سرورهای پیامکی کشور متصل هستیم تا نرخ رسیدن پیامک (Delivery) نزدیک به ۱۰۰٪ باشد. شما بر اساس پلن انتخابی خود، ماهانه تعدادی پیامک هدیه دریافت می‌کنید و در صورت نیاز به پیامک بیشتر، می‌توانید پنل خود را با تعرفه رسمی شارژ کنید.",
      icon: <MessageCircle className="text-blue-500" size={20} />
    },
    {
      question: "سیستم چگونه از کنسلی نوبت‌ها جلوگیری می‌کند؟",
      answer: "آنتایم با ارسال پیامک‌های هوشمند در بازه‌های زمانی مشخص، نوبت را به مشتری یادآوری می‌کند. همچنین با ارائه لینک اختصاصی، به مشتری اجازه می‌دهد طبق قوانین شما (مثلاً تا ۲۴ ساعت قبل) نوبت را جابجا کند، که این کار از خالی ماندن تایم شما جلوگیری می‌کند.",
      icon: <HelpCircle className="text-indigo-500" size={20} />
    },
    {
      question: "آیا امنیت داده‌ها و لیست مشتریان من تضمین شده است؟",
      answer: "قطعا. امنیت اولویت اول ماست. اطلاعات شما و مشتریانتان به صورت رمزنگاری شده در سرورهای ابری اختصاصی آنتایم نگهداری می‌شود. شما مالک کامل داده‌ها هستید و هر زمان که بخواهید می‌توانید از لیست نوبت‌ها و مشتریان خود خروجی اکسل تهیه کنید.",
      icon: <ShieldCheck className="text-emerald-500" size={20} />
    },
    {
      question: "آنتایم برای چه کسب‌وکارهایی مناسب است؟",
      answer: "هر کسب‌وککاری که با نوبت‌دهی سر و کار دارد! از سالن‌های زیبایی و کلینیک‌های پزشکی گرفته تا مشاوران، وکلای دادگستری، مجموعه‌های ورزشی، آموزشگاه‌ها و حتی تعمیرگاه‌ها می‌توانند از مدیریت هوشمند آنتایم برای نظم‌دهی به بیزینس خود استفاده کنند.",
      icon: <Zap className="text-purple-500" size={20} />
    }
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50/50" dir="rtl">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* هدر بخش - استفاده از کلمات کلیدی سئو */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-black mb-6 text-slate-900 leading-tight">
            سوالات <span className="text-blue-600">متداول شما</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            پاسخ تمام سوالاتی که برای شروع <strong>نوبت‌دهی آنلاین</strong> در ذهن دارید.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group bg-white rounded-4xl overflow-hidden border transition-all duration-500 ${
                openFaq === index 
                ? "border-blue-200 shadow-xl shadow-blue-500/5 ring-1 ring-blue-100" 
                : "border-slate-200 shadow-sm hover:border-blue-100"
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-6 text-right flex items-center justify-between hover:bg-slate-50 transition-colors"
                aria-expanded={openFaq === index}
              >
                <div className="flex items-center gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    openFaq === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50"
                  }`}>
                    {React.cloneElement(faq.icon as React.ReactElement, { 
                     })}
                  </div>
                  <h3 className={`text-base lg:text-lg font-black transition-colors ${
                    openFaq === index ? "text-blue-600" : "text-slate-900"
                  }`}>
                    {faq.question}
                  </h3>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  openFaq === index ? "bg-blue-50 rotate-180" : "bg-slate-50"
                }`}>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-colors ${
                      openFaq === index ? "text-blue-600" : ""
                    }`}
                  />
                </div>
              </button>
              
              <div 
                className={`transition-all duration-500 ease-in-out ${
                  openFaq === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-8 pb-8 pr-20 text-base leading-[1.8] text-slate-600 font-medium border-t border-slate-50 pt-6">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* بخش کال تو اکشن نهایی با طراحی مدرن */}
        <div className="mt-20 relative overflow-hidden bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col items-center group">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 via-blue-600 to-indigo-600"></div>
          <p className="text-slate-500 font-bold mb-3">هنوز سوالی دارید؟</p>
          <h4 className="text-2xl font-black text-slate-900 mb-6">با مشاوران ما تماس بگیرید</h4>
          
          <a 
            href="tel:09981394832" 
            className="group/btn relative flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            <PhoneCall className="animate-bounce" />
            <span className="tabular-nums">۰۹۹۸۱۳۹۴۸۳۲</span>
          </a>
          
          <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm font-bold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            پاسخگوی شما هستیم (۸ الی ۲۰)
          </div>
        </div>

      </div>
    </section>
  );
}