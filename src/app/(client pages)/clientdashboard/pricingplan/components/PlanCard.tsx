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
  isPermanentlyDisabled: boolean;
  hasUsedFreeTrial: boolean;
  formatPrice: (price: number) => string;
  onSelect: (planKey: string) => void;
  isExpired: boolean; // 👈 این پراپ جدید برای مدیریت تمدید است
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isActive,
  isPermanentlyDisabled,
  hasUsedFreeTrial,
  formatPrice,
  onSelect,
  isExpired,
}) => {
  const isFreeTrial = plan.plan_key === "free_trial";

  // --- منطق هوشمند دکمه و وضعیت کلیک ---
  let buttonText = "فعالسازی";
  let isDisabled = false;

  if (isActive) {
    if (isExpired) {
      if (isFreeTrial) {
        // پلن رایگان منقضی شده -> غیرقابل انتخاب مجدد
        buttonText = "استفاده شده";
        isDisabled = true;
      } else {
        // پلن پولی منقضی شده -> اجازه تمدید
        buttonText = "تمدید اشتراک";
        isDisabled = false; 
      }
    } else {
      // پلن فعلی فعال و معتبر
      buttonText = "پلن فعلی";
      isDisabled = true;
    }
  } else {
    // اگر پلن فعلی کاربر نیست
    if (isFreeTrial && hasUsedFreeTrial) {
      // قبلاً هدیه را گرفته، پس همیشه غیرفعال
      buttonText = "استفاده شده";
      isDisabled = true;
    } else if (isPermanentlyDisabled) {
      // سایر شروط محدودکننده
      buttonText = "غیرقابل انتخاب";
      isDisabled = true;
    } else {
      // پلن‌های دیگر که کاربر می‌تواند بخرد
      buttonText = "انتخاب پلن";
      isDisabled = false;
    }
  }

  const features = ["سیستم نوبت‌دهی", "سامانه پیامکی", "دسترسی به CRM"];

  return (
    <div
      className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300
        ${
          plan.popular
            ? "border-emerald-500/60 shadow-xl shadow-emerald-500/10"
            : "border-white/10"
        }
        ${
          !isDisabled
            ? "hover:border-white/20 hover:shadow-lg active:scale-98"
            : "opacity-85"
        }
      `}
    >
      <div className="p-5">
        {/* عنوان و قیمت */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{plan.title}</h3>
            {plan.popular && (
              <p className="text-emerald-400 text-xs mt-1 font-medium">توصیه شده</p>
            )}
          </div>
          <div className="text-right">
            {plan.monthly_fee === 0 ? (
              <span className="text-2xl font-bold text-emerald-400">رایگان</span>
            ) : (
              <div>
                <span className="text-2xl font-bold">
                  {formatPrice(plan.monthly_fee)}
                </span>
                <span className="text-xs text-gray-400 mr-1">هزار تومان</span>
              </div>
            )}
          </div>
        </div>

        {/* مشخصات کلیدی */}
        <div className="grid grid-cols-3 gap-3 text-center mb-5 py-4 bg-white/5 rounded-xl">
          <div>
            <div className="text-lg font-bold">{formatPrice(plan.free_sms_month)}</div>
            <div className="text-xs text-gray-400">پیامک رایگان</div>
          </div>
          <div>
            <div className="text-lg font-bold">{formatPrice(plan.price_per_100_sms)}</div>
            <div className="text-xs text-gray-400">هر ۱۰۰ پیامک</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400">{plan.discountPer100}%</div>
            <div className="text-xs text-gray-400">تخفیف</div>
          </div>
        </div>

        {/* لیست امکانات */}
        <div className="space-y-2.5 mb-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-sm text-gray-200">{feature}</span>
            </div>
          ))}
        </div>

        {/* دکمه عملیاتی */}
        <button
          onClick={() => !isDisabled && onSelect(plan.plan_key)}
          disabled={isDisabled}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer
            ${
              isActive && !isExpired
                ? "bg-emerald-600/80 text-white !cursor-default" 
                : isDisabled
                ? "bg-gray-700/50 text-gray-400 !cursor-not-allowed"
                : plan.popular
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                : "bg-white/10 hover:bg-white/20 text-white"
            }
          `}
        >
          <span>{buttonText}</span>
          {isActive && !isExpired ? (
            <CircleCheckBig className="w-5 h-5" />
          ) : (
            <Zap className={`w-5 h-5 ${isDisabled ? 'text-gray-500' : 'text-white'}`} />
          )}
        </button>
      </div>
    </div>
  );
};