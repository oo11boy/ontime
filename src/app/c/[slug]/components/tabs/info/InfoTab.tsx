import { Header } from "../../shared/Header";
import { StatsCards } from "../../shared/StatsCards";
import { ServicesList } from "../../shared/ServicesList";
import { WorkingHours } from "../../shared/WorkingHours";
import { SocialMedia } from "../../shared/SocialMedia";
import { BusinessData } from "../../shared/types";

interface InfoTabProps {
  business: BusinessData;
  isWorkingNow: boolean;
  onBookingClick: () => void;
}

export function InfoTab({ business, isWorkingNow, onBookingClick }: InfoTabProps) {
  return (
    <div>
      <Header business={business} isWorkingNow={isWorkingNow} />
      <div className="px-4 mt-20">
        <StatsCards business={business} />

        {business.bio && (
          <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-4 border border-white/10 mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">{business.bio}</p>
          </div>
        )}

        <ServicesList services={business.services} onBookingClick={onBookingClick} />
        <WorkingHours offDays={business.off_days} />
        <SocialMedia socialMedia={business.social_media} />
      </div>
    </div>
  );
}