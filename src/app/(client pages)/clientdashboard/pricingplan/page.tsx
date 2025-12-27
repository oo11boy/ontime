"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  
  // تبدیل مقدار string به boolean واقعی برای جلوگیری از خطای شرطی
  const isExpired = searchParams.get("expired") === "true";

  // React Query Hooks
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = usePlans();
  const { data: dashboardData } = useDashboard();
  const { mutate: purchasePlan, isPending: isPurchasing } = usePurchasePlan();

  const [error, setError] = useState<string | null>(null);
  const [activePlanKey, setActivePlanKey] = useState<string>("");
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState<boolean>(false);

  // سینک کردن وضعیت با داده‌های دیتابیس
  useEffect(() => {
    if (dashboardData?.user) {
      setActivePlanKey(dashboardData.user.plan_key || "");
      // اولویت با دیتای دیتابیس است
      setHasUsedFreeTrial(
        dashboardData.user.has_used_free_trial || 
        userStatus.has_used_free_trial || 
        false
      );
    }
  }, [dashboardData, userStatus.has_used_free_trial]);

const REFERENCE_PRICE = 45000;

 const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // پردازش داده‌های پلن‌ها
  const processedPlans: Plan[] = (plansData?.plans || []).map(
    (plan: PlanData) => ({
      ...plan,
      discountPer100:
        plan.price_per_100_sms < REFERENCE_PRICE
          ? Math.round(
              ((REFERENCE_PRICE - plan.price_per_100_sms) / REFERENCE_PRICE) *
                100
            )
          : 0,
      popular: plan.plan_key === "pro",
    })
  );
  // تابع انتخاب پلن
  const handleSelectPlan = async (planKey: string) => {
    const selectedPlan = processedPlans.find((p) => p.plan_key === planKey);

    if (!selectedPlan) return;

    // منطق تمدید: اگر پلن انتخابی همان پلن فعلی است، فقط در صورتی اجازه بده که منقضی شده باشد
    const isTryingToRenew = planKey === activePlanKey;
    if (isTryingToRenew && !isExpired) {
      console.log("اشتراک فعلی شما هنوز معتبر است.");
      return;
    }

    // پلن رایگان تحت هیچ شرایطی نباید دوباره انتخاب شود (اگر قبلا استفاده شده)
    if (planKey === "free_trial" && hasUsedFreeTrial) {
      setError("شما قبلاً از دوره آزمایشی رایگان استفاده کرده‌اید و امکان فعالسازی مجدد آن وجود ندارد.");
      return;
    }

    setError(null);

    purchasePlan(
      {
        plan_id: selectedPlan.id,
        purchase_type:
          planKey === "free_trial" ? "free_trial" : "monthly_subscription",
        amount_paid: selectedPlan.monthly_fee,
        sms_amount: selectedPlan.free_sms_month,
      },
      {
        onSuccess: () => {
          setActivePlanKey(planKey);

          const newHasUsedTrial = hasUsedFreeTrial || planKey === "free_trial";
          setHasUsedFreeTrial(newHasUsedTrial);

          saveUserStatus({
            active_plan_key: planKey,
            has_used_free_trial: newHasUsedTrial,
          });

          // رفرش صفحه و هدایت به داشبورد
          window.location.href = "/clientdashboard";
        },
        onError: (err: any) => {
          setError(err.message || "خطا در فعالسازی پلن.");
        },
      }
    );
  };

  if (plansLoading || isPurchasing) {
    return <Loading />;
  }

  if (plansError || error) {
    return (
      <ErrorDisplay
        error={plansError?.message || error || "خطا در بارگذاری پلن‌ها"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1e26] to-[#242933] text-white pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        
        {/* هشدار اتمام اشتراک */}
        {isExpired && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-6 text-center text-sm animate-pulse">
            اشتراک شما به پایان رسیده است. برای استفاده از امکانات،
            لطفاً پلن خود را تمدید کنید یا پلن جدید بخرید.
          </div>
        )}

        <HeaderSection />

        <PlansList
          plans={processedPlans}
          activePlanKey={activePlanKey}
          hasUsedFreeTrial={hasUsedFreeTrial}
          formatPrice={formatPrice}
          onSelectPlan={handleSelectPlan}
          isExpired={isExpired}
        />
      </div>

      <Footer />
    </div>
  );
}