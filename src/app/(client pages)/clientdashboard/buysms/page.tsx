"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Footer from "../components/Footer/Footer";
import { LoadingScreen } from "./components/LoadingScreen";
import { HeaderSection } from "./components/HeaderSection";
import { SelectedPackage } from "./components/SelectedPackage";
import { PackagesGrid } from "./components/PackagesGrid";
import { PurchaseButton } from "./components/PurchaseButton";

// استفاده از هوک‌های مورد نظر شما
import { useBuySms, useSmsPacks } from "@/hooks/useSms";
import { useDashboard } from "@/hooks/useDashboard";

export default function BuySMSPage() {
  const [selected, setSelected] = useState<number | null>(null);

  // 1. دریافت دیتای جامع دشبورد
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();

  // 2. دریافت لیست بسته‌های فعال
  const { data: packsData, isLoading: isPacksLoading } = useSmsPacks();

  // 3. هوک خرید (با قابلیت آپدیت خودکار دشبورد پس از موفقیت)
  const { mutate: buySms, isPending: isPurchasing } = useBuySms();

  // --- محاسبات داینامیک موجودی و قیمت ---
  
  // محاسبه کل موجودی: (اعتبار طرح اصلی + مجموع باقی‌مانده بسته‌ها)
  const totalBalance = useMemo(() => {
    if (!dashboardData?.user) return 0;
    
    const planBalance = dashboardData.user.sms_balance || 0;
    const packagesBalance = dashboardData.user.purchased_packages?.reduce(
      (sum, pkg) => sum + (pkg.remaining_sms || 0),
      0
    ) || 0;
    
    return planBalance + packagesBalance;
  }, [dashboardData]);

  // استخراج قیمت هر 100 پیامک از پلن کاربر
  const pricePer100 = dashboardData?.user?.price_per_100_sms || 45000;
  const smsOptions = packsData?.sms_packs || [];

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // تابع عملیات خرید
  const handlePurchase = () => {
    if (!selected) {
      toast.error("لطفاً یک بسته انتخاب کنید.");
      return;
    }

    buySms(
      { sms_count: selected },
      {
        onSuccess: () => {
          toast.success(`خرید ${selected.toLocaleString("fa-IR")} پیامک با موفقیت انجام شد.`);
          setSelected(null);
          // چون useBuySms کلید ["dashboard"] را نامعتبر می‌کند، 
          // هوک useDashboard دوباره اجرا شده و totalBalance خودکار آپدیت می‌شود.
        },
        onError: (err: any) => {
          toast.error(err.message || "خطا در خرید.");
        },
      }
    );
  };

  if (isDashboardLoading || isPacksLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen text-white max-w-md mx-auto relative">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white py-10 px-4 flex flex-col">
        
        {/* هدر با موجودی زنده */}
        <HeaderSection
          pricePer100={pricePer100}
          formatPrice={formatPrice}
          currentBalance={totalBalance}
        />

        <SelectedPackage
          selected={selected}
          pricePer100={pricePer100}
          formatPrice={formatPrice}
        />

        <div className="grid grid-cols-1 gap-6 w-full max-w-lg mx-auto mb-12">
          <PackagesGrid
            smsOptions={smsOptions}
            selected={selected}
            pricePer100={pricePer100}
            defaultPrice={45000}
            loading={isPurchasing}
            formatPrice={formatPrice}
            onSelectPackage={(count) => setSelected(count)}
          />
        </div>

        <div className="mt-auto px-4 pb-6">
          <PurchaseButton
            selected={selected}
            loading={isPurchasing}
            onPurchase={handlePurchase}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}