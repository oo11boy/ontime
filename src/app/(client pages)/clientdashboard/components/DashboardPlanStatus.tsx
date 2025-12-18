// src/app/(client pages)/clientdashboard/components/DashboardPlanStatus.tsx
import React from "react";
import { Sparkles, Star } from "lucide-react";
import Link from "next/link";

interface DashboardPlanStatusProps {
  planTitle: string;
  trialEndsAt: string | null | undefined;
}

const calculateRemainingDays = (endDate: string | null | undefined): number | null => {
  if (!endDate) return null;
  
  try {
    const today = new Date();
    const end = new Date(endDate);
    
    if (isNaN(end.getTime())) return null;

    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (e) {
    return null;
  }
};

export const DashboardPlanStatus: React.FC<DashboardPlanStatusProps> = ({ 
  planTitle, 
  trialEndsAt 
}) => {
  const remainingDays = calculateRemainingDays(trialEndsAt);
  
  let timeStatusMessage: string;
  
  if (!trialEndsAt) {
    timeStatusMessage = "فعال";
  } else if (remainingDays !== null && remainingDays > 0) {
    timeStatusMessage = `${remainingDays} روز باقیمانده است.`;
  } else if (remainingDays !== null && remainingDays === 0) {
    timeStatusMessage = "امروز منقضی می‌شود.";
  } else {
    timeStatusMessage = "منقضی شده است.";
  }

  return (
    <div className="bg-white rounded-3xl w-full p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <div className="flex items-left flex-col gap-2">
              <span className="text-sm font-medium text-gray-600">پلن انتخابی</span>
              <span className="text-lg font-bold text-gray-900">{planTitle}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {timeStatusMessage}
            </p>
          </div>
        </div>

        <button className="mt-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-2 px-3 py-3 rounded-2xl font-semibold max-sm:text-sm text-md shadow-md hover:shadow-lg hover:scale-105 transition-all">
          <Link href="../clientdashboard/pricingplan" className="flex gap-2 items-center">
            <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            ارتقا پلن
          </Link>
        </button>
      </div>
    </div>
  );
};