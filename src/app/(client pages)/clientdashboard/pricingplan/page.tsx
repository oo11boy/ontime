"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HeaderSection } from "./components/HeaderSection";

import Loading from "../components/Loading";
import Footer from "../components/Footer/Footer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { usePlans, usePurchasePlan } from "@/hooks/usePlans";
import { useDashboard } from "@/hooks/useDashboard";
import { usePayment } from "@/hooks/usePayment";
import { Loader2, X, CreditCard, ShieldCheck } from "lucide-react";
import { PlansList } from "./components/PlansList";
import { DashboardHeader } from "../components/DashboardHeader";

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
  const isExpired = searchParams.get("expired") === "true";

  const { data: plansData, isLoading: plansLoading, error: plansError } = usePlans();
  const { data: dashboardData } = useDashboard();
  const { mutate: purchasePlan, isPending: isActivatingFree } = usePurchasePlan();
  const { startPayment, isPending: isRedirectingToGateway } = usePayment();

  const [error, setError] = useState<string | null>(null);
  const [activePlanKey, setActivePlanKey] = useState<string>("");
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState<boolean>(false);
  
  // States برای مدیریت مودال و لودینگ اختصاصی
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (dashboardData?.user) {
      setActivePlanKey(dashboardData.user.plan_key || "");
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

  const processedPlans: Plan[] = (plansData?.plans || []).map((plan: PlanData) => ({
    ...plan,
    discountPer100:
      plan.price_per_100_sms < REFERENCE_PRICE
        ? Math.round(((REFERENCE_PRICE - plan.price_per_100_sms) / REFERENCE_PRICE) * 100)
        : 0,
    popular: plan.plan_key === "pro",
  }));

  const handlePlanSelection = (planKey: string) => {
    const plan = processedPlans.find((p) => p.plan_key === planKey);
    if (!plan) return;

    if (planKey === activePlanKey && !isExpired) {
      setError("اشتراک فعلی شما هنوز معتبر است.");
      return;
    }
    if (planKey === "free_trial" && hasUsedFreeTrial) {
      setError("شما قبلاً از دوره آزمایشی رایگان استفاده کرده‌اید.");
      return;
    }

    setError(null);
    setSelectedPlanForModal(plan);
  };

  const confirmAndPay = async () => {
    if (!selectedPlanForModal) return;
    setIsProcessing(true);

    if (selectedPlanForModal.plan_key === "free_trial") {
      purchasePlan(
        {
          plan_id: selectedPlanForModal.id,
          purchase_type: "free_trial",
          amount_paid: 0,
          sms_amount: selectedPlanForModal.free_sms_month,
        },
        {
          onSuccess: () => {
            saveUserStatus({ active_plan_key: "free_trial", has_used_free_trial: true });
            window.location.href = "/clientdashboard";
          },
          onError: (err: any) => {
            setError(err.message || "خطا در فعالسازی.");
            setIsProcessing(false);
            setSelectedPlanForModal(null);
          },
        }
      );
    } else {
      await startPayment(
        selectedPlanForModal.monthly_fee,
        "plan",
        selectedPlanForModal.id,
        `فعالسازی پلن ${selectedPlanForModal.title}`
      );
      // هندل کردن خطا احتمالی در هوک پرداخت
    }
  };

  if (plansLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1e26] to-[#242933] text-white pb-24 ">
   <DashboardHeader/>
      <div className="max-w-md mx-auto px-4 py-8">
        {isExpired && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-6 text-center text-sm">
            اشتراک شما به پایان رسیده است. لطفاً پلن خود را تمدید کنید.
          </div>
        )}

        <HeaderSection />

        <PlansList
          plans={processedPlans}
          activePlanKey={activePlanKey}
          hasUsedFreeTrial={hasUsedFreeTrial}
          formatPrice={formatPrice}
          onSelectPlan={handlePlanSelection}
          isExpired={isExpired}
        />
      </div>

      {/* مودال تایید پرداخت */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-18 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#242933] w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">تایید نهایی خرید</h3>
                <button onClick={() => !isProcessing && setSelectedPlanForModal(null)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                  <span className="text-gray-400">پلن انتخابی:</span>
                  <span className="font-bold text-emerald-400">{selectedPlanForModal.title}</span>
                </div>
                <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                  <span className="text-gray-400">مبلغ قابل پرداخت:</span>
                  <span className="font-bold text-xl">
                    {selectedPlanForModal.monthly_fee === 0 ? "رایگان" : `${formatPrice(selectedPlanForModal.monthly_fee)} تومان`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 px-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>پرداخت امن از طریق درگاه رسمی زیبال</span>
                </div>
              </div>

              <button
                onClick={confirmAndPay}
                disabled={isProcessing}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>{selectedPlanForModal.monthly_fee === 0 ? "فعالسازی رایگان" : "اتصال به درگاه پرداخت"}</span>
                    <CreditCard className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-10 left-4 right-4 z-[60] animate-bounce">
          <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg flex justify-between items-center">
             <span>{error}</span>
             <button onClick={() => setError(null)}><X className="w-5 h-5"/></button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}