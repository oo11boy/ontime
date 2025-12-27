import React from "react";
import { Sparkles, Star } from "lucide-react";
import Link from "next/link";

interface DashboardPlanStatusProps {
  planTitle: string;
  trialEndsAt: string | null | undefined;
  quotaEndsAt: string | null | undefined; // اضافه شده برای پلن‌های غیر رایگان
}

const calculateRemainingDays = (endDate: string | null | undefined): number | null => {
  if (!endDate) return null;
  
  try {
    const today = new Date();
    const end = new Date(endDate);
    
    if (isNaN(end.getTime())) return null;

    // حذف ساعت برای محاسبه دقیق روزها
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays; // اجازه می‌دهیم اعداد منفی هم برگردند تا منقضی شده را تشخیص دهیم
  } catch (e) {
    return null;
  }
};

export const DashboardPlanStatus: React.FC<DashboardPlanStatusProps> = ({ 
  planTitle, 
  trialEndsAt,
  quotaEndsAt
}) => {
  // اولویت با تاریخ انقضای کوتای ماهانه است، اگر نبود از تاریخ آزمایشی استفاده می‌کند
  const finalEndDate = quotaEndsAt || trialEndsAt;
  const remainingDays = calculateRemainingDays(finalEndDate);
  
  let timeStatusMessage: string;
  let statusColorClass = "text-gray-500";
  
  if (!finalEndDate) {
    timeStatusMessage = "وضعیت نامشخص";
  } else if (remainingDays !== null && remainingDays > 0) {
    timeStatusMessage = `${remainingDays.toLocaleString("fa-IR")} روز تا پایان اعتبار باقیست.`;
    statusColorClass = "text-emerald-600 font-bold";
  } else if (remainingDays !== null && remainingDays === 0) {
    timeStatusMessage = "اشتراک شما امروز به پایان می‌رسد.";
    statusColorClass = "text-orange-500 font-bold";
  } else {
    timeStatusMessage = "اعتبار اشتراک شما به پایان رسیده است.";
    statusColorClass = "text-red-500 font-bold";
  }

  return (
    <div className="bg-white rounded-3xl w-full p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <div className="flex items-left flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">پلن فعال فعلی:</span>
              <span className="text-lg font-bold text-gray-900">{planTitle}</span>
            </div>
            <p className={`text-[11px] mt-1 ${statusColorClass}`}>
              {timeStatusMessage}
            </p>
          </div>
        </div>

        <Link 
          href="/clientdashboard/pricingplan" 
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          {remainingDays !== null && remainingDays < 0 ? "تمدید پلن" : "ارتقا پلن"}
        </Link>
      </div>
    </div>
  );
};