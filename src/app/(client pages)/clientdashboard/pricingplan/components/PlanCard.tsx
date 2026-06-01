import React from "react";
import { Check, CircleCheckBig, Zap } from "lucide-react";

interface PlanCardProps {
  plan: {
    id: number;
    plan_key: string;
    title: string;
    monthly_fee: number;
    free_sms_month: number;
    price_per_100_sms: number;
    discountPer100: number;
    popular: boolean;
  };
  isActive: boolean;
  hasUsedFreeTrial: boolean;
  formatPrice: (price: number) => string;
  onSelect: (planKey: string) => void;
  currentPlanEndedAt?: string | null;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isActive,
  hasUsedFreeTrial,
  formatPrice,
  onSelect,
  currentPlanEndedAt,
}) => {
  const isFreeTrial = plan.plan_key === "free_trial";
  
  // محاسبه روزهای باقیمانده تا انقضا
  const getRemainingDays = () => {
    if (!isActive || !currentPlanEndedAt) return null;
    const now = new Date();
    const endedAt = new Date(currentPlanEndedAt);
    const diffTime = endedAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const remainingDays = getRemainingDays();
  const isExpiringSoon = remainingDays !== null && remainingDays <= 5 && remainingDays > 0;
  const isExpired = remainingDays !== null && remainingDays <= 0;

  let buttonText = "انتخاب پلن";
  let isDisabled = false;

  // منطق برای تعیین وضعیت دکمه
  if (isActive) {
    if (isExpired) {
      // منقضی شده
      if (isFreeTrial) {
        buttonText = "استفاده شده";
        isDisabled = true;
      } else {
        buttonText = "تمدید اشتراک";
        isDisabled = false;
      }
    } else if (isExpiringSoon) {
      // نزدیک به انقضا (کمتر از 5 روز)
      buttonText = "تمدید اشتراک";
      isDisabled = false;
    } else {
      // فعال و معتبر
      buttonText = "پلن فعلی شما";
      isDisabled = true;
    }
  } else {
    // پلن فعال نیست
    if (isFreeTrial && hasUsedFreeTrial) {
      buttonText = "استفاده شده";
      isDisabled = true;
    } else if (isFreeTrial && !hasUsedFreeTrial) {
      buttonText = "فعالسازی رایگان";
      isDisabled = false;
    } else {
      buttonText = "انتخاب پلن";
      isDisabled = false;
    }
  }

  // متن قابلیت‌ها بر اساس پلن
  const getFeatures = () => {
    if (plan.plan_key === "free" || plan.plan_key === "free_trial") {
      return [
        "✅ ثبت نوبت توسط مشتری (محدود) ",
        "✅ صفحه اختصاصی کسب‌وکار",
        "✅ گالری تصاویر",
        "✅ شبکه‌های اجتماعی",
        "❌ مدیریت پرسنل",
        "❌ پیامک یادآوری",
        "❌ دسترسی کامل به اپلیکیشن",
      ];
    }

    return [
      "✅ ثبت نوبت جدید",
      "✅ صفحه اختصاصی کسب‌وکار",
      "✅ ثبت و تغییر نوبت توسط مشتری در صفحه اختصاصی",
      "✅ گالری تصاویر",
      "✅ شبکه‌های اجتماعی",
      "✅ مدیریت پرسنل",
      "✅ پیامک یادآوری و اطلاع‌رسانی",
      "✅ دسترسی کامل به اپلیکیشن",
    ];
  };

  const features = getFeatures();

  return (
    <div
      className={`relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl border transition-all duration-300
        ${
          plan.popular
            ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] dark:border-emerald-500/50"
            : "border-slate-200 dark:border-white/10"
        }
        ${!isDisabled ? "hover:bg-slate-50 dark:hover:bg-white/[0.08] cursor-pointer" : "opacity-90"}
      `}
      onClick={() => !isDisabled && onSelect(plan.plan_key)}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider z-10">
          پیشنهاد ویژه
        </div>
      )}

      {/* نشانگر در حال اتمام */}
      {isActive && isExpiringSoon && !isFreeTrial && (
        <div className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
          {remainingDays} روز مانده
        </div>
      )}

      {/* نشانگر منقضی شده */}
      {isActive && isExpired && !isFreeTrial && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
          منقضی شده
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            {plan.title}
          </h3>
          <div className="text-right">
            {plan.monthly_fee === 0 ? (
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                رایگان
              </span>
            ) : (
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {formatPrice(plan.monthly_fee)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-gray-400">
                  تومان / ماهانه
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 p-3 bg-slate-100 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5">
          <div className="text-center">
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              {plan.free_sms_month.toLocaleString("fa-IR")}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-gray-500 uppercase">
              پیامک هدیه
            </div>
          </div>
          <div className="text-center border-x border-slate-200 dark:border-white/10">
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              {plan.price_per_100_sms.toLocaleString("fa-IR")}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-gray-500 uppercase">
              تعرفه هر ۱۰۰ پیامک
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm">{f.substring(0, 2)}</span>
              <span className="text-xs text-slate-600 dark:text-gray-300">
                {f.substring(2)}
              </span>
            </div>
          ))}
        </div>

        <button
          disabled={isDisabled}
          className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
            ${
              isActive && !isExpired && !isExpiringSoon
                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 cursor-default"
                : (isActive && (isExpired || isExpiringSoon) && !isFreeTrial)
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg animate-pulse"
                : isDisabled
                ? "bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-gray-500 cursor-not-allowed grayscale"
                : "bg-slate-800 text-white hover:bg-emerald-600 dark:bg-white dark:text-black dark:hover:bg-emerald-400 dark:hover:text-black hover:scale-[1.02] active:scale-95 shadow-lg"
            }
          `}
        >
          <span>{buttonText}</span>
          {isActive && !isExpired && !isExpiringSoon ? (
            <CircleCheckBig className="w-5 h-5" />
          ) : (isActive && (isExpired || isExpiringSoon) && !isFreeTrial) ? (
            <Zap className="w-4 h-4" />
          ) : (
            <Zap
              className={`w-4 h-4 ${!isDisabled ? "animate-pulse" : "text-slate-500 dark:text-gray-500"}`}
            />
          )}
        </button>
        
        {/* متن توضیحی برای نزدیک به اتمام */}
        {isActive && isExpiringSoon && !isFreeTrial && (
          <p className="text-center text-[10px] text-amber-600 dark:text-amber-400 mt-2">
            ⚠️ {remainingDays} روز دیگر اشتراک شما به پایان می‌رسد. برای تمدید اقدام کنید.
          </p>
        )}
        
        {/* متن توضیحی برای منقضی شده */}
        {isActive && isExpired && !isFreeTrial && (
          <p className="text-center text-[10px] text-red-600 dark:text-red-400 mt-2">
            اشتراک شما منقضی شده است. لطفاً برای ادامه استفاده تمدید کنید.
          </p>
        )}
      </div>
    </div>
  );
};