// src/hooks/usePayment.ts
import { useState } from "react";
import toast from "react-hot-toast";

export const usePayment = () => {
  const [isPending, setIsPending] = useState(false);

  const startPayment = async (amount: number, type: 'plan' | 'sms', itemId: number | string, desc: string) => {
    setIsPending(true);
    
    try {
      const res = await fetch("/api/client/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          type, 
          item_id: itemId, 
          description: desc,
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.trackId) {
        // هدایت به درگاه زیبال
        window.location.href = data.gatewayUrl || `https://gateway.zibal.ir/start/${data.trackId}`;
      } else {
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