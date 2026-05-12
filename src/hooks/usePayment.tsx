// src/hooks/usePayment.ts
import { useState } from "react";
import toast from "react-hot-toast";
import { detectPlatform } from "@/lib/platform";

export const usePayment = () => {
  const [isPending, setIsPending] = useState(false);

  const startPayment = async (amount: number, type: 'plan' | 'sms', itemId: number | string, desc: string) => {
    setIsPending(true);
    
    // تشخیص پلتفرم (وب یا کافه بازار)
    const platform = detectPlatform();
    
    try {
      const res = await fetch("/api/client/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          type, 
          item_id: itemId, 
          description: desc,
          platform 
        }),
      });
      
      const data = await res.json();
      
      // ========== درگاه کافه بازار (فقط در اپ) ==========
      if (data.gateway === 'cafebazaar') {
        if ((window as any).bazaarPaymentHandler) {
          (window as any).bazaarPaymentHandler.initiatePayment(data.sku, data.trackId);
        } else {
          toast.error("پرداخت در این محیط پشتیبانی نمی‌شود.");
          setIsPending(false);
        }
      } 
      // ========== درگاه زیبال (وب عادی) ==========
      else if (data.trackId) {
        window.location.href = `https://gateway.zibal.ir/start/${data.trackId}`;
      } 
      else {
        toast.error(data.message || "خطا در اتصال به درگاه");
        setIsPending(false);
      }
    } catch {
      toast.error("خطای شبکه");
      setIsPending(false);
    }
  };

  return { startPayment, isPending };
};