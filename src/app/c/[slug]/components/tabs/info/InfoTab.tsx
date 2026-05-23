import { Header } from "../../shared/Header";
import { StatsCards } from "../../shared/StatsCards";
import { ServicesList } from "../../shared/ServicesList";
import { WorkingHours } from "../../shared/WorkingHours";
import { SocialMedia } from "../../shared/SocialMedia";
import { BusinessData } from "../../shared/types";
import { Calendar } from "lucide-react";

interface InfoTabProps {
  business: BusinessData;
  isWorkingNow: boolean;
  onBookingClick: () => void;
  isBookingEnabled: boolean; // اضافه شد
}

export function InfoTab({
  business,
  isWorkingNow,
  onBookingClick,
  isBookingEnabled,
}: InfoTabProps) {
  return (
    <div>
      <Header business={business} isWorkingNow={isWorkingNow} />
      <div className="px-4 mt-20">
        <StatsCards business={business} />

        {/* بیوگرافی کسب‌وکار */}
        {business.bio && (
          <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-4 border border-white/10 mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              {business.bio}
            </p>
          </div>
        )}

        {/* لیست خدمات */}
        <ServicesList
          services={business.services}
          onBookingClick={isBookingEnabled ? onBookingClick : undefined}
          showBookingButton={isBookingEnabled}
        />
        {/* ساعات کاری */}
        <WorkingHours offDays={business.off_days} />

        {/* شبکه‌های اجتماعی */}
        <SocialMedia socialMedia={business.social_media} />

        {/* دکمه ثبت نوبت - فقط در صورت فعال بودن اشتراک نمایش داده بشه */}
        {isBookingEnabled && (
          <button
            onClick={onBookingClick}
            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all"
          >
            <Calendar className="w-5 h-5" />
            ثبت نوبت آنلاین
          </button>
        )}

        {/* اگر اشتراک ثبت نوبت فعال نیست، پیام نمایش بده */}
        {!isBookingEnabled && (
          <div className="mt-6 p-3 bg-gray-800/50 rounded-xl text-center border border-gray-700">
            <p className="text-gray-500 text-sm">
              🔒 امکان ثبت نوبت آنلاین برای این کسب‌وکار فعال نیست
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
