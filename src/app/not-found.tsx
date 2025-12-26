import Link from "next/link";
import { Home, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1B1F28] flex items-center justify-center px-6 relative overflow-hidden">
      {/* المان‌های تزئینی پس‌زمینه برای حفظ زیبایی */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-2xl w-full text-center z-10">
        {/* بخش بصری ۴۰۴ */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[12rem] lg:text-[16rem] font-black text-white/5 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600/20 p-6 rounded-3xl backdrop-blur-xl border border-white/10 animate-pulse">
              <Search size={48} className="text-blue-400" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
          صفحه مورد نظر <span className="text-blue-500">پیدا نشد!</span>
        </h2>
        
        <p className="text-slate-400 text-lg lg:text-xl mb-12 leading-relaxed">
          متاسفانه صفحه‌ای که دنبال آن بودید جابجا شده یا دیگر وجود ندارد. 
          شاید آدرس را اشتباه وارد کرده باشید.
        </p>

        {/* دکمه‌های هدایت‌کننده */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <Home size={22} />
            بازگشت به خانه
          </Link>
          
          <Link
            href="/#faq"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-black text-lg transition-all backdrop-blur-md"
          >
            سوالات متداول
            <ArrowRight size={22} />
          </Link>
        </div>

        {/* بخش برندینگ کوچک */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-slate-500 font-bold flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            آنتایم؛ هوشمندترین سیستم نوبت‌دهی آنلاین
          </p>
        </div>
      </div>
    </div>
  );
}