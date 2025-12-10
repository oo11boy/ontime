"use client";

import React, { useState, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Footer from "../components/Footer/Footer";

interface UserPlanInfo {
  price_per_100_sms: number;
}

const smsOptions = [
  { count: 100 },
  { count: 200 },
  { count: 300 },
  { count: 500 },
  { count: 1000 },
  { count: 2000 },
];

export default function BuySMSPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPlan, setFetchingPlan] = useState(true);
  const [pricePer100, setPricePer100] = useState<number>(45000); // پیش‌فرض

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // دریافت قیمت پلن فعلی کاربر
  useEffect(() => {
    const fetchUserPlanPrice = async () => {
      try {
        const res = await fetch("/api/dashboard", {
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

    fetchUserPlanPrice();
  }, []);

  const handlePurchase = async () => {
    if (!selected || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/buy-sms", {
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
          `${selected} پیامک با موفقیت خریداری شد!\nقیمت هر ۱۰۰ پیامک: ${formatPrice(
            pricePer100
          )} تومان`,
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

  if (fetchingPlan) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="h-screen text-white overflow-auto max-w-md mx-auto">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white py-10 px-4 flex flex-col">
        {/* عنوان */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
          خرید پیامک اضافه
        </h1>

        {/* نمایش قیمت بر اساس پلن */}
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-400">
            قیمت هر ۱۰۰ پیامک بر اساس پلن شما:
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatPrice(pricePer100)} تومان
          </p>
        </div>

        {/* خلاصه بسته انتخاب‌شده */}
        {selected && (
          <div className="mb-8 text-center bg-white/5 rounded-2xl py-4 px-6">
            <p className="text-lg">
              بسته انتخاب‌شده:{" "}
              <span className="font-bold text-emerald-400">
                {selected.toLocaleString("fa-IR")} پیامک
              </span>
              {" — "}
              <span className="font-bold text-emerald-400">
                {formatPrice(Math.round((selected / 100) * pricePer100))} تومان
              </span>
            </p>
          </div>
        )}

        {/* لیست بسته‌ها */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mb-12">
          {smsOptions.map((option) => {
            const totalPrice = Math.round((option.count / 100) * pricePer100);
            const isSelected = selected === option.count;

            return (
              <div
                key={option.count}
                onClick={() => !loading && setSelected(option.count)}
                className={`relative cursor-pointer rounded-3xl p-6 flex flex-col items-center gap-4 text-center transition-all border-2 ${
                  isSelected
                    ? "border-emerald-500 shadow-2xl shadow-emerald-500/30 bg-white/10 scale-105"
                    : "border-white/10 hover:border-emerald-500/60 hover:shadow-xl hover:bg-white/5"
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {/* علامت تیک انتخاب */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                <div className="text-2xl font-bold">
                  {option.count.toLocaleString("fa-IR")} پیامک
                </div>

                <div className="text-3xl font-bold text-white">
                  {formatPrice(totalPrice)}
                </div>

                <div className="text-sm text-gray-400">تومان</div>

                {pricePer100 < 45000 && (
                  <div className="text-xs text-emerald-400 mt-1">
                    تخفیف‌دار (
                    {Math.round(((45000 - pricePer100) / 45000) * 100)}%)
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-6">
                  اعتبار: ۳۰ روز از تاریخ خرید
                </div>
              </div>
            );
          })}
        </div>

        {/* دکمه خرید ثابت در پایین */}
        <div className="mt-auto px-4 pb-6">
          <button
            onClick={handlePurchase}
            disabled={!selected || loading}
            className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-white text-lg transition-all active:scale-95 shadow-2xl ${
              selected && !loading
                ? "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                : "bg-white/10 opacity-60 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span>در حال پردازش...</span>
              </>
            ) : (
              <>
                <span>تأیید و پرداخت</span>
                {selected && <Zap className="w-7 h-7" />}
              </>
            )}
          </button>

          <div className="mt-4 text-center text-sm text-gray-400">
            <p>پرداخت امن از طریق درگاه بانکی</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
