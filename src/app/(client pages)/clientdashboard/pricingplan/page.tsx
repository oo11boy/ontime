// src/app/(client pages)/clientdashboard/pricingplan/page.tsx
"use client";

import { useState } from "react";
import { HeaderSection } from "./components/HeaderSection";
import { PlansList } from "./components/PlansList";
import { ErrorDisplay } from "./components/ErrorDisplay";
import Loading from "../components/Loading";
import Footer from "../components/Footer/Footer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { usePlans, usePurchasePlan } from "@/hooks/usePlans";
import { useDashboard } from "@/hooks/useDashboard";

interface PlanData {
  id: number;
  plan_key: string;
  title: string;
  monthly_fee: number;
  free_sms_month: number;
  price_per_100_sms: number;
}

interface Plan extends PlanData {
  discountPer100: number;
  popular: boolean;
}

export default function PricingPlans() {
  const { userStatus, saveUserStatus } = useLocalStorage();
  
  // React Query Hooks
  const { data: plansData, isLoading: plansLoading, error: plansError } = usePlans();
  const { data: dashboardData } = useDashboard();
  const { mutate: purchasePlan, isPending: isPurchasing } = usePurchasePlan();
  
  const [error, setError] = useState<string | null>(null);
  const [activePlanKey, setActivePlanKey] = useState<string>(
    userStatus.active_plan_key || dashboardData?.user?.plan_key || ""
  );
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState<boolean>(
    userStatus.has_used_free_trial || false
  );

  const basePricePer100 = 45000;

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // پردازش داده‌های پلن‌ها
  const processedPlans: Plan[] = (plansData?.plans || []).map((plan: PlanData) => ({
    ...plan,
    discountPer100:
      plan.price_per_100_sms < basePricePer100
        ? Math.round(
            ((basePricePer100 - plan.price_per_100_sms) /
              basePricePer100) *
              100
          )
        : 0,
    popular: plan.plan_key === "pro",
  }));

  // تابع انتخاب پلن
  const handleSelectPlan = async (planKey: string) => {
    const selectedPlan = processedPlans.find((p) => p.plan_key === planKey);
    if (!selectedPlan || planKey === activePlanKey) return;

    if (planKey === "free_trial" && hasUsedFreeTrial) {
      setError("شما قبلاً از دوره آزمایشی رایگان استفاده کرده‌اید.");
      return;
    }

    setError(null);
    const wasOnFreeTrial = activePlanKey === "free_trial";

    purchasePlan({
      plan_id: selectedPlan.id,
      purchase_type: planKey === "free_trial" ? "free_trial" : "monthly_subscription",
      amount_paid: selectedPlan.monthly_fee,
      sms_amount: selectedPlan.free_sms_month,
    }, {
      onSuccess: () => {
        setActivePlanKey(planKey);

        if (wasOnFreeTrial && planKey !== "free_trial") {
          setHasUsedFreeTrial(true);
        }

        saveUserStatus({
          active_plan_key: planKey,
          has_used_free_trial:
            wasOnFreeTrial && planKey !== "free_trial" ? true : hasUsedFreeTrial,
        });
      },
      onError: (err: any) => {
        setError(err.message || "خطا در فعالسازی پلن.");
      },
    });
  };

  if (plansLoading || isPurchasing) {
    return <Loading />;
  }

  if (plansError || error) {
    return <ErrorDisplay error={plansError?.message || error || "خطا در بارگذاری پلن‌ها"} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <HeaderSection />
        
        <PlansList
          plans={processedPlans}
          activePlanKey={activePlanKey}
          hasUsedFreeTrial={hasUsedFreeTrial}
          formatPrice={formatPrice}
          onSelectPlan={handleSelectPlan}
        />
      </div>

      <Footer />
    </div>
  );
}