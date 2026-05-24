import { Clock, Sparkles } from "lucide-react";
import { Service } from "./types";

interface ServicesListProps {
  services: Service[];
  onBookingClick?: () => void;
  showBookingButton?: boolean;
}

export function ServicesList({ services, onBookingClick, showBookingButton = true }: ServicesListProps) {
  if (!services?.length) return null;

  // تابع فرمت قیمت به تومان با اعداد فارسی
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '۰';
    return numPrice.toLocaleString('fa-IR');
  };

  return (
    <div className="mb-8 md:mb-10 animate-fadeInUp">
      {/* هدر بخش با استایل لوکس‌تر */}
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 md:h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
          <h3 className="font-bold text-white text-lg md:text-xl tracking-tight">
            خدمات ما
          </h3>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs md:text-sm font-medium text-emerald-400">
            {services.length} خدمت
          </span>
        </div>
      </div>

      {/* لیست خدمات با گرید واکنش‌گرا */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="group relative bg-gradient-to-br from-white/8 to-white/0 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02]"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            {/* افکت هدرایت گرادینت روی هاور */}
            <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-500/0 group-hover:to-transparent transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* نام سرویس با آیکون دکوراتیو */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={14} className="text-emerald-400 flex-shrink-0" />
                    <h4 className="font-semibold text-white text-sm md:text-base truncate">
                      {service.name}
                    </h4>
                  </div>
                  
                  {/* مدت زمان با استایل بهتر */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-400/60" />
                    <Clock size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-300">
                      {service.duration_minutes} دقیقه
                    </span>
                  </div>
                </div>

                {/* بخش قیمت با برجستگی بیشتر */}
                <div className="text-left flex-shrink-0">
                  <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <div className="text-base md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                      {formatPrice(service.price)}
                    </div>
                    <div className="text-[10px] text-gray-400 text-center mt-0.5">تومان</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* دکمه ثبت نوبت با انیمیشن چشمگیرتر */}
      {showBookingButton && onBookingClick && (
        <div className="mt-6 md:mt-8 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={onBookingClick}
            className="group relative w-full py-3 md:py-3.5 rounded-xl md:rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white text-sm md:text-base font-bold shadow-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            {/* افکت موج روی دکمه */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              رزرو نوبت
            </span>
          </button>
        </div>
      )}

      {/* استایل انیمیشن */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }
      `}</style>
    </div>
  );
}