// src/app/clientdashboard/payment/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { detectPlatform } from "@/lib/platform";
import { DashboardHeader } from "../../components/DashboardHeader";
import Footer from "../../components/Footer/Footer";

// کامپوننت اصلی صفحه پرداخت
export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const type = searchParams.get("type") || "sms";
  const itemId = searchParams.get("item_id") || "100";

  const handlePayment = async () => {
    setLoading(true);
    const platform = detectPlatform();
    
    try {
      const res = await fetch("/api/client/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: type, 
          item_id: parseInt(itemId), 
          platform,
          description: `خرید ${type === "sms" ? "پیامک" : "پلن"}`
        }),
      });
      
      const data = await res.json();

      if (data.gateway === 'cafebazaar') {
        // پرداخت از طریق کافه بازار
        if ((window as any).bazaarPaymentHandler) {
          (window as any).bazaarPaymentHandler.initiatePayment(data.sku, data.trackId);
        } else {
          alert("پرداخت در این محیط پشتیبانی نمی‌شود. لطفاً از نسخه وب استفاده کنید.");
          setLoading(false);
        }
      } 
      else if (data.gateway === 'zibal') {
        // پرداخت از طریق زیبال
        window.location.href = data.gatewayUrl;
      }
      else {
        alert("خطا در ارتباط با درگاه پرداخت");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("خطا در ارتباط با سرور");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white max-w-md mx-auto relative">
      <DashboardHeader />
      <div className="bg-[#1a1e26] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#242933] rounded-3xl p-8 border border-white/5 shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            تأیید و پرداخت
          </h1>
          <p className="text-gray-400 mb-8">
            {type === "sms" ? `خرید بسته ${itemId} پیامکی` : "خرید اشتراک ویژه"}
          </p>
          
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#07A375] text-white py-4 rounded-2xl font-bold transition-all hover:bg-[#059669] disabled:opacity-50"
          >
            {loading ? "در حال اتصال به درگاه..." : "پرداخت"}
          </button>
          
          <button
            onClick={() => router.back()}
            className="mt-4 text-gray-400 text-sm hover:text-white transition-colors"
          >
            بازگشت
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

