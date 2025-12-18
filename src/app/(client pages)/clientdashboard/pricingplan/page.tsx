// src/app/(client pages)/clientdashboard/pricingplan/page.tsx (کامپوننت اصلی)
"use client";

import  { useState, useEffect } from "react";
import { HeaderSection } from "./components/HeaderSection";
import { PlansList } from "./components/PlansList";
import { ErrorDisplay } from "./components/ErrorDisplay";
import Loading from "../components/Loading";
import Footer from "../components/Footer/Footer";
import { useLocalStorage } from "./hooks/useLocalStorage";

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
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlanKey, setActivePlanKey] = useState<string>(
    userStatus.active_plan_key
  );
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState<boolean>(
    userStatus.has_used_free_trial
  );

  const basePricePer100 = 45000;

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // تابع دریافت لیست پلن‌ها
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/client/plans/list");
      if (!response.ok) throw new Error("Failed to fetch plans list.");

      const data = await response.json();
      const fetchedPlans: PlanData[] = data.plans || [];

      const processedPlans: Plan[] = fetchedPlans.map((plan: PlanData) => ({
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

      setPlans(processedPlans);
    } catch (err: any) {
      setError(err.message || "خطا در بارگذاری پلن‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // تابع انتخاب پلن
  const handleSelectPlan = async (planKey: string) => {
    const selectedPlan = plans.find((p) => p.plan_key === planKey);
    if (!selectedPlan || planKey === activePlanKey) return;

    if (planKey === "free_trial" && hasUsedFreeTrial) {
      setError("شما قبلاً از دوره آزمایشی رایگان استفاده کرده‌اید.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const wasOnFreeTrial = activePlanKey === "free_trial";

    try {
      const response = await fetch("/api/client/plans/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          purchase_type:
            planKey === "free_trial" ? "free_trial" : "monthly_subscription",
          amount_paid: selectedPlan.monthly_fee,
          sms_amount: selectedPlan.free_sms_month,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "عملیات فعالسازی پلن با شکست مواجه شد."
        );
      }

      setActivePlanKey(planKey);

      if (wasOnFreeTrial && planKey !== "free_trial") {
        setHasUsedFreeTrial(true);
      }

      saveUserStatus({
        active_plan_key: planKey,
        has_used_free_trial:
          wasOnFreeTrial && planKey !== "free_trial" ? true : hasUsedFreeTrial,
      });
    } catch (err: any) {
      setError(err.message || "خطا در فعالسازی پلن.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <HeaderSection />
        
        <PlansList
          plans={plans}
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