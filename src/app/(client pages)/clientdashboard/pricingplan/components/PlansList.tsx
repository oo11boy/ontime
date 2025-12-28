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
        const isCurrentPlan = plan.plan_key === activePlanKey;
        
        return (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={isCurrentPlan}
            hasUsedFreeTrial={hasUsedFreeTrial} // نام پراپ را اینجا هماهنگ کردیم
            formatPrice={formatPrice}
            onSelect={onSelectPlan}
            isExpired={isExpired}
          />
        );
      })}
    </div>
  );
};