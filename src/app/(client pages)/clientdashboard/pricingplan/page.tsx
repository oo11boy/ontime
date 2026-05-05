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
const [showComparisonModal, setShowComparisonModal] = useState(false);
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
  discountPer100: plan.price_per_100_sms < REFERENCE_PRICE 
    ? Math.round(((REFERENCE_PRICE - plan.price_per_100_sms) / REFERENCE_PRICE) * 100) 
    : 0,
  popular: plan.plan_key === "pro",
}));

const handlePlanSelection = (planKey: string) => {
  const plan = processedPlans.find((p) => p.plan_key === planKey);
  if (!plan) return;

  // اگر پلن رایگان بود و قبلاً استفاده شده بود، اجازه ادامه نده
  if (planKey === "free_trial" && hasUsedFreeTrial) {
    return; // دکمه غیرفعال است اما این برای اطمینان بیشتر است
  }

  if (planKey === activePlanKey && !isExpired) {
    setError("اشتراک فعلی شما هنوز معتبر است.");
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
<div className="flex justify-center mb-8">
  <button 
    onClick={() => setShowComparisonModal(true)}
    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-emerald-400 font-medium"
  >
    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    تفاوت پلن‌ها در چیست؟ (راهنمای خرید)
  </button>
</div>
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
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-4 pb-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
                 <div className="text-[12px] mt-8 text-gray-400">
                لطفا در صورتی که فیلترشکن شما فعال است قبل از پرداخت آن را خاموش کنید.
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
                    <span>{selectedPlanForModal.monthly_fee === 0 ? "فعالسازی رایگان" : "تایید و پرداخت نهایی"}</span>
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
{showComparisonModal && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-[#242933] w-full max-w-sm rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">کدام پلن به‌صرفه‌تر است؟</h3>
          </div>
          <button onClick={() => setShowComparisonModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
<div className="space-y-6 text-right leading-relaxed">
          <p className="text-gray-300 text-sm">
            خیلی ساده و خودمانی بخوام بگم، قیمت هر ۱۰۰ پیامک در تمام پلن‌ها <span className="text-white font-bold">۴۵ هزار تومنه</span>، اما راز صرفه‌جویی در <span className="text-emerald-400 font-bold">تعداد هدیه‌هاست!</span>
          </p>
<div className="bg-white/5 p-5 rounded-3xl border border-white/5 space-y-4">
            <p className="text-xs text-gray-400">یک مثال واقعی:</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-light">پلن پایه 150 پیامکی + خرید جداگانه 300 پیامک:</span>
                <span className="text-red-400">۳۲۵,۰۰۰ تومان</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 font-light">خرید مستقیم پلن طلایی دارای 450 پیامک:</span>
                <span className="text-emerald-400 text-lg">۲۸۰,۰۰۰ تومان</span>
              </div>
            </div>
          </div>
<p className="text-gray-400 text-[13px] bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
            💡 <span className="text-emerald-400">نتیجه‌گیری:</span> با انتخاب پلن بالاتر (مثل طلایی یا الماس)، شما پیامک‌ها را با تخفیف بسیار بالایی پیش‌خرید می‌کنید و دیگر نیازی به خرید بسته‌های گران‌قیمت شارژ مجدد ندارید.
          </p>
        </div>
<button
          onClick={() => setShowComparisonModal(false)}
          className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white transition-all"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  </div>
  )}
    
      <Footer />
    </div>
  );
}