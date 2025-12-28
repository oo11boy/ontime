"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Footer from "../components/Footer/Footer";
import { LoadingScreen } from "./components/LoadingScreen";
import { HeaderSection } from "./components/HeaderSection";
import { PackagesGrid } from "./components/PackagesGrid";
import { PurchaseButton } from "./components/PurchaseButton";

import { useSmsPacks } from "@/hooks/useSms";
import { useDashboard } from "@/hooks/useDashboard";
import { usePayment } from "@/hooks/usePayment";

export default function BuySMSPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();
  const { data: packsData, isLoading: isPacksLoading } = useSmsPacks();
  const { startPayment, isPending: isRedirectingToGateway } = usePayment();

  const totalBalance = useMemo(() => {
    if (!dashboardData?.user) return 0;
    const planBalance = dashboardData.user.sms_balance || 0;
    const packagesBalance = dashboardData.user.purchased_packages?.reduce(
      (sum, pkg) => sum + (pkg.remaining_sms || 0),
      0
    ) || 0;
    return planBalance + packagesBalance;
  }, [dashboardData]);

  const pricePer100 = dashboardData?.user?.price_per_100_sms || 45000;
  const smsOptions = packsData?.sms_packs || [];

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

 const handlePurchase = async () => {
  if (!selected) {
    toast.error("لطفاً یک بسته انتخاب کنید.");
    return;
  }
  
  // ما دیگر قیمت را حساب نمی‌کنیم، فقط می‌گوییم چه بسته‌ای (مثلا ۵۰۰ تایی)
  await startPayment(
    0, // مبلغ توسط سرور جایگزین می‌شود
    "sms",
    selected, // مقدار عددی بسته مثل 100, 300, 500
    `خرید بسته ${selected.toLocaleString("fa-IR")} عددی پیامک`
  );
};

  if (isDashboardLoading || isPacksLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#1a1e26] text-white selection:bg-emerald-500/30 flex flex-col">
      {/* هدر ثابت */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-[#1a1e26] border-b border-white/10 px-4 pt-4 pb-3">
        <div className="max-w-md mx-auto">
          <HeaderSection
            pricePer100={pricePer100}
            formatPrice={formatPrice}
            currentBalance={totalBalance}
          />
        </div>
      </header>

      {/* محتوای اصلی - اسکرول‌شونده */}
      <main className="flex-1 overflow-auto pt-[140px] pb-[100px]">
        <div className="max-w-md w-full mx-auto px-4">
          <PackagesGrid
            smsOptions={smsOptions}
            selected={selected}
            pricePer100={pricePer100}
            defaultPrice={45000}
            loading={isRedirectingToGateway}
            formatPrice={formatPrice}
            onSelectPackage={(count) => setSelected(count)}
          />
        </div>
      </main>

      {/* دکمه خرید ثابت پایین */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-[#1a1e26] border-t border-white/10 px-4 py-4">
        <div className="max-w-md mx-auto">
          <PurchaseButton
            selected={selected}
            loading={isRedirectingToGateway}
            onPurchase={handlePurchase}
          />
        </div>
      </footer>


    </div>
  );
}