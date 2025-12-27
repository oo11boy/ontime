import React from "react";
import { PlanCard } from "./PlanCard";

interface Plan {
  id: number;
  plan_key: string;
  title: string;
  monthly_fee: number;
  free_sms_month: number;
  price_per_100_sms: number;
  discountPer100: number;
  popular: boolean;
}

interface PlansListProps {
  plans: Plan[];
  activePlanKey: string;
  hasUsedFreeTrial: boolean;
  formatPrice: (price: number) => string;
  onSelectPlan: (planKey: string) => void;
  isExpired: boolean;
}

export const PlansList: React.FC<PlansListProps> = ({
  plans,
  activePlanKey,
  hasUsedFreeTrial,
  formatPrice,
  onSelectPlan,
  isExpired,
}) => {
  return (
    <div className="space-y-5">
      {plans.map((plan) => {
        const isFreeTrial = plan.plan_key === "free_trial";
        const isCurrentPlan = plan.plan_key === activePlanKey;

        // منطق تعیین متن دکمه و وضعیت فعال/غیرفعال بودن
        let buttonText = "انتخاب پلن";
        let isPermanentlyDisabled = false;

        if (isCurrentPlan) {
          if (isExpired) {
            // سناریو: کاربر روی این پلن بوده و زمانش تمام شده
            if (isFreeTrial) {
              // پلن رایگان تمام شده -> دیگر هرگز قابل انتخاب نیست
              buttonText = "استفاده شده";
              isPermanentlyDisabled = true;
            } else {
              // پلن پولی تمام شده -> باید بتواند تمدید کند
              buttonText = "تمدید اشتراک";
              isPermanentlyDisabled = false; // دکمه فعال می‌شود
            }
          } else {
            // سناریو: پلن فعلی است و هنوز انقضا نیافته
            buttonText = "پلن فعلی";
            isPermanentlyDisabled = true;
          }
        } else {
          // سناریو: پلنی که پلن فعلی کاربر نیست
          if (isFreeTrial && hasUsedFreeTrial) {
            // اگر قبلاً از پلن رایگان استفاده کرده، دیگر نمی‌تواند آن را ببیند/انتخاب کند
            buttonText = "استفاده شده";
            isPermanentlyDisabled = true;
          } else {
            // سایر پلن‌های پولی که پلن فعلی او نیستند، همیشه باز هستند
            buttonText = "انتخاب پلن";
            isPermanentlyDisabled = false;
          }
        }

        return (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={isCurrentPlan}
            isPermanentlyDisabled={isPermanentlyDisabled}
            hasUsedFreeTrial={hasUsedFreeTrial}
            formatPrice={formatPrice}
            onSelect={onSelectPlan}
            isExpired={isExpired} // برای استفاده در منطق داخلی PlanCard
          />
        );
      })}
    </div>
  );
};