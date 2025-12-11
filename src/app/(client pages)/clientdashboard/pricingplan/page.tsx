"use client";

import React, { useState, useEffect } from "react";
import { Check, CircleCheckBig, Zap, Crown } from "lucide-react";
import Footer from "../components/Footer/Footer";
import Loading from "../components/Loading";

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

interface PlanData {
  id: number;
  plan_key: string;
  title: string;
  monthly_fee: number;
  free_sms_month: number;
  price_per_100_sms: number;
}

interface UserStatus {
  active_plan_key: string;
  has_used_free_trial: boolean;
}

const storageKey = "user_plan_status";

const getInitialUserStatus = (): UserStatus => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
  }
  return { active_plan_key: "free_trial", has_used_free_trial: false };
};

const saveUserStatus = (status: UserStatus) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(status));
  }
};

export default function PricingPlans() {
  const initialStatus = getInitialUserStatus();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlanKey, setActivePlanKey] = useState<string>(
    initialStatus.active_plan_key
  );
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState<boolean>(
    initialStatus.has_used_free_trial
  );

  const basePricePer100 = 45000;

  useEffect(() => {
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

    fetchPlans();
  }, []);

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1a1e26] to-[#242933] px-6">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">خطا:</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* عنوان */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">انتخاب پلن ماهانه</h2>
          <p className="text-gray-400 text-sm mt-2">
            بهترین گزینه را برای کسب‌وکارتان انتخاب کنید
          </p>
        </div>

        {/* لیست پلن‌ها - کارت‌های جمع‌وجور افقی */}
        <div className="space-y-5">
          {plans.map((plan) => {
            const isFreeTrial = plan.plan_key === "free_trial";
            const isActive = plan.plan_key === activePlanKey;
            const isPermanentlyDisabled =
              isFreeTrial && hasUsedFreeTrial && !isActive;
            const isDisabled = isActive || isPermanentlyDisabled;

            let buttonText = "فعالسازی";
            if (isActive) buttonText = "پلن فعلی";
            if (isPermanentlyDisabled) buttonText = "استفاده شده";

            return (
              <div
                key={plan.id}
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
                        <p className="text-emerald-400 text-xs mt-1">
                          توصیه شده
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {plan.monthly_fee === 0 ? (
                        <span className="text-2xl font-bold text-emerald-400">
                          رایگان
                        </span>
                      ) : (
                        <div>
                          <span className="text-2xl font-bold">
                            {formatPrice(plan.monthly_fee)}
                          </span>
                          <span className="text-xs text-gray-400 mr-1">
                            هزار تومان
                          </span>
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
                    {["سیستم نوبت‌دهی", "سامانه پیامکی", "دسترسی به CRM"].map(
                      (feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      )
                    )}
                  </div>

                  {/* دکمه */}
                  <button
                    onClick={() => handleSelectPlan(plan.plan_key)}
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
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
