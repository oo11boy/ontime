// components/PricingPlan/PlanCard.tsx
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
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isActive,
  isPermanentlyDisabled,
  hasUsedFreeTrial,
  formatPrice,
  onSelect,
}) => {
  const isFreeTrial = plan.plan_key === "free_trial";
  const isDisabled = isActive || isPermanentlyDisabled;

  let buttonText = "فعالسازی";
  if (isActive) buttonText = "پلن فعلی";
  if (isPermanentlyDisabled) buttonText = "استفاده شده";

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
          !isDisabled && !isActive
            ? "hover:border-white/20 hover:shadow-lg"
            : ""
        }
      `}
    >
      <div className="p-5">
        {/* عنوان و قیمت */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{plan.title}</h3>
            {plan.popular && (
              <p className="text-emerald-400 text-xs mt-1">توصیه شده</p>
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
            <div className="text-lg font-bold">
              {formatPrice(plan.free_sms_month)}
            </div>
            <div className="text-xs text-gray-400">پیامک رایگان</div>
          </div>
          <div>
            <div className="text-lg font-bold">
              {formatPrice(plan.price_per_100_sms)}
            </div>
            <div className="text-xs text-gray-400">هر ۱۰۰ پیامک</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400">
              {plan.discountPer100}%
            </div>
            <div className="text-xs text-gray-400">تخفیف</div>
          </div>
        </div>

        {/* امکانات */}
        <div className="space-y-2.5 mb-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* دکمه */}
        <button
          onClick={() => onSelect(plan.plan_key)}
          disabled={isDisabled}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
            ${
              isActive
                ? "bg-emerald-600/80 text-white cursor-default"
                : isPermanentlyDisabled
                ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                : plan.popular
                ? "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg active:scale-98"
                : "bg-white/10 hover:bg-white/20 active:scale-98"
            }
          `}
        >
          <span>{buttonText}</span>
          {isActive ? (
            <CircleCheckBig className="w-5 h-5" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};