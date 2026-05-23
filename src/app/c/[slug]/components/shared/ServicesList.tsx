import { Clock } from "lucide-react";
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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white text-lg">خدمات ما</h3>
        <span className="text-xs text-emerald-400">{services.length} خدمت</span>
      </div>
      <div className="space-y-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-gradient-to-r from-white/5 to-white/0 rounded-xl p-3 border border-white/10"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-white text-sm">{service.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{service.duration_minutes} دقیقه</span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-emerald-400">
                  {formatPrice(service.price)}
                </div>
                <div className="text-[9px] text-gray-500">تومان</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* فقط اگه showBookingButton true باشه و onBookingClick وجود داشته باشه، دکمه نمایش داده میشه */}
      {showBookingButton && onBookingClick && (
        <button
          onClick={onBookingClick}
          className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
        >
          ثبت نوبت
        </button>
      )}
    </div>
  );
}