import { useState } from "react";
import toast from "react-hot-toast";

export const usePayment = () => {
  const [isPending, setIsPending] = useState(false);

  const startPayment = async (amount: number, type: 'plan' | 'sms', itemId: number, desc: string) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/client/payment/request", {
        method: "POST",
        body: JSON.stringify({ amount, type, item_id: itemId, description: desc }),
      });
      const data = await res.json();
      if (data.trackId) {
        window.location.href = `https://gateway.zibal.ir/start/${data.trackId}`;
      } else {
        toast.error(data.message || "خطا در اتصال به درگاه");
      }
    } catch {
      toast.error("خطای شبکه");
    } finally {
      setIsPending(false);
    }
  };

  return { startPayment, isPending };
};