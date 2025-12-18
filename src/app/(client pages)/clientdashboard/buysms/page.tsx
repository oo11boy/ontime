// src/app/(client pages)/clientdashboard/buysms/page.tsx (کامپوننت اصلی)
"use client";

import  { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Footer from "../components/Footer/Footer";
import { LoadingScreen } from "./components/LoadingScreen";
import { HeaderSection } from "./components/HeaderSection";
import { SelectedPackage } from "./components/SelectedPackage";
import { PackagesGrid } from "./components/PackagesGrid";
import { PurchaseButton } from "./components/PurchaseButton";

interface SMSOption {
  count: number;
}

export default function BuySMSPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPlan, setFetchingPlan] = useState(true);
  const [pricePer100, setPricePer100] = useState<number>(45000);
  const [smsOptions, setSmsOptions] = useState<SMSOption[]>([]);
  const [fetchingPacks, setFetchingPacks] = useState(true);
  const defaultPrice = 45000;

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // تابع دریافت بسته‌های پیامکی
  const fetchSMSPacks = async () => {
    try {
      const res = await fetch("/api/client/sms-packs-list");

      if (res.ok) {
        const data = await res.json();
        const packs: SMSOption[] = data.sms_packs
          .filter((pack: any) => pack.isActive === true)
          .map((pack: any) => ({
            count: pack.count,
          }))
          .sort((a: SMSOption, b: SMSOption) => a.count - b.count);

        setSmsOptions(packs);

        if (packs.length === 0) {
          toast("هیچ بسته پیامکی فعالی یافت نشد.", { icon: "Info" });
        }
      } else {
        throw new Error("Failed to fetch SMS packs");
      }
    } catch (error) {
      console.error("خطا در دریافت بسته‌های پیامکی:", error);
      toast.error("خطا در بارگذاری بسته‌های پیامکی.");
    } finally {
      setFetchingPacks(false);
    }
  };

  // تابع دریافت قیمت پلن کاربر
  const fetchUserPlanPrice = async () => {
    try {
      const res = await fetch("/api/client/dashboard", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const userPrice = data.user?.price_per_100_sms;
        if (userPrice !== undefined && userPrice > 0) {
          setPricePer100(userPrice);
        }
      } else {
        console.warn(
          "خطا در دریافت اطلاعات پلن، از قیمت پیش‌فرض استفاده می‌شود"
        );
      }
    } catch (error) {
      console.error("خطا در دریافت قیمت پلن:", error);
    } finally {
      setFetchingPlan(false);
    }
  };

  useEffect(() => {
    fetchSMSPacks();
    fetchUserPlanPrice();
  }, []);

  // تابع هندل خرید
  const handlePurchase = async () => {
    if (!selected || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/client/buy-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          sms_count: selected,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `درخواست خرید ${selected.toLocaleString("fa-IR")} پیامک ثبت شد. در حال انتقال به صفحه پرداخت...`,
          { duration: 7000 }
        );
        setSelected(null);
      } else {
        toast.error(
          data.message || "خطا در خرید پیامک. لطفاً دوباره تلاش کنید."
        );
      }
    } catch (error) {
      console.error("خطا در ارتباط با سرور:", error);
      toast.error(
        "خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  // تابع انتخاب بسته
  const handleSelectPackage = (count: number) => {
    setSelected(count);
  };

  if (fetchingPlan || fetchingPacks) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen text-white overflow-auto max-w-md mx-auto">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white py-10 px-4 flex flex-col">
        <HeaderSection pricePer100={pricePer100} formatPrice={formatPrice} />

        <SelectedPackage
          selected={selected}
          pricePer100={pricePer100}
          formatPrice={formatPrice}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mx-auto mb-12">
          <PackagesGrid
            smsOptions={smsOptions}
            selected={selected}
            pricePer100={pricePer100}
            defaultPrice={defaultPrice}
            loading={loading}
            formatPrice={formatPrice}
            onSelectPackage={handleSelectPackage}
          />
        </div>

        <div className="mt-auto px-4 pb-6">
          <PurchaseButton
            selected={selected}
            loading={loading}
            onPurchase={handlePurchase}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}