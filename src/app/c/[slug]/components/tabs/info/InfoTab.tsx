import { Header } from "../../shared/Header";
import { StatsCards } from "../../shared/StatsCards";
import { ServicesList } from "../../shared/ServicesList";
import { WorkingHours } from "../../shared/WorkingHours";
import { SocialMedia } from "../../shared/SocialMedia";
import { BusinessData } from "../../shared/types";
import { Calendar } from "lucide-react";
import Link from "next/link";

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
        {/* <StatsCards business={business} /> */}

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

   
        {/* اگر اشتراک ثبت نوبت فعال نیست، پیام نمایش بده */}
        {!isBookingEnabled && (
          <div className="mt-6 p-3 bg-gray-800/50 rounded-xl text-center border border-gray-700">
            <Link href={"../"} className="text-gray-500 text-sm ">
              قدرت گرفته از آنتایم
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
