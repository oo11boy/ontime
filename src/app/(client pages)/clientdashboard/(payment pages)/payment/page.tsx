// src/app/clientdashboard/payment/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardHeader } from "../../components/DashboardHeader";
import Footer from "../../components/Footer/Footer";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const type = searchParams.get("type") || "sms";
  const itemId = searchParams.get("item_id") || "100";

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const res = await fetch("/api/client/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: type, 
          item_id: parseInt(itemId), 
          description: `خرید ${type === "sms" ? "پیامک" : "پلن"}`
        }),
      });
      
      const data = await res.json();

      if (data.success && data.trackId) {
        window.location.href = data.gatewayUrl;
      } else {
        alert(data.message || "خطا در ارتباط با درگاه پرداخت");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("خطا در ارتباط با سرور");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a1e26] text-slate-800 dark:text-white max-w-md mx-auto relative transition-colors">
      <DashboardHeader />
      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#242933] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            تأیید و پرداخت
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mb-8">
            {type === "sms" ? `خرید بسته ${itemId} پیامکی` : "خرید اشتراک ویژه"}
          </p>
          
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
          >
            {loading ? "در حال اتصال به درگاه..." : "پرداخت از طریق زیبال"}
          </button>
          
          <button
            onClick={() => router.back()}
            className="mt-4 text-slate-500 dark:text-gray-400 text-sm hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            بازگشت
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}