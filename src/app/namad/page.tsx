import Link from 'next/link';
import { ChevronLeft, Home, ShieldCheck, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';
import Navigation from '@/components/Landing/Navigation';
import EnhancedFooter from '@/components/Landing/EnhancedFooter';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مجوزها و نمادهای اعتماد | آنتایم",
  description: "اطلاعات مربوط به مجوزهای قانونی، نماد اعتماد الکترونیک و ساماندهی اپلیکیشن آنتایم",
};

export default function TrustPage() {
  const baseUrl = "https://ontimeapp.ir";

  // اسکیما Breadcrumb برای سئو
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "خانه", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "نمادهای اعتماد", "item": `${baseUrl}/trust` }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Navigation />
      
      <main className="pt-28 pb-32 px-6 max-w-5xl mx-auto w-full relative">
        {/* پس‌زمینه‌های تزئینی مشابه وبلاگ */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
        </div>

        <nav className="flex items-center gap-2 text-gray-500 text-xs mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
            <Home size={14} /> خانه
          </Link>
          <ChevronLeft size={12} className="text-gray-300" />
          <span className="text-blue-600 font-bold">نمادهای اعتماد</span>
        </nav>

        <header className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-3 py-2 px-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mb-6 border border-emerald-200">
            <ShieldCheck size={16} />
            <span>خرید امن و تضمین شده</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
             مجوزها و <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-700">اعتبار قانونی</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            تمامی فعالیت‌های مجموعه آنتایم تحت نظارت مراجع قانونی بوده و دارای تاییدیه‌های لازم از مرکز توسعه تجارت الکترونیک می‌باشد.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* بخش اینماد */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
               <ShieldCheck size={40} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-black mb-4 text-slate-800">نماد اعتماد الکترونیک</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              مرکز توسعه تجارت الکترونیک با اعطای نماد اعتماد الکترونیک هویت صاحب و محل فعالیت کسب و کارهای اینترنتی را احراز می‌کند.
            </p>
            
            {/* باکس نماد */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 hover:bg-white hover:shadow-md transition-all">
              <a 
                referrerPolicy='origin' 
                target='_blank' 
                href='https://trustseal.enamad.ir/?id=692390&Code=rKMbNLS4S05oNoTOInpac4yxj74C90sr'
                className="block"
              >
                <img 
                  src='https://trustseal.enamad.ir/logo.aspx?id=692390&Code=rKMbNLS4S05oNoTOInpac4yxj74C90sr' 
                  alt='اینماد آنتایم' 
                  className="w-32 h-32 object-contain mx-auto"
                />
              </a>
            </div>

            <a 
               href='https://trustseal.enamad.ir/?id=692390&Code=rKMbNLS4S05oNoTOInpac4yxj74C90sr'
               target="_blank"
               className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
            >
              مشاهده پروفایل در اینماد <ExternalLink size={14} />
            </a>
          </section>

          {/* بخش امنیت و تعهدات */}
          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle className="text-emerald-400" />
              تعهدات آنتایم به شما
            </h3>
            <ul className="space-y-4">
              {[
                "حفاظت کامل از حریم خصوصی و اطلاعات کاربران",
                "پایداری ۹۹.۹٪ سرویس در تمام ایام سال",
                "پشتیبانی فنی در سریع‌ترین زمان ممکن",
                "شفافیت در هزینه‌ها و عدم دریافت هزینه پنهان"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
               <div className="flex items-center gap-3 mb-2">
                 <ShieldAlert className="text-amber-400" size={20} />
                 <span className="font-bold text-sm">نیاز به راهنمایی دارید؟</span>
               </div>
               <p className="text-xs text-slate-400">
                 در صورت وجود هرگونه سوال یا ابهام در مورد مجوزها، می‌توانید با واحد حقوقی آنتایم در ارتباط باشید.
               </p>
            </div>
          </section>

        </div>

        {/* بخش فوتر داخلی صفحه */}
        <div className="mt-16 text-center">
            <p className="text-slate-400 text-sm">
              تمامی حقوق مادی و معنوی این وب‌سایت متعلق به <strong>آنتایم</strong> می‌باشد.
            </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}