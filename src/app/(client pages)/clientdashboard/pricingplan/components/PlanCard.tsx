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
  isExpired: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isActive,
  hasUsedFreeTrial,
  formatPrice,
  onSelect,
  isExpired,
}) => {
  const isFreeTrial = plan.plan_key === "free_trial";

  let buttonText = "انتخاب پلن";
  let isDisabled = false;

  if (isActive) {
    if (isExpired) {
      if (isFreeTrial) {
        buttonText = "استفاده شده";
        isDisabled = true;
      } else {
        buttonText = "تمدید اشتراک";
        isDisabled = false;
      }
    } else {
      buttonText = "پلن فعلی شما";
      isDisabled = true;
    }
  } else {
    if (isFreeTrial && hasUsedFreeTrial) {
      buttonText = "استفاده شده";
      isDisabled = true;
    }
  }

  const features = [
    "سیستم نوبت‌دهی هوشمند",
    "سامانه پیامک خودکار",
    "دسترسی کامل به CRM",
  ];

  return (
    <div
      className={`relative bg-white/5 backdrop-blur-xl rounded-3xl border transition-all duration-300
        ${
          plan.popular
            ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            : "border-white/10"
        }
        ${!isDisabled ? "hover:bg-white/[0.08] cursor-pointer" : "opacity-80"}
      `}
      onClick={() => !isDisabled && onSelect(plan.plan_key)}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          پیشنهاد ویژه
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight">{plan.title}</h3>
          <div className="text-right">
            {plan.monthly_fee === 0 ? (
              <span className="text-2xl font-black text-emerald-400">
                رایگان
              </span>
            ) : (
              <div className="flex flex-col">
                <span className="text-2xl font-black">
                  {formatPrice(plan.monthly_fee)}
                </span>
                <span className="text-[10px] text-gray-400">
                  تومان / ماهانه
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-black/20 rounded-2xl border border-white/5">
          <div className="text-center">
            <div className="text-sm font-bold">
              {formatPrice(plan.free_sms_month)}
            </div>
            <div className="text-[9px] text-gray-500 uppercase">هدیه</div>
          </div>
          <div className="text-center border-x border-white/10">
            <div className="text-sm font-bold">
              {formatPrice(plan.price_per_100_sms)}
            </div>
            <div className="text-[9px] text-gray-500 uppercase">تعرفه</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-400">
              {plan.discountPer100}%
            </div>
            <div className="text-[9px] text-gray-500 uppercase">تخفیف</div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-300">{f}</span>
            </div>
          ))}
        </div>

        <button
          disabled={isDisabled}
          className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
            ${
              isActive && !isExpired
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : isDisabled
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-white text-black hover:bg-emerald-400 hover:scale-[1.02] active:scale-95"
            }
          `}
        >
          <span>{buttonText}</span>
          {isActive && !isExpired ? (
            <CircleCheckBig className="w-5 h-5" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
